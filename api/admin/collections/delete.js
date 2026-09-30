/* =========================================================
   UASSET ADMIN — DELETE COLLECTION API
   Bean authentication
   Server-side admin authorization
   Supabase database
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const COLLECTIONS_TABLE =
  "uasset_collections";


/* =========================================================
   REQUIRED ENV
   ========================================================= */

function requiredEnv(name) {

  const value =
    process.env[name];

  if (
    !value ||
    !String(value).trim()
  ) {

    throw new Error(
      `${name} is missing`
    );
  }

  return String(
    value
  ).trim();
}


/* =========================================================
   JSON ERROR
   ========================================================= */

function jsonError(
  res,
  status,
  error,
  code
) {

  return res
    .status(status)
    .json({

      success:
        false,

      error,

      code

    });
}


/* =========================================================
   BEAN SESSION
   ========================================================= */

async function getBeanUser(
  req
) {

  const cookie =
    req.headers.cookie;

  if (!cookie) {
    return null;
  }


  const response =
    await fetch(
      ACCOUNTS_SESSION_URL,
      {
        method:
          "GET",

        headers: {

          Accept:
            "application/json",

          Cookie:
            cookie

        },

        cache:
          "no-store"
      }
    );


  const data =
    await response
      .json()
      .catch(
        () => ({})
      );


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

function isAdminUser(
  user
) {

  const raw =
    process.env.UASSET_ADMIN_BEAN_IDS ||
    "";


  const allowedIds =
    raw
      .split(",")
      .map(
        value =>
          value.trim()
      )
      .filter(Boolean);


  return (
    !!user &&
    !!user.id &&
    allowedIds.includes(
      String(
        user.id
      )
    )
  );
}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanText(
  value,
  maxLength
) {

  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      maxLength
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
    requiredEnv(
      "SUPABASE_URL"
    );


  const serviceRoleKey =
    requiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );


  return fetch(
    supabaseUrl + path,
    {

      ...options,

      headers: {

        apikey:
          serviceRoleKey,

        Authorization:
          "Bearer " +
          serviceRoleKey,

        ...(options.headers || {})

      },

      cache:
        "no-store"

    }
  );
}


/* =========================================================
   GET COLLECTION
   ========================================================= */

async function getCollection(
  id
) {

  const params =
    new URLSearchParams();


  params.set(
    "select",
    "id,name,description,categories,is_active,created_by_bean_user_id,created_at,updated_at"
  );


  params.set(
    "id",
    `eq.${id}`
  );


  params.set(
    "limit",
    "1"
  );


  const response =
    await supabaseRequest(
      `/rest/v1/${COLLECTIONS_TABLE}?${params.toString()}`,
      {
        method:
          "GET",

        headers: {

          Accept:
            "application/json"

        }
      }
    );


  const data =
    await response
      .json()
      .catch(
        () => null
      );


  if (
    !response.ok
  ) {

    const error =
      new Error(
        `Database query failed (${response.status})`
      );


    error.status =
      response.status;


    error.data =
      data;


    throw error;
  }


  return Array.isArray(
    data
  )
    ? data[0] ||
      null
    : null;
}


/* =========================================================
   DELETE COLLECTION
   ========================================================= */

async function deleteCollection(
  id
) {

  const params =
    new URLSearchParams();


  params.set(
    "id",
    `eq.${id}`
  );


  const response =
    await supabaseRequest(
      `/rest/v1/${COLLECTIONS_TABLE}?${params.toString()}`,
      {

        method:
          "DELETE",

        headers: {

          Accept:
            "application/json",

          Prefer:
            "return=representation"

        }

      }
    );


  const data =
    await response
      .json()
      .catch(
        () => null
      );


  if (
    !response.ok
  ) {

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


  return Array.isArray(
    data
  )
    ? data[0] ||
      null
    : data;
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
    req.method !==
    "DELETE"
  ) {

    res.setHeader(
      "Allow",
      "DELETE"
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
      await getBeanUser(
        req
      );

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

  if (
    !isAdminUser(
      user
    )
  ) {

    return jsonError(
      res,
      403,
      "UAsset admin access required",
      "ADMIN_REQUIRED"
    );
  }


  /* =======================================================
     COLLECTION ID
     ======================================================= */

  const body =
    req.body &&
    typeof req.body ===
      "object"
    ? req.body
    : {};


  const id =
    cleanText(
      body.id ||
      body.collectionId ||
      req.query?.id ||
      req.query?.collectionId,
      60
    )
      .toLowerCase();


  /* =======================================================
     VALIDATE ID
     ======================================================= */

  if (
    !id ||
    !/^[a-z0-9-]+$/.test(
      id
    )
  ) {

    return jsonError(
      res,
      400,
      "Valid collection ID is required",
      "INVALID_ID"
    );
  }


  /* =======================================================
     LOAD EXISTING COLLECTION
     ======================================================= */

  let existing;


  try {

    existing =
      await getCollection(
        id
      );

  } catch (error) {

    console.error(
      "UAsset get collection before delete failed:",
      error
    );


    return jsonError(
      res,
      500,
      "Unable to load collection",
      "COLLECTION_LOAD_FAILED"
    );
  }


  if (!existing) {

    return jsonError(
      res,
      404,
      "Collection not found",
      "COLLECTION_NOT_FOUND"
    );
  }


  /* =======================================================
     DELETE
     ======================================================= */

  try {

    const deleted =
      await deleteCollection(
        id
      );


    return res
      .status(200)
      .json({

        success:
          true,

        message:
          "Collection deleted successfully",

        collection:
          deleted ||
          existing

      });


  } catch (error) {

    console.error(
      "UAsset delete collection failed:",
      {

        message:
          error?.message,

        status:
          error?.status,

        data:
          error?.data,

        id

      }
    );


    /* -----------------------------------------------------
       FOREIGN KEY / CONFLICT
       ----------------------------------------------------- */

    if (
      error?.status ===
        409 ||
      error?.status ===
        400
    ) {

      return jsonError(
        res,
        409,
        "Collection cannot be deleted because it is still in use",
        "COLLECTION_IN_USE"
      );
    }


    /* -----------------------------------------------------
       DATABASE ERROR
       ----------------------------------------------------- */

    if (
      error?.message?.startsWith(
        "Database delete failed"
      )
    ) {

      return jsonError(
        res,
        500,
        "Collection could not be deleted from database",
        "DATABASE_DELETE_FAILED"
      );
    }


    /* -----------------------------------------------------
       GENERIC ERROR
       ----------------------------------------------------- */

    return jsonError(
      res,
      500,
      "Unable to delete collection",
      "COLLECTION_DELETE_FAILED"
    );
  }
}
