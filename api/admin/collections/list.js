const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const ADMIN_BEAN_IDS =
  (process.env.UASSET_ADMIN_BEAN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

function json(res, status, data) {
  return res.status(status).json(data);
}

function getCookieHeader(req) {
  return req.headers?.cookie || "";
}

async function verifyAdmin(req) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(
    ACCOUNTS_SESSION_URL,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: getCookieHeader(req)
      },
      cache: "no-store"
    }
  );

  const session = await response
    .json()
    .catch(() => null);

  if (!response.ok || !session?.authenticated) {
    return {
      ok: false,
      reason: "Unauthorized"
    };
  }

  const beanUserId =
    session?.user?.id ||
    session?.user?.bean_user_id ||
    session?.user?.beanUserId ||
    session?.bean_user_id ||
    session?.beanUserId ||
    null;

  if (!beanUserId) {
    return {
      ok: false,
      reason: "No Bean user found"
    };
  }

  if (!ADMIN_BEAN_IDS.includes(String(beanUserId))) {
    return {
      ok: false,
      reason: "Admin access required"
    };
  }

  return {
    ok: true,
    beanUserId: String(beanUserId)
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return json(res, 405, {
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const admin = await verifyAdmin(req);

    if (!admin.ok) {
      return json(res, 403, {
        ok: false,
        error: admin.reason
      });
    }

    const includeInactive =
      String(
        req.query?.include_inactive || ""
      ).toLowerCase() === "true";

    const query = new URLSearchParams();

    if (!includeInactive) {
      query.set("is_active", "eq.true");
    }

    query.set(
      "select",
      "id,name,description,sort_order,is_active,created_at,updated_at"
    );

    query.set(
      "order",
      "sort_order.asc,created_at.asc"
    );

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/uasset_categories?${query.toString()}`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization:
            `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Accept: "application/json"
        },
        cache: "no-store"
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      return json(res, response.status, {
        ok: false,
        error:
          data?.message ||
          data?.error ||
          "Failed to load categories."
      });
    }

    return json(res, 200, {
      ok: true,
      categories: Array.isArray(data)
        ? data
        : []
    });
  } catch (error) {
    console.error(
      "Category list error:",
      error
    );

    return json(res, 500, {
      ok: false,
      error: "Internal server error."
    });
  }
}
