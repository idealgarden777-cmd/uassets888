export default async function handler(req, res) {
  if (
    req.method !== "PATCH" &&
    req.method !== "PUT" &&
    req.method !== "POST"
  ) {
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

    const session =
      await sessionResponse.json();

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

    if (
      !adminIds.includes(
        String(userId)
      )
    ) {
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

    const id =
      String(body.id || "").trim();

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

    const updates = {};

    if (
      body.name !== undefined
    ) {
      const name =
        String(body.name || "").trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          error:
            "Category name is required",
        });
      }

      updates.name = name;
    }

    if (
      body.description !== undefined
    ) {
      updates.description =
        body.description === null
          ? null
          : String(
              body.description
            ).trim();
    }

    if (
      body.sort_order !== undefined
    ) {
      const sortOrder =
        Number(body.sort_order);

      if (!Number.isFinite(sortOrder)) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid sort order",
        });
      }

      updates.sort_order =
        Math.trunc(sortOrder);
    }

    if (
      body.is_active !== undefined
    ) {
      if (
        typeof body.is_active !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "is_active must be a boolean",
        });
      }

      updates.is_active =
        body.is_active;
    }

    if (
      Object.keys(updates).length === 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "No fields to update",
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
        error:
          "Supabase configuration is missing",
      });
    }

    const headers = {
      apikey: serviceRoleKey,
      Authorization:
        `Bearer ${serviceRoleKey}`,
      "Content-Type":
        "application/json",
      Prefer:
        "return=representation",
    };

    const existingResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/uasset_categories?id=eq.${encodeURIComponent(
          id
        )}&select=*`,
        {
          method: "GET",
          headers,
        }
      );

    const existingText =
      await existingResponse.text();

    if (!existingResponse.ok) {
      console.error(
        "Category lookup failed:",
        existingText
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to find category",
      });
    }

    let existingCategories = [];

    try {
      existingCategories =
        existingText
          ? JSON.parse(existingText)
          : [];
    } catch {
      return res.status(500).json({
        success: false,
        error:
          "Invalid category response",
      });
    }

    if (
      !Array.isArray(
        existingCategories
      ) ||
      existingCategories.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error:
          "Category not found",
      });
    }

    const updateResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/uasset_categories?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify(
            updates
          ),
        }
      );

    const updateText =
      await updateResponse.text();

    if (!updateResponse.ok) {
      console.error(
        "Category update failed:",
        updateText
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to update category",
      });
    }

    let category =
      existingCategories[0];

    if (updateText) {
      try {
        const rows =
          JSON.parse(updateText);

        if (
          Array.isArray(rows) &&
          rows.length > 0
        ) {
          category = rows[0];
        }
      } catch {
        // Keep existing category.
      }
    }

    return res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "Category update error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
