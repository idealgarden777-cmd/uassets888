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
  if (!["PATCH", "POST"].includes(req.method)) {
    res.setHeader("Allow", "PATCH, POST");

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

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      const name = cleanText(body.name);

      if (!name) {
        return json(res, 400, {
          ok: false,
          error: "Category name cannot be empty.",
        });
      }

      if (name.length > 80) {
        return json(res, 400, {
          ok: false,
          error: "Category name is too long.",
        });
      }

      updates.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(body, "description")) {
      const description = cleanText(body.description);

      if (description.length > 500) {
        return json(res, 400, {
          ok: false,
          error: "Category description is too long.",
        });
      }

      updates.description = description || null;
    }

    if (Object.prototype.hasOwnProperty.call(body, "sort_order")) {
      const sortOrder = Number(body.sort_order);

      if (!Number.isFinite(sortOrder)) {
        return json(res, 400, {
          ok: false,
          error: "sort_order must be a valid number.",
        });
      }

      updates.sort_order = Math.trunc(sortOrder);
    }

    if (Object.prototype.hasOwnProperty.call(body, "is_active")) {
      if (typeof body.is_active !== "boolean") {
        return json(res, 400, {
          ok: false,
          error: "is_active must be true or false.",
        });
      }

      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return json(res, 400, {
        ok: false,
        error: "No valid fields were provided for update.",
      });
    }

    updates.updated_at = new Date().toISOString();

    const params = new URLSearchParams();

    params.set("id", `eq.${id}`);
    params.set("select", "*");

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/uasset_categories?${params.toString()}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updates),
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
      return json(res, response.status, {
        ok: false,
        error:
          data?.message ||
          data?.error ||
          "Failed to update category.",
      });
    }

    const category = Array.isArray(data) ? data[0] : data;

    if (!category) {
      return json(res, 404, {
        ok: false,
        error: "Category not found.",
      });
    }

    return json(res, 200, {
      ok: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error("Category update error:", error);

    return json(res, 500, {
      ok: false,
      error: "Internal server error.",
    });
  }
}
