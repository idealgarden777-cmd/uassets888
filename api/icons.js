/* =========================================================
   UASSET — PUBLIC ICONS API
   Reads active icon metadata from Supabase
   Free SVG URLs are public
   Pro SVG files remain private
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
   ERROR RESPONSE
   ========================================================= */

function sendError(
  res,
  status,
  message,
  code
) {

  return res
    .status(status)
    .json({
      success: false,
      error: message,
      code
    });
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

    return sendError(
      res,
      405,
      "Method not allowed",
      "METHOD_NOT_ALLOWED"
    );
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
      error
    );

    return sendError(
      res,
      500,
      "Icon service configuration is incomplete",
      "CONFIGURATION_ERROR"
    );
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
      "is_active"
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
     FETCH ICONS FROM SUPABASE
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
       DATABASE ERROR
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


      return sendError(
        res,
        500,
        "Unable to load icon library",
        "DATABASE_ERROR"
      );
    }


    /* =====================================================
       NORMALIZE ICONS
       ===================================================== */

    const icons =
      Array.isArray(
        data
      )
        ? data.map(
            icon => {

              const isPro =
                icon.plan ===
                "pro";


              let freeSvgUrl =
                null;


              /*
                Only Free assets get a public URL.

                Pro assets stay private and are handled
                separately by /api/assets/pro
              */

              if (
                !isPro &&
                icon.storage_bucket &&
                icon.storage_path
              ) {

                const encodedPath =
                  String(
                    icon.storage_path
                  )
                    .split("/")
                    .map(
                      part =>
                        encodeURIComponent(
                          part
                        )
                    )
                    .join("/");


                freeSvgUrl =
                  `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(
                    icon.storage_bucket
                  )}/${encodedPath}`;
              }


              return {

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

                pro:
                  isPro,

                plan:
                  isPro
                    ? "pro"
                    : "free",

                svg:
                  null,

                svgUrl:
                  freeSvgUrl,

                isActive:
                  icon.is_active ===
                  true
              };
            }
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


    return sendError(
      res,
      500,
      "Unable to load icon library",
      "ICONS_API_ERROR"
    );
  }
}
