export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const sessionResponse = await fetch(
      "https://accounts.signaturesi.com/api/auth/session",
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );

    if (!sessionResponse.ok) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const session = await sessionResponse.json();

    const userId =
      session?.user?.id ||
      session?.user?.user_id ||
      session?.userId ||
      session?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const adminIds = String(
      process.env.UASSET_ADMIN_BEAN_IDS || ""
    )
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!adminIds.includes(String(userId))) {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON body",
        });
      }
    }

    body = body || {};

    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    const description =
      body.description === undefined ||
      body.description === null
        ? null
        : String(body.description).trim();

    const sortOrder = Number(
      body.sort_order ?? 0
    );

    const isActive =
      body.is_active === undefined
        ? true
        : body.is_active;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Category id is required",
      });
    }

    if (!/^[a-z0-9-]+$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category id",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Category name is required",
      });
    }

    if (!Number.isFinite(sortOrder)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort order",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "is_active must be a boolean",
      });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !serviceRoleKey
    ) {
      return res.status(500).json({
        success: false,
        error: "Supabase configuration is missing",
      });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/uasset_categories`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization:
            `Bearer ${serviceRoleKey}`,
          "Content-Type":
            "application/json",
          Prefer:
            "return=representation",
        },
        body: JSON.stringify({
          id,
          name,
          description,
          sort_order:
            Math.trunc(sortOrder),
          is_active: isActive,
          created_by_bean_user_id:
            String(userId),
        }),
      }
    );

    const text =
      await response.text();

    if (!response.ok) {
      console.error(
        "Category create failed:",
        text
      );

      if (
        response.status === 409
      ) {
        return res.status(409).json({
          success: false,
          error:
            "Category already exists",
        });
      }

      return res.status(500).json({
        success: false,
        error:
          "Failed to create category",
      });
    }

    let category = null;

    try {
      const rows =
        text ? JSON.parse(text) : [];

      category =
        Array.isArray(rows)
          ? rows[0] || null
          : rows;
    } catch {
      return res.status(500).json({
        success: false,
        error:
          "Invalid category response",
      });
    }

    return res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "Category create error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
