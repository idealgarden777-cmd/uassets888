/* =========================================================
   UASSET ADMIN — CREATE ICON API
   Bean authentication
   Server-side admin authorization
   Supabase database + storage
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const DEFAULT_FREE_BUCKET =
  "uasset-free";

const DEFAULT_PRO_BUCKET =
  "uasset-pro";


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

  return String(value).trim();
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
      success: false,
      error,
      code
    });
}


/* =========================================================
   BEAN SESSION
   ========================================================= */

async function getBeanUser(req) {
  const cookie =
    req.headers.cookie;

  if (!cookie) {
    return null;
  }

  const response =
    await fetch(
      ACCOUNTS_SESSION_URL,
      {
        method: "GET",

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

function isAdminUser(user) {
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
      String(user.id)
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
   SVG VALIDATION
   ========================================================= */

function validateSvg(svg) {
  const value =
    String(
      svg || ""
    ).trim();

  return (
    value.length > 0 &&
    value.length <= 200000 &&
    /^<svg\b/i.test(
      value
    ) &&
    /<\/svg>\s*$/i.test(
      value
    )
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

  const response =
    await fetch(
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

  return response;
}


/* =========================================================
   UPLOAD SVG
   ========================================================= */

async function uploadSvg(
  bucket,
  filePath,
  svg
) {
  const safePath =
    filePath
      .split("/")
      .map(
        part =>
          encodeURIComponent(
            part
          )
      )
      .join("/");

  const response =
    await supabaseRequest(
      "/storage/v1/object/" +
        encodeURIComponent(
          bucket
        ) +
        "/" +
        safePath,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "image/svg+xml",

          "x-upsert":
            "false"
        },

        body:
          svg
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
        "Storage upload failed (" +
          response.status +
          ")"
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}


/* =========================================================
   REMOVE SVG
   ========================================================= */

async function removeSvg(
  bucket,
  filePath
) {
  try {
    const safePath =
      filePath
        .split("/")
        .map(
          part =>
            encodeURIComponent(
              part
            )
        )
        .join("/");

    await supabaseRequest(
      "/storage/v1/object/" +
        encodeURIComponent(
          bucket
        ) +
        "/" +
        safePath,
      {
        method:
          "DELETE"
      }
    );

  } catch (error) {
    console.error(
      "UAsset storage cleanup failed:",
      error
    );
  }
}


/* =========================================================
   DATABASE INSERT
   ========================================================= */

async function insertIcon(
  icon
) {
  const response =
    await supabaseRequest(
      "/rest/v1/uasset_icons",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Prefer:
            "return=representation"
        },

        body:
          JSON.stringify(
            icon
          )
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
        "Database insert failed (" +
          response.status +
          ")"
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
    ? data[0]
    : data;
}


/* =========================================================
   MAIN HANDLER
   ========================================================= */

export default async function handler(
  req,
  res
) {

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


  if (
    req.method !==
    "POST"
  ) {
    res.setHeader(
      "Allow",
      "POST"
    );

    return jsonError(
      res,
      405,
      "Method not allowed",
      "METHOD_NOT_ALLOWED"
    );
  }


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


  let body =
    req.body ||
    {};


  if (
    typeof body ===
    "string"
  ) {
    try {

      body =
        JSON.parse(
          body
        );

    } catch {

      body =
        {};
    }
  }


  const id =
    cleanText(
      body.id,
      60
    ).toLowerCase();

  const name =
    cleanText(
      body.name,
      120
    );

  const category =
    cleanText(
      body.category,
      80
    );

  const description =
    cleanText(
      body.description,
      1000
    );

  const plan =
    String(
      body.plan ||
        "free"
    ).toLowerCase() ===
    "pro"
      ? "pro"
      : "free";


  const tags =
    Array.isArray(
      body.tags
    )
      ? body.tags
          .map(
            tag =>
              cleanText(
                tag,
                40
              ).toLowerCase()
          )
          .filter(Boolean)
          .slice(
            0,
            20
          )
      : [];


  const svg =
    String(
      body.svg ||
        ""
    ).trim();


  if (
    !/^[a-z0-9-]+$/.test(
      id
    )
  ) {

    return jsonError(
      res,
      400,
      "Icon ID must contain only lowercase letters, numbers and hyphens",
      "INVALID_ID"
    );
  }


  if (!name) {

    return jsonError(
      res,
      400,
      "Icon name is required",
      "INVALID_NAME"
    );
  }


  if (!category) {

    return jsonError(
      res,
      400,
      "Icon category is required",
      "INVALID_CATEGORY"
    );
  }


  if (
    !validateSvg(
      svg
    )
  ) {

    return jsonError(
      res,
      400,
      "Complete SVG markup is required",
      "INVALID_SVG"
    );
  }


  const bucket =
    plan === "pro"
      ? (
          process.env
            .UASSET_PRO_BUCKET ||
          DEFAULT_PRO_BUCKET
        )
      : (
          process.env
            .UASSET_FREE_BUCKET ||
          DEFAULT_FREE_BUCKET
        );


  const storagePath =
    id +
    ".svg";


  let uploaded =
    false;


  try {

    await uploadSvg(
      bucket,
      storagePath,
      svg
    );

    uploaded =
      true;


    const row =
      await insertIcon({
        id,

        name,

        category,

        tags,

        description:
          description ||
          null,

        plan,

        storage_bucket:
          bucket,

        storage_path:
          storagePath,

        is_active:
          true,

        created_by_bean_user_id:
          String(
            user.id
          )
      });


    return res
      .status(201)
      .json({
        success:
          true,

        icon:
          row
      });


  } catch (error) {

    console.error(
      "UAsset create icon failed:",
      {
        message:
          error?.message,

        status:
          error?.status,

        data:
          error?.data,

        id,

        plan,

        bucket,

        storagePath
      }
    );


    if (
      uploaded
    ) {

      await removeSvg(
        bucket,
        storagePath
      );
    }


    if (
      error?.status ===
      409
    ) {

      return jsonError(
        res,
        409,
        "An icon with this ID already exists",
        "ICON_EXISTS"
      );
    }


    if (
      error?.message?.startsWith(
        "Storage upload failed"
      )
    ) {

      return jsonError(
        res,
        500,
        "Icon SVG could not be uploaded to storage",
        "STORAGE_UPLOAD_FAILED"
      );
    }


    if (
      error?.message?.startsWith(
        "Database insert failed"
      )
    ) {

      return jsonError(
        res,
        500,
        "Icon metadata could not be saved to database",
        "DATABASE_INSERT_FAILED"
      );
    }


    return jsonError(
      res,
      500,
      "Unable to save icon",
      "ICON_CREATE_FAILED"
    );
  }
}
