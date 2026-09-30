/* =========================================================
   UASSET ADMIN — LIST COLLECTIONS API
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
   LIST COLLECTIONS
   ========================================================= */

async function listCollections(
  includeInactive
) {

  const params =
    new URLSearchParams();


  params.set(
    "select",
    "id,name,description,categories,is_active,created_by_bean_user_id,created_at,updated_at"
  );


  /*
     Admin dashboard normally needs newest
     collections first.
  */

  params.set(
    "order",
    "created_at.desc"
  );


  /*
     By default return only active collections.
     Admin can request inactive collections with:

     ?include_inactive=true
  */

  if (
    !includeInactive
  ) {

    params.set(
      "is_active",
      "eq.true"
    );
  }


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
    ? data
    : [];
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
    "GET"
  ) {

    res.setHeader(
      "Allow",
      "GET"
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
     QUERY
     ======================================================= */

  const includeInactive =
    String(
      req.query?.include_inactive ||
      req.query?.includeInactive ||
      ""
    ).toLowerCase() ===
    "true";


  /* =======================================================
     DATABASE
     ======================================================= */

  try {

    const collections =
      await listCollections(
        includeInactive
      );


    return res
      .status(200)
      .json({

        success:
          true,

        collections,

        count:
          collections.length

      });


  } catch (error) {

    console.error(
      "UAsset list collections failed:",
      {

        message:
          error?.message,

        status:
          error?.status,

        data:
          error?.data

      }
    );


    return jsonError(
      res,
      500,
      "Unable to load collections",
      "COLLECTION_LIST_FAILED"
    );
  }
}
