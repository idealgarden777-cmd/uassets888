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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

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

    const includeInactive =
      String(req.query?.include_inactive || "").toLowerCase() === "true";

    const params = new URLSearchParams();

    if (!includeInactive) {
      params.set("is_active", "eq.true");
    }

    params.set("select", "*");
    params.set("order", "sort_order.asc,created_at.asc");

    const url =
      `${SUPABASE_URL}/rest/v1/uasset_categories?` +
      params.toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: "application/json",
      },
    });

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
          "Failed to load categories.",
      });
    }

    return json(res, 200, {
      ok: true,
      categories: Array.isArray(data) ? data : [],
    });
  } catch (error) {
    console.error("Category list error:", error);

    return json(res, 500, {
      ok: false,
      error: "Internal server error.",
    });
  }
}
