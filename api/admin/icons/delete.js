/* =========================================================
   UASSET ADMIN — DELETE ICON API
   Bean authentication
   Server-side admin authorization
   Supabase database + storage

   SAFE DELETE FLOW:
   1. Authenticate Bean user
   2. Verify admin
   3. Load icon
   4. Delete storage file
   5. Delete database row
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";


/* =========================================================
   REQUIRED ENV
   ========================================================= */

function requiredEnv(name) {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`${name} is missing`);
  }

  return String(value).trim();
}


/* =========================================================
   JSON ERROR
   ========================================================= */

function jsonError(res, status, error, code) {
  return res.status(status).json({
    success: false,
    error,
    code
  });
}


/* =========================================================
   BEAN SESSION
   ========================================================= */

async function getBeanUser(req) {
  const cookie = req.headers.cookie;

  if (!cookie) {
    return null;
  }

  const response = await fetch(
    ACCOUNTS_SESSION_URL,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
        Cookie: cookie
      },

      cache: "no-store"
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (
    !response.ok ||
    !data.authenticated ||
    !data.user
  ) {
    return null;
  }

  return data.user;
}


/* =========================================================
   ADMIN CHECK
   ========================================================= */

function isAdminUser(user) {
  const raw =
    process.env.UASSET_ADMIN_BEAN_IDS || "";

  const allowedIds = raw
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  return (
    !!user &&
    !!user.id &&
    allowedIds.includes(String(user.id))
  );
}


/* =========================================================
   SUPABASE REQUEST
   ========================================================= */

async function supabaseRequest(
  path,
  options = {}
) {
  const supabaseUrl =
    requiredEnv("SUPABASE_URL");

  const serviceRoleKey =
    requiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

  return fetch(
    supabaseUrl + path,
    {
      ...options,

      headers: {
        apikey: serviceRoleKey,

        Authorization:
          "Bearer " +
          serviceRoleKey,

        ...(options.headers || {})
      },

      cache: "no-store"
    }
  );
}


/* =========================================================
   GET ICON
   ========================================================= */

