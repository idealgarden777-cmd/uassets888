/* =========================================================
   UASSET PRO ASSET
   Bean authentication
   UAsset Pro verification
   Rate limiting
   Private Supabase signed URL
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const BUCKET_NAME =
  "uasset-pro";

const RATE_LIMIT =
  60;

const RATE_WINDOW_SECONDS =
  60;


/* =========================================================
   ALLOWED PRO ASSETS
   ========================================================= */

const PRO_ASSETS = new Set([
  "calendar",
  "history",
  "edit",
  "trash",
  "download",
  "upload",
  "folder",
  "heart",
  "shield",
  "info"
]);


/* =========================================================
   HELPERS
   ========================================================= */

function getRequiredEnv(name) {
  const value =
    process.env[name];

  if (
    !value ||
    !String(value).trim()
  ) {
    throw new Error(
      `${name} is missing`
    );
  }

  return String(value).trim();
}


/* =========================================================
   GET BEAN USER
   ========================================================= */

async function getBeanUser(req) {
  const cookie =
    req.headers.cookie;

  if (!cookie) {
    return null;
  }

  const response =
    await fetch(
      ACCOUNTS_SESSION_URL,
      {
        method:
          "GET",

        headers: {
          Accept:
            "application/json",

          Cookie:
            cookie
        },

        cache:
          "no-store"
      }
    );

  const data =
    await response
      .json()
      .catch(
        () => ({})
      );

  if (
    !response.ok ||
    !data.authenticated ||
    !data.user
  ) {
    return null;
  }

  return data.user;
}


/* =========================================================
   RATE LIMIT
   ========================================================= */

async function checkRateLimit(
  rateKey
) {
  const supabaseUrl =
    getRequiredEnv(
      "SUPABASE_URL"
    );

  const serviceRoleKey =
    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );


  const response =
    await fetch(
      `${supabaseUrl}/rest/v1/rpc/uasset_rate_limit`,
      {
        method:
          "POST",

        headers: {
          apikey:
            serviceRoleKey,

          Authorization:
            `Bearer ${serviceRoleKey}`,

          "Content-Type":
            "application/json",

          Accept:
            "application/json"
        },

        body:
          JSON.stringify({
            p_rate_key:
              rateKey,

            p_limit:
              RATE_LIMIT,

            p_window_seconds:
              RATE_WINDOW_SECONDS
          }),

        cache:
          "no-store"
      }
    );


  const data =
    await response
      .json()
      .catch(
        () => null
      );


  if (
    !response.ok
  ) {
    console.error(
      "UAsset rate limit check failed:",
      data
    );

    throw new Error(
      "Rate limit service unavailable"
    );
  }


  return data === true;
}


/* =========================================================
   CHECK UASSET PRO
   ========================================================= */

async function getProSubscription(
  beanUserId
) {
  const supabaseUrl =
    getRequiredEnv(
      "SUPABASE_URL"
    );

  const serviceRoleKey =
    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

  const variantId =
    getRequiredEnv(
      "LEMONSQUEEZY_VARIANT_ID"
    );

  const testMode =
    String(
      process.env.LEMONSQUEEZY_TEST_MODE ||
        "true"
    ).toLowerCase() ===
    "true";


  const query =
    new URLSearchParams();


  query.set(
    "select",
    [
      "provider_subscription_id",
      "status",
      "cancelled",
      "ends_at",
      "variant_id",
      "test_mode"
    ].join(",")
  );


  query.set(
    "bean_user_id",
    `eq.${beanUserId}`
  );


  query.set(
    "provider",
    "eq.lemonsqueezy"
  );


  query.set(
    "variant_id",
    `eq.${variantId}`
  );


  query.set(
    "test_mode",
    `eq.${testMode}`
  );


  query.set(
    "order",
    "updated_at.desc"
  );


  query.set(
    "limit",
    "1"
  );


  const response =
    await fetch(
      `${supabaseUrl}/rest/v1/uasset_subscriptions?${query.toString()}`,
      {
        method:
          "GET",

        headers: {
          apikey:
            serviceRoleKey,

          Authorization:
            `Bearer ${serviceRoleKey}`,

          Accept:
            "application/json"
        },

        cache:
          "no-store"
      }
    );


  const data =
    await response
      .json()
      .catch(
        () => null
      );


  if (
    !response.ok
  ) {
    console.error(
      "UAsset Pro subscription lookup failed:",
      data
    );

    throw new Error(
      "Subscription lookup failed"
    );
  }


  return Array.isArray(data)
    ? data[0] || null
    : null;
}


/* =========================================================
   ACTIVE PRO CHECK
   ========================================================= */

