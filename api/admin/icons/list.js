/* =========================================================
   UASSET ADMIN — LIST ICONS API
   Bean authentication
   Server-side admin authorization
   Reads icon metadata from Supabase
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const SUPABASE_TABLE =
  "uasset_icons";


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
   ERROR
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
      String(
        user.id
      )
    )
  );
}


/* =========================================================
   HANDLER
   ========================================================= */

export default async function handler(
  req,
  res
) {

  /* -------------------------------------------------------
     SECURITY HEADERS
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     METHOD
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     BEAN AUTH
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     ADMIN AUTHORIZATION
     ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     ENVIRONMENT
     ------------------------------------------------------- */

  let supabaseUrl;
  let serviceRoleKey;

  try {

    supabaseUrl =
      requiredEnv(
        "SUPABASE_URL"
      );

    serviceRoleKey =
      requiredEnv(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

  } catch (error) {

    console.error(
      "UAsset admin icon configuration error:",
      error
    );

    return jsonError(
      res,
      500,
      "Icon service configuration is incomplete",
      "CONFIGURATION_ERROR"
    );
  }


  /* -------------------------------------------------------
     DATABASE QUERY
     ------------------------------------------------------- */

  const query =
    new URLSearchParams();


  query.set(
    "select",
    [
      "id",
      "name",
      "category",
      "tags",
      "description",
      "plan",
      "storage_bucket",
      "storage_path",
      "is_active",
      "created_by_bean_user_id",
      "created_at",
      "updated_at"
    ].join(",")
  );


  query.set(
    "order",
    "created_at.desc"
  );


  /* -------------------------------------------------------
     SUPABASE
     ------------------------------------------------------- */

  try {

    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/uasset_icons?${query.toString()}`,
        {
          method:
            "GET",

          headers: {

            apikey:
              serviceRoleKey,

            Authorization:
              `Bearer ${serviceRoleKey}`,

            Accept:
              "application/json"

          },

          cache:
            "no-store"
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

      console.error(
        "UAsset admin icons database error:",
        {
          status:
            response.status,

          response:
            data
        }
      );

      return jsonError(
        res,
        500,
        "Unable to load admin icon library",
        "DATABASE_ERROR"
      );
    }


    const icons =
      Array.isArray(
        data
      )
        ? data.map(
            icon => ({

              id:
                icon.id,

              name:
                icon.name,

              category:
                icon.category,

              tags:
                Array.isArray(
                  icon.tags
                )
                  ? icon.tags
                  : [],

              description:
                icon.description ||
                "",

              plan:
                icon.plan ===
                "pro"
                  ? "pro"
                  : "free",

              storageBucket:
                icon.storage_bucket,

              storagePath:
                icon.storage_path,

              isActive:
                icon.is_active ===
                true,

              createdBy:
                icon.created_by_bean_user_id,

              createdAt:
                icon.created_at,

              updatedAt:
                icon.updated_at

            })
          )
        : [];


    /* -----------------------------------------------------
       STATS
       ----------------------------------------------------- */

    const totalIcons =
      icons.length;


    const freeIcons =
      icons.filter(
        icon =>
          icon.plan ===
          "free"
      ).length;


    const proIcons =
      icons.filter(
        icon =>
          icon.plan ===
          "pro"
      ).length;


    const activeIcons =
      icons.filter(
        icon =>
          icon.isActive
      ).length;


    const hiddenIcons =
      icons.filter(
        icon =>
          !icon.isActive
      ).length;


    const categoryCount =
      new Set(
        icons.map(
          icon =>
            icon.category
        )
      ).size;


    /* -----------------------------------------------------
       SUCCESS
       ----------------------------------------------------- */

    return res
      .status(200)
      .json({

        success:
          true,

        icons,

        stats: {

          totalIcons,

          freeIcons,

          proIcons,

          activeIcons,

          hiddenIcons,

          categoryCount

        }

      });


  } catch (error) {

    console.error(
      "UAsset admin icons API failed:",
      error
    );

    return jsonError(
      res,
      500,
      "Unable to load admin icon library",
      "ICONS_API_ERROR"
    );
  }
}
