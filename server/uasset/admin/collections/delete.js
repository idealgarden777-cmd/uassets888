export default async function handler(req, res) {
  if (req.method !== "DELETE" && req.method !== "POST") {
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

    // 3. Get collection ID
    let id = req.query?.id;

    if (!id && req.body) {
      if (typeof req.body === "string") {
        try {
          req.body = JSON.parse(req.body);
        } catch {
          // Ignore invalid JSON; validation below will handle missing id.
        }
      }

      id = req.body?.id;
    }

    id = String(id || "").trim();

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

    // 4. Supabase configuration
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        success: false,
        error: "Supabase configuration is missing",
      });
    }

    const supabaseHeaders = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    };

    // 5. Verify collection exists
    const collectionResponse = await fetch(
      `${supabaseUrl}/rest/v1/uasset_collections?id=eq.${encodeURIComponent(
        id
      )}&select=*`,
      {
        method: "GET",
        headers: supabaseHeaders,
      }
    );

    if (!collectionResponse.ok) {
      const errorText = await collectionResponse.text();

      console.error("Collection lookup failed:", errorText);

      return res.status(500).json({
        success: false,
        error: "Failed to find collection",
      });
    }

    const collections = await collectionResponse.json();

    if (!Array.isArray(collections) || collections.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Collection not found",
      });
    }

    const collection = collections[0];

    // 6. Delete collection
    const deleteResponse = await fetch(
      `${supabaseUrl}/rest/v1/uasset_collections?id=eq.${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers: {
          ...supabaseHeaders,
          Prefer: "return=representation",
        },
      }
    );

    const deleteText = await deleteResponse.text();

    if (!deleteResponse.ok) {
      console.error("Collection delete failed:", deleteText);

      return res.status(500).json({
        success: false,
        error: "Failed to delete collection",
      });
    }

    let deletedCollection = collection;

    if (deleteText) {
      try {
        const deletedRows = JSON.parse(deleteText);

        if (Array.isArray(deletedRows) && deletedRows.length > 0) {
          deletedCollection = deletedRows[0];
        }
      } catch {
        // Keep previously fetched collection as response.
      }
    }

    // 7. Success
    return res.status(200).json({
      success: true,
      collection: deletedCollection,
    });
  } catch (error) {
    console.error("Collection delete error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
