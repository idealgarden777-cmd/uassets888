/* =========================================================
   UASSET ADMIN — UPDATE COLLECTION API
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
   REQUEST BODY
   ========================================================= */

function getRequestBody(
  req
) {

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


  return (
    body &&
    typeof body ===
      "object"
  )
    ? body
    : {};
}


/* =========================================================
   NORMALIZE CATEGORIES
   ========================================================= */

function normalizeCategories(
  value
) {

  if (
    !Array.isArray(
      value
    )
  ) {

    return [];
  }


  return [
    ...new Set(

      value

        .map(
          category =>
            cleanText(
              category,
              80
            )
        )

        .filter(Boolean)

    )
  ]
    .slice(
      0,
      30
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
   UPDATE COLLECTION
   ========================================================= */

async function updateCollection(
  id,
  patch
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
          "PATCH",

        headers: {

          "Content-Type":
            "application/json",

          Accept:
            "application/json",

          Prefer:
            "return=representation"

        },

        body:
          JSON.stringify(
            patch
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
        `Database update failed (${response.status})`
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
    req.method !== "PATCH" &&
    req.method !== "POST"
  ) {

    res.setHeader(
      "Allow",
      "PATCH, POST"
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
     BODY
     ======================================================= */

  const body =
    getRequestBody(
      req
    );


  /* =======================================================
     COLLECTION ID
     ======================================================= */

  const id =
    cleanText(
      body.id ||
      body.collectionId,
      60
    )
      .toLowerCase();


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
     GET EXISTING COLLECTION
     ======================================================= */

  let existing;


  try {

    existing =
      await getCollection(
        id
      );

  } catch (error) {

    console.error(
      "UAsset get collection failed:",
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
     BUILD PATCH
     ======================================================= */

  const patch = {};


  /* =======================================================
     NAME
     ======================================================= */

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "name"
    )
  ) {

    const name =
      cleanText(
        body.name,
        120
      );


    if (!name) {

      return jsonError(
        res,
        400,
        "Collection name cannot be empty",
        "INVALID_NAME"
      );
    }


    patch.name =
      name;
  }


  /* =======================================================
     DESCRIPTION
     ======================================================= */

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "description"
    )
  ) {

    const description =
      cleanText(
        body.description,
        1000
      );


    patch.description =
      description ||
      null;
  }


  /* =======================================================
     CATEGORIES
     ======================================================= */

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "categories"
    )
  ) {

    const categories =
      normalizeCategories(
        body.categories
      );


    if (
      categories.length ===
      0
    ) {

      return jsonError(
        res,
        400,
        "At least one category is required",
        "INVALID_CATEGORIES"
      );
    }


    patch.categories =
      categories;
  }


  /* =======================================================
     ACTIVE / INACTIVE
     ======================================================= */

  let hasActiveValue =
    false;


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "is_active"
    )
  ) {

    if (
      typeof body.is_active !==
      "boolean"
    ) {

      return jsonError(
        res,
        400,
        "is_active must be true or false",
        "INVALID_ACTIVE_STATE"
      );
    }


    patch.is_active =
      body.is_active;


    hasActiveValue =
      true;
  }


  if (
    !hasActiveValue &&
    Object.prototype.hasOwnProperty.call(
      body,
      "isActive"
    )
  ) {

    if (
      typeof body.isActive !==
      "boolean"
    ) {

      return jsonError(
        res,
        400,
        "isActive must be true or false",
        "INVALID_ACTIVE_STATE"
      );
    }


    patch.is_active =
      body.isActive;
  }


  /* =======================================================
     UPDATED AT
     ======================================================= */

  patch.updated_at =
    new Date().toISOString();


  /* =======================================================
     EMPTY UPDATE PROTECTION
     ======================================================= */

  const updateKeys =
    Object.keys(
      patch
    );


  if (
    updateKeys.length ===
    1 &&
    updateKeys[0] ===
      "updated_at"
  ) {

    return jsonError(
      res,
      400,
      "No collection changes were provided",
      "NO_CHANGES"
    );
  }


  /* =======================================================
     DATABASE UPDATE
     ======================================================= */

  try {

    const updated =
      await updateCollection(
        id,
        patch
      );


    return res
      .status(200)
      .json({

        success:
          true,

        collection:
          updated ||
          {
            ...existing,
            ...patch
          }

      });


  } catch (error) {

    console.error(
      "UAsset update collection failed:",
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
       DUPLICATE / CONFLICT
       ----------------------------------------------------- */

    if (
      error?.status ===
      409
    ) {

      return jsonError(
        res,
        409,
        "Collection update conflict",
        "COLLECTION_UPDATE_CONFLICT"
      );
    }


    /* -----------------------------------------------------
       DATABASE ERROR
       ----------------------------------------------------- */

    if (
      error?.message?.startsWith(
        "Database update failed"
      )
    ) {

      return jsonError(
        res,
        500,
        "Collection could not be updated in database",
        "DATABASE_UPDATE_FAILED"
      );
    }


    /* -----------------------------------------------------
       GENERIC ERROR
       ----------------------------------------------------- */

    return jsonError(
      res,
      500,
      "Unable to update collection",
      "COLLECTION_UPDATE_FAILED"
    );
  }
}
