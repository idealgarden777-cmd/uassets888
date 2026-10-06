export default async function handler(req, res) {
  if (req.method !== "PUT" && req.method !== "PATCH" && req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    // 1. Verify Bean session
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

    // 2. Verify admin access
    const adminIds = String(process.env.UASSET_ADMIN_BEAN_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!adminIds.includes(String(userId))) {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    // 3. Parse body
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

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Collection id is required",
      });
    }

    if (!/^[a-z0-9-]+$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid collection id",
      });
    }

    // 4. Validate fields
    const updates = {};

    if (body.name !== undefined) {
      const name = String(body.name || "").trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          error: "Collection name is required",
        });
      }

      updates.name = name;
    }

    if (body.categories !== undefined) {
      if (!Array.isArray(body.categories)) {
        return res.status(400).json({
          success: false,
          error: "Categories must be an array",
        });
      }

      const categories = body.categories
        .map((category) => String(category).trim())
        .filter(Boolean);

      if (categories.length === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one category is required",
        });
      }

      updates.categories = categories;
    }

    if (body.description !== undefined) {
      updates.description =
        body.description === null
          ? null
          : String(body.description).trim();
    }

    if (body.is_active !== undefined) {
      if (typeof body.is_active !== "boolean") {
        return res.status(400).json({
          success: false,
          error: "is_active must be a boolean",
        });
      }

      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    // 5. Supabase configuration
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        success: false,
        error: "Supabase configuration is missing",
      });
    }

    const headers = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    // 6. Verify collection exists
    const existingResponse = await fetch(
      `${supabaseUrl}/rest/v1/uasset_collections?id=eq.${encodeURIComponent(
        id
      )}&select=*`,
      {
        method: "GET",
        headers,
      }
    );

    const existingText = await existingResponse.text();

    if (!existingResponse.ok) {
      console.error("Collection lookup failed:", existingText);

      return res.status(500).json({
        success: false,
        error: "Failed to find collection",
      });
    }

    let existingCollections = [];

    try {
      existingCollections = existingText
        ? JSON.parse(existingText)
        : [];
    } catch {
      return res.status(500).json({
        success: false,
        error: "Invalid collection response",
      });
    }

    if (
      !Array.isArray(existingCollections) ||
      existingCollections.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    // 7. Update collection
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/uasset_collections?id=eq.${encodeURIComponent(
        id
      )}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(updates),
      }
    );

    const updateText = await updateResponse.text();

    if (!updateResponse.ok) {
      console.error("Collection update failed:", updateText);

      return res.status(500).json({
        success: false,
        error: "Failed to update collection",
      });
    }

    let updatedCollection = existingCollections[0];

    if (updateText) {
      try {
        const rows = JSON.parse(updateText);

        if (Array.isArray(rows) && rows.length > 0) {
          updatedCollection = rows[0];
        }
      } catch {
        // Keep existing collection as fallback.
      }
    }

    return res.status(200).json({
      success: true,
      collection: updatedCollection,
    });
  } catch (error) {
    console.error("Collection update error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
