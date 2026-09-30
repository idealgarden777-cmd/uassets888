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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, {
      ok: false,
      error: "Method not allowed",
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

    const id = cleanText(body.id).toLowerCase();
    const name = cleanText(body.name);
    const description = cleanText(body.description);

    let sortOrder = Number(body.sort_order);

    if (!Number.isFinite(sortOrder)) {
      sortOrder = 0;
    }

    sortOrder = Math.trunc(sortOrder);

    const isActive =
      typeof body.is_active === "boolean"
        ? body.is_active
        : true;

    if (!id) {
      return json(res, 400, {
        ok: false,
        error: "Category ID is required.",
      });
    }

    if (!validId(id)) {
      return json(res, 400, {
        ok: false,
        error:
          "Category ID may only contain lowercase letters, numbers, and hyphens.",
      });
    }

    if (!name) {
      return json(res, 400, {
        ok: false,
        error: "Category name is required.",
      });
    }

    if (name.length > 80) {
      return json(res, 400, {
        ok: false,
        error: "Category name is too long.",
      });
    }

    if (description.length > 500) {
      return json(res, 400, {
        ok: false,
        error: "Category description is too long.",
      });
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/uasset_categories`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          id,
          name,
          description: description || null,
          sort_order: sortOrder,
          is_active: isActive,
          created_by_bean_user_id: admin.beanUserId,
        }),
      }
    );

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 409) {
        return json(res, 409, {
          ok: false,
          error: "A category with this ID already exists.",
        });
      }

      return json(res, response.status, {
        ok: false,
        error:
          data?.message ||
          data?.error ||
          "Failed to create category.",
      });
    }

    const category = Array.isArray(data) ? data[0] : data;

    return json(res, 201, {
      ok: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error("Category create error:", error);

    return json(res, 500, {
      ok: false,
      error: "Internal server error.",
    });
  }
}