function isProActive(
  subscription
) {
  if (!subscription) {
    return false;
  }


  if (
    subscription.cancelled ===
    true
  ) {
    if (
      !subscription.ends_at
    ) {
      return false;
    }


    const endsAt =
      new Date(
        subscription.ends_at
      ).getTime();


    return (
      !Number.isNaN(
        endsAt
      ) &&
      endsAt >
        Date.now()
    );
  }


  const status =
    String(
      subscription.status ||
        ""
    ).toLowerCase();


  if (
    status !== "active" &&
    status !== "on_trial"
  ) {
    return false;
  }


  if (
    subscription.ends_at
  ) {
    const endsAt =
      new Date(
        subscription.ends_at
      ).getTime();


    if (
      !Number.isNaN(
        endsAt
      ) &&
      endsAt <=
        Date.now()
    ) {
      return false;
    }
  }


  return true;
}


/* =========================================================
   CREATE SIGNED URL
   ========================================================= */

async function createSignedUrl(
  assetId
) {
  const supabaseUrl =
    getRequiredEnv(
      "SUPABASE_URL"
    );

  const serviceRoleKey =
    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );


  const filePath =
    `${assetId}.svg`;


  /*
    Signed URL is valid for 10 minutes.
  */

  const expiresIn =
    600;


  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${BUCKET_NAME}/${encodeURIComponent(filePath)}`,
      {
        method:
          "POST",

        headers: {
          apikey:
            serviceRoleKey,

          Authorization:
            `Bearer ${serviceRoleKey}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            expiresIn
          })
      }
    );


  const data =
    await response
      .json()
      .catch(
        () => null
      );


  if (
    !response.ok
  ) {
    console.error(
      "Supabase signed URL creation failed:",
      data
    );

    throw new Error(
      "Failed to create signed asset URL"
    );
  }


  const signedPath =
    data?.signedURL ||
    data?.signedUrl ||
    data?.signed_url;


  if (!signedPath) {
    console.error(
      "Supabase signed URL missing:",
      data
    );

    throw new Error(
      "Signed URL was not returned"
    );
  }


  const signedUrl =
    signedPath.startsWith(
      "http"
    )
      ? signedPath
      : `${supabaseUrl}/storage/v1${signedPath.startsWith("/") ? "" : "/"}${signedPath.replace(/^\/storage\/v1/, "")}`;


  return {
    signedUrl,
    expiresIn
  };
}


/* =========================================================
   HANDLER
   ========================================================= */

export default async function handler(
  req,
  res
) {
  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );


  /* =======================================================
     METHOD
     ======================================================= */

  if (
    req.method !==
    "GET"
  ) {
    res.setHeader(
      "Allow",
      "GET"
    );

    return res
      .status(405)
      .json({
        error:
          "Method not allowed"
      });
  }


  /* =======================================================
     ASSET ID
     ======================================================= */

  const assetId =
    String(
      req.query?.id ||
        ""
    )
      .trim()
      .toLowerCase();


  if (
    !PRO_ASSETS.has(
      assetId
    )
  ) {
    return res
      .status(404)
      .json({
        error:
          "Pro asset not found"
      });
  }


  /* =======================================================
     AUTHENTICATION
     ======================================================= */

  let user;

  try {
    user =
      await getBeanUser(
        req
      );

  } catch (error) {
    console.error(
      "Bean verification failed:",
      error
    );

    return res
      .status(502)
      .json({
        error:
          "Unable to verify Bean account"
      });
  }


  if (!user) {
    return res
      .status(401)
      .json({
        authenticated:
          false,

        pro:
          false,

        error:
          "Login with Bean ID required"
      });
  }


  /* =======================================================
     RATE LIMIT
     ======================================================= */

  const rateKey =
    `uasset:pro:${String(
      user.id
    )}`;


  let allowed;

  try {
    allowed =
      await checkRateLimit(
        rateKey
      );

  } catch (error) {
    console.error(
      "UAsset rate limit error:",
      error
    );

    return res
      .status(503)
      .json({
        error:
          "Asset service temporarily unavailable"
      });
  }


  if (!allowed) {
    res.setHeader(
      "Retry-After",
      String(
        RATE_WINDOW_SECONDS
      )
    );

    return res
      .status(429)
      .json({
        authenticated:
          true,

        pro:
          false,

        error:
          "Too many Pro asset requests. Please try again shortly."
      });
  }


  /* =======================================================
     PRO STATUS
     ======================================================= */

  let subscription;

  try {
    subscription =
      await getProSubscription(
        user.id
      );

  } catch (error) {
    console.error(
      "UAsset Pro check failed:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Unable to verify UAsset Pro"
      });
  }


  const pro =
    isProActive(
      subscription
    );


  if (!pro) {
    return res
      .status(403)
      .json({
        authenticated:
          true,

        pro:
          false,

        error:
          "UAsset Pro access required"
      });
  }


  /* =======================================================
     SIGNED ASSET URL
     ======================================================= */

  try {
    const result =
      await createSignedUrl(
        assetId
      );


    return res
      .status(200)
      .json({
        success:
          true,

        pro:
          true,

        asset:
          assetId,

        url:
          result.signedUrl,

        expiresIn:
          result.expiresIn
      });

  } catch (error) {
    console.error(
      "UAsset Pro asset delivery failed:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Unable to load Pro asset"
      });
  }
}
