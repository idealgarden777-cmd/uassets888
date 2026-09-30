const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const ADMIN_BEAN_IDS = (process.env.UASSET_ADMIN_BEAN_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function json(res, status, data) {
  res.status(status).json(data);
}

function getCookieHeader(req) {
  return req.headers?.cookie || "";
}

async function verifyAdmin(req) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(ACCOUNTS_SESSION_URL, {
    method: "GET",
    headers: {
      cookie: getCookieHeader(req),
      accept: "application/json",
    },
  });

  if (!response.ok) {
    return {
      ok: false,
      reason: "Unauthorized",
    };
  }

  const session = await response.json();

  const beanUserId =
    session?.user?.bean_user_id ||
    session?.user?.beanUserId ||
    session?.bean_user_id ||
    session?.beanUserId ||
    null;

  if (!beanUserId) {
    return {
      ok: false,
      reason: "No Bean user found",
    };
  }

  if (!ADMIN_BEAN_IDS.includes(String(beanUserId))) {
    return {
      ok: false,
      reason: "Admin access required",
    };
  }

  return {
    ok: true,
    beanUserId: String(beanUserId),
  };
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validId(value) {
  return /^[a-z0-9-]+$/.test(value);
}

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");

    return json(res, 405, {
      ok: false,
      error: "Method not allowed.",
    });
  }

  try {
    const admin = await verifyAdmin(req);

    if (!admin.ok) {
      return json(res, 403, {
        ok: false,
        error: admin.reason,
      });
    }

    const body = req.body || {};

    const id = cleanText(
      body.id || req.query?.id
    ).toLowerCase();

    if (!id) {
      return json(res, 400, {
        ok: false,
        error: "Category ID is required.",
      });
    }

    if (!validId(id)) {
      return json(res, 400, {
        ok: false,
        error: "Invalid category ID.",
      });
    }

    // Check that the category exists first.
    const lookupParams = new URLSearchParams();

    lookupParams.set("id", `eq.${id}`);
    lookupParams.set("select", "id,name");

    const lookupResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/uasset_categories?${lookupParams.toString()}`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: "application/json",
        },
      }
    );

    const lookupText = await lookupResponse.text();

    let lookupData = null;

    try {
      lookupData = lookupText ? JSON.parse(lookupText) : null;
    } catch {
      lookupData = null;
    }

    if (!lookupResponse.ok) {
      return json(res, lookupResponse.status, {
        ok: false,
        error:
          lookupData?.message ||
          lookupData?.error ||
          "Failed to find category.",
      });
    }

    const existingCategory =
      Array.isArray(lookupData) ? lookupData[0] : null;

    if (!existingCategory) {
      return json(res, 404, {
        ok: false,
        error: "Category not found.",
      });
    }

    // Delete category.
    const deleteParams = new URLSearchParams();

    deleteParams.set("id", `eq.${id}`);

    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/uasset_categories?${deleteParams.toString()}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: "application/json",
          Prefer: "return=representation",
        },
      }
    );

    const deleteText = await deleteResponse.text();

    let deleteData = null;

    try {
      deleteData = deleteText ? JSON.parse(deleteText) : null;
    } catch {
      deleteData = null;
    }

    if (!deleteResponse.ok) {
      return json(res, deleteResponse.status, {
        ok: false,
        error:
          deleteData?.message ||
          deleteData?.error ||
          "Failed to delete category.",
      });
    }

    return json(res, 200, {
      ok: true,
      message: "Category deleted successfully.",
      category: {
        id: existingCategory.id,
        name: existingCategory.name,
      },
    });
  } catch (error) {
    console.error("Category delete error:", error);

    return json(res, 500, {
      ok: false,
      error: "Internal server error.",
    });
  }
}
