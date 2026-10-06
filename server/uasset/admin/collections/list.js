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

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        success: false,
        error: "Supabase configuration is missing",
      });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/uasset_collections?select=*&order=created_at.desc`,
      {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error("Collection list failed:", text);

      return res.status(500).json({
        success: false,
        error: "Failed to load collections",
      });
    }

    let collections = [];

    try {
      collections = text ? JSON.parse(text) : [];
    } catch (error) {
      console.error("Collection list JSON parse failed:", error);

      return res.status(500).json({
        success: false,
        error: "Invalid collections response",
      });
    }

    return res.status(200).json({
      success: true,
      collections: Array.isArray(collections) ? collections : [],
    });
  } catch (error) {
    console.error("Collection list error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
