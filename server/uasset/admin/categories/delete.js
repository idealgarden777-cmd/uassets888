export default async function handler(req, res) {
  if (
    req.method !== "DELETE" &&
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

    let id = req.query?.id;

    if (!id && req.body) {
      let body = req.body;

      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      id = body?.id;
    }

    id = String(id || "").trim();

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

    let categories = [];

    try {
      categories = existingText
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
      !Array.isArray(categories) ||
      categories.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    const category =
      categories[0];

    const deleteResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/uasset_categories?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
          headers: {
            ...headers,
            Prefer:
              "return=representation",
          },
        }
      );

    const deleteText =
      await deleteResponse.text();

    if (!deleteResponse.ok) {
      console.error(
        "Category delete failed:",
        deleteText
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to delete category",
      });
    }

    let deletedCategory =
      category;

    if (deleteText) {
      try {
        const rows =
          JSON.parse(deleteText);

        if (
          Array.isArray(rows) &&
          rows.length > 0
        ) {
          deletedCategory =
            rows[0];
        }
      } catch {
        // Keep the previously fetched category.
      }
    }

    return res.status(200).json({
      success: true,
      category:
        deletedCategory,
    });
  } catch (error) {
    console.error(
      "Category delete error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
