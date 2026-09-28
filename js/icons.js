/* =========================================================
   UASSET — PUBLIC ICONS API
   Reads active icon metadata from Supabase
   SVG files are not exposed here
   ========================================================= */

const SUPABASE_TABLE =
  "uasset_icons";


/* =========================================================
   REQUIRED ENVIRONMENT
   ========================================================= */

function getRequiredEnv(name) {
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
   HANDLER
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
    "no-store"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
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

    return res
      .status(405)
      .json({
        success:
          false,

        error:
          "Method not allowed"
      });
  }


  /* =======================================================
     ENVIRONMENT
     ======================================================= */

  let supabaseUrl;
  let serviceRoleKey;

  try {

    supabaseUrl =
      getRequiredEnv(
        "SUPABASE_URL"
      );

    serviceRoleKey =
      getRequiredEnv(
        "SUPABASE_SERVICE_ROLE_KEY"
      );

  } catch (error) {

    console.error(
      "UAsset icons API configuration error:",
      error.message
    );

    return res
      .status(500)
      .json({
        success:
          false,

        error:
          "Icon service configuration is incomplete"
      });
  }


  /* =======================================================
     DATABASE QUERY
     ======================================================= */

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
      "created_at",
      "updated_at"
    ].join(",")
  );

  query.set(
    "is_active",
    "eq.true"
  );

  query.set(
    "order",
    "created_at.asc"
  );


  /* =======================================================
     SUPABASE REQUEST
     ======================================================= */

  try {

    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`,
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


    /* =====================================================
       SUPABASE ERROR
       ===================================================== */

    if (
      !response.ok
    ) {

      console.error(
        "UAsset icons database error:",
        {
          status:
            response.status,

          response:
            data
        }
      );


      return res
        .status(500)
        .json({
          success:
            false,

          error:
            "Unable to load icon library"
        });
    }


    /* =====================================================
       NORMALIZE RESPONSE
       ===================================================== */

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

              pro:
                icon.plan ===
                "pro",

              storageBucket:
                icon.storage_bucket,

              storagePath:
                icon.storage_path,

              isActive:
                icon.is_active ===
                true
            })
          )
        : [];


    /* =====================================================
       SUCCESS
       ===================================================== */

    return res
      .status(200)
      .json({
        success:
          true,

        count:
          icons.length,

        icons
      });


  } catch (error) {

    console.error(
      "UAsset icons API failed:",
      error
    );


    return res
      .status(500)
      .json({
        success:
          false,

        error:
          "Unable to load icon library"
      });
  }
}
