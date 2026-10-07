/* =========================================================
   UASSET — PUBLIC CATALOG API

   GET /api/categories   → active categories (sorted)
   GET /api/collections  → active collections

   Read-only. Uses the service role on the server only,
   and returns just the public, display-safe columns.
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


function setPublicHeaders(res) {

  /*
    Short shared cache: admin edits show up
    within a minute, without hammering Supabase.
  */

  res.setHeader(
    "Cache-Control",
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
  );
}


async function selectRows(
  table,
  params
) {

  const supabaseUrl =
    getRequiredEnv(
      "SUPABASE_URL"
    );

  const serviceRoleKey =
    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

  const response =
    await fetch(
      `${supabaseUrl}/rest/v1/${table}?${params.toString()}`,
      {
        method: "GET",

        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: "application/json"
        },

        cache: "no-store"
      }
    );

  const data =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {

    const error =
      new Error(
        `Supabase ${table} query failed (${response.status})`
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return Array.isArray(data)
    ? data
    : [];
}


function guard(
  req,
  res
) {

  setPublicHeaders(res);

  if (req.method !== "GET") {

    res.setHeader(
      "Allow",
      "GET"
    );

    sendError(
      res,
      405,
      "Method not allowed",
      "METHOD_NOT_ALLOWED"
    );

    return false;
  }

  return true;
}


/* =========================================================
   CATEGORIES
   ========================================================= */

export async function categoriesHandler(
  req,
  res
) {

  if (!guard(req, res)) {
    return;
  }

  const params =
    new URLSearchParams();

  params.set(
    "select",
    "*"
  );

  params.set(
    "is_active",
    "eq.true"
  );

  params.set(
    "order",
    "sort_order.asc,name.asc"
  );

  try {

    const rows =
      await selectRows(
        "uasset_categories",
        params
      );

    const categories =
      rows
        .filter(
          row =>
            row &&
            (row.name || row.id)
        )
        .map(
          row => ({
            id:
              String(row.id || row.name),

            name:
              String(row.name || row.id),

            description:
              row.description || "",

            sortOrder:
              Number(row.sort_order) || 0
          })
        );

    return res
      .status(200)
      .json({
        success: true,
        count: categories.length,
        categories
      });

  } catch (error) {

    console.error(
      "UAsset public categories failed:",
      {
        message: error?.message,
        status: error?.status,
        data: error?.data
      }
    );

    return sendError(
      res,
      500,
      "Unable to load categories",
      "CATEGORIES_API_ERROR"
    );
  }
}


/* =========================================================
   COLLECTIONS
   ========================================================= */

export async function collectionsHandler(
  req,
  res
) {

  if (!guard(req, res)) {
    return;
  }

  const params =
    new URLSearchParams();

  params.set(
    "select",
    "*"
  );

  params.set(
    "is_active",
    "eq.true"
  );

  params.set(
    "order",
    "created_at.asc"
  );

  try {

    const rows =
      await selectRows(
        "uasset_collections",
        params
      );

    const collections =
      rows
        .filter(
          row =>
            row &&
            row.id &&
            row.name
        )
        .map(
          row => ({
            id:
              String(row.id),

            name:
              String(row.name),

            description:
              row.description || "",

            categories:
              Array.isArray(row.categories)
                ? row.categories
                    .map(String)
                    .filter(Boolean)
                : []
          })
        )
        .filter(
          collection =>
            collection.categories.length > 0
        );

    return res
      .status(200)
      .json({
        success: true,
        count: collections.length,
        collections
      });

  } catch (error) {

    console.error(
      "UAsset public collections failed:",
      {
        message: error?.message,
        status: error?.status,
        data: error?.data
      }
    );

    return sendError(
      res,
      500,
      "Unable to load collections",
      "COLLECTIONS_API_ERROR"
    );
  }
}
