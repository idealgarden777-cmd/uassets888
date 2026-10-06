export default async function handler(req, res) {
  if (req.method !== "GET") {
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

    const includeInactive =
      String(
        req.query?.include_inactive || ""
      ).toLowerCase() === "true";

    const params =
      new URLSearchParams();

    params.set(
      "select",
      "*"
    );

    if (!includeInactive) {
      params.set(
        "is_active",
        "eq.true"
      );
    }

    params.set(
      "order",
      "sort_order.asc,name.asc"
    );

    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/uasset_categories?${params.toString()}`,
        {
          method: "GET",
          headers: {
            apikey:
              serviceRoleKey,
            Authorization:
              `Bearer ${serviceRoleKey}`,
            "Content-Type":
              "application/json",
          },
        }
      );

    const text =
      await response.text();

    if (!response.ok) {
      console.error(
        "Category list failed:",
        text
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to load categories",
      });
    }

    let categories = [];

    try {
      categories =
        text ? JSON.parse(text) : [];
    } catch {
      return res.status(500).json({
        success: false,
        error:
          "Invalid categories response",
      });
    }

    return res.status(200).json({
      success: true,
      categories:
        Array.isArray(categories)
          ? categories
          : [],
    });
  } catch (error) {
    console.error(
      "Category list error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
