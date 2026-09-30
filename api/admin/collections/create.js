/* =========================================================
   UASSET ADMIN — CREATE COLLECTION API
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
   CREATE COLLECTION
   ========================================================= */

async function insertCollection(
  collection
) {

  const response =
    await supabaseRequest(
      `/rest/v1/${COLLECTIONS_TABLE}`,
      {

        method:
          "POST",

        headers: {

          "Content-Type":
            "application/json",

          Prefer:
            "return=representation"

        },

        body:
          JSON.stringify(
            collection
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
        `Database insert failed (${response.status})`
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
     NORMALIZE DATA
     ======================================================= */

  const id =
    cleanText(
      body.id,
      60
    )
      .toLowerCase();


  const name =
    cleanText(
      body.name,
      120
    );


  const description =
    cleanText(
      body.description,
      1000
    );


  const categories =
    normalizeCategories(
      body.categories
    );


  const isActive =
    body.is_active ===
      false
      ? false
      : (
          body.isActive ===
          false
            ? false
            : true
        );


  /* =======================================================
     VALIDATION — ID
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
      "Collection ID must contain only lowercase letters, numbers and hyphens",
      "INVALID_ID"
    );
  }


  /* =======================================================
     VALIDATION — NAME
     ======================================================= */

  if (
    !name
  ) {

    return jsonError(
      res,
      400,
      "Collection name is required",
      "INVALID_NAME"
    );
  }


  /* =======================================================
     VALIDATION — CATEGORIES
     ======================================================= */

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


  /* =======================================================
     COLLECTION ROW
     ======================================================= */

  const collection = {

    id,

    name,

    description:
      description ||
      null,

    categories,

    is_active:
      isActive,

    created_by_bean_user_id:
      String(
        user.id
      )

  };


  /* =======================================================
     INSERT
     ======================================================= */

  try {

    const row =
      await insertCollection(
        collection
      );


    return res
      .status(201)
      .json({

        success:
          true,

        collection:
          row

      });


  } catch (error) {

    console.error(
      "UAsset create collection failed:",
      {

        message:
          error?.message,

        status:
          error?.status,

        data:
          error?.data,

        id,

        name,

        categories

      }
    );


    /* -----------------------------------------------------
       DUPLICATE
       ----------------------------------------------------- */

    if (
      error?.status ===
      409
    ) {

      return jsonError(
        res,
        409,
        "A collection with this ID already exists",
        "COLLECTION_EXISTS"
      );
    }


    /* -----------------------------------------------------
       DATABASE ERROR
       ----------------------------------------------------- */

    if (
      error?.message?.startsWith(
        "Database insert failed"
      )
    ) {

      return jsonError(
        res,
        500,
        "Collection could not be saved to database",
        "DATABASE_INSERT_FAILED"
      );
    }


    /* -----------------------------------------------------
       GENERIC ERROR
       ----------------------------------------------------- */

    return jsonError(
      res,
      500,
      "Unable to create collection",
      "COLLECTION_CREATE_FAILED"
    );
  }
}