async function getIcon(id) {
  const query =
    new URLSearchParams();

  query.set(
    "select",
    [
      "id",
      "name",
      "plan",
      "storage_bucket",
      "storage_path",
      "is_active"
    ].join(",")
  );

  query.set(
    "id",
    `eq.${id}`
  );

  query.set(
    "limit",
    "1"
  );

  const response =
    await supabaseRequest(
      `/rest/v1/uasset_icons?${query.toString()}`,
      {
        method: "GET",

        headers: {
          Accept: "application/json"
        }
      }
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const error =
      new Error(
        `Database lookup failed (${response.status})`
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  if (
    !Array.isArray(data) ||
    !data[0]
  ) {
    return null;
  }

  return data[0];
}


/* =========================================================
   DELETE STORAGE FILE
   ========================================================= */

async function deleteStorageFile(
  bucket,
  filePath
) {
  if (!bucket || !filePath) {
    return {
      success: true,
      skipped: true
    };
  }

  const safePath =
    String(filePath)
      .split("/")
      .map(part =>
        encodeURIComponent(part)
      )
      .join("/");

  const response =
    await supabaseRequest(
      "/storage/v1/object/" +
        encodeURIComponent(bucket) +
        "/" +
        safePath,
      {
        method: "DELETE",

        headers: {
          Accept: "application/json"
        }
      }
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const error =
      new Error(
        `Storage delete failed (${response.status})`
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return {
    success: true,
    data
  };
}


/* =========================================================
   DELETE DATABASE ROW
   ========================================================= */

async function deleteIconRow(id) {
  const encodedId =
    encodeURIComponent(id);

  const response =
    await supabaseRequest(
      `/rest/v1/uasset_icons?id=eq.${encodedId}`,
      {
        method: "DELETE",

        headers: {
          Accept: "application/json",

          Prefer:
            "return=representation"
        }
      }
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    const error =
      new Error(
        `Database delete failed (${response.status})`
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return Array.isArray(data)
    ? data[0] || null
    : data;
}


/* =========================================================
   GET REQUEST ID
   ========================================================= */

function getRequestedId(req) {
  let id =
    req.query?.id || "";

  if (
    !id &&
    req.body &&
    typeof req.body === "object"
  ) {
    id =
      req.body.id || "";
  }

  if (
    typeof id === "object"
  ) {
    id = "";
  }

  return String(id)
    .trim()
    .toLowerCase();
}


/* =========================================================
   MAIN HANDLER
   ========================================================= */

export default async function handler(
  req,
  res
) {

  /* =======================================================
     SECURITY HEADERS
     ======================================================= */

  res.setHeader(
    "Cache-Control",
    "no-store, private"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
  );

  res.setHeader(
    "X-Frame-Options",
    "DENY"
  );


  /* =======================================================
     METHOD
     ======================================================= */

  if (
    req.method !== "DELETE" &&
    req.method !== "POST"
  ) {
    res.setHeader(
      "Allow",
      "DELETE, POST"
    );

    return jsonError(
      res,
      405,
      "Method not allowed",
      "METHOD_NOT_ALLOWED"
    );
  }


  /* =======================================================
     BEAN AUTH
     ======================================================= */

  let user;

  try {
    user =
      await getBeanUser(req);

  } catch (error) {
    console.error(
      "UAsset admin Bean verification failed:",
      error
    );

    return jsonError(
      res,
      502,
      "Unable to verify Bean account",
      "BEAN_SESSION_ERROR"
    );
  }

  if (!user) {
    return jsonError(
      res,
      401,
      "Login with Bean ID required",
      "AUTH_REQUIRED"
    );
  }


  /* =======================================================
     ADMIN AUTHORIZATION
     ======================================================= */

  if (!isAdminUser(user)) {
    return jsonError(
      res,
      403,
      "UAsset admin access required",
      "ADMIN_REQUIRED"
    );
  }


  /* =======================================================
     ICON ID
     ======================================================= */

  const id =
    getRequestedId(req);

  if (
    !id ||
    !/^[a-z0-9-]+$/.test(id)
  ) {
    return jsonError(
      res,
      400,
      "Valid icon ID is required",
      "INVALID_ID"
    );
  }


  /* =======================================================
     GET EXISTING ICON
     ======================================================= */

  let existingIcon;

  try {
    existingIcon =
      await getIcon(id);

  } catch (error) {
    console.error(
      "UAsset icon lookup failed:",
      error
    );

    return jsonError(
      res,
      500,
      "Unable to load icon",
      "ICON_LOOKUP_FAILED"
    );
  }

  if (!existingIcon) {
    return jsonError(
      res,
      404,
      "Icon not found",
      "ICON_NOT_FOUND"
    );
  }


  /* =======================================================
     STORAGE INFORMATION
     ======================================================= */

  const bucket =
    existingIcon.storage_bucket || "";

  const storagePath =
    existingIcon.storage_path || "";


  /* =======================================================
     SAFE STORAGE DELETE
     ======================================================= */

  if (
    bucket &&
    storagePath
  ) {
    try {

      await deleteStorageFile(
        bucket,
        storagePath
      );

    } catch (error) {

      console.error(
        "UAsset storage delete failed:",
        {
          id,
          bucket,
          storagePath,
          message: error?.message,
          status: error?.status,
          data: error?.data
        }
      );

      /*
        IMPORTANT:

        Database row is intentionally NOT deleted.

        This prevents the database from saying
        the icon is gone while the storage asset
        still exists.
      */

      return jsonError(
        res,
        500,
        "Icon storage could not be deleted. Database record was kept.",
        "STORAGE_DELETE_FAILED"
      );
    }
  }


  /* =======================================================
     DELETE DATABASE ROW
     ======================================================= */

  let deletedRow;

  try {

    deletedRow =
      await deleteIconRow(id);

  } catch (error) {

    console.error(
      "UAsset icon database delete failed:",
      {
        id,
        message: error?.message,
        status: error?.status,
        data: error?.data
      }
    );

    /*
      Storage was already deleted.

      The database row may remain as an orphaned
      metadata record, but the actual SVG asset
      is gone.

      This is reported explicitly so the admin
      knows the operation was only partially completed.
    */

    return res
      .status(500)
      .json({

        success: false,

        deleted: false,

        storageCleanup: true,

        databaseCleanup: false,

        error:
          "Storage was deleted but database record could not be deleted.",

        code:
          "DATABASE_DELETE_FAILED",

        iconId:
          id
      });
  }


  /* =======================================================
     SUCCESS
     ======================================================= */

  return res
    .status(200)
    .json({

      success: true,

      deleted: true,

      storageCleanup: true,

      databaseCleanup: true,

      icon:
        deletedRow
    });
}
