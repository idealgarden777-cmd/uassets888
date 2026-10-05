/* =========================================================
   UASSET PRO ASSET API
   Bean authentication
   Database-driven Pro asset verification
   UAsset Pro subscription verification
   Rate limiting
   Private Supabase signed URL
   Production security
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const SUPABASE_ICONS_TABLE =
  "uasset_icons";

const PRO_BUCKET_NAME =
  "uasset-pro";

const RATE_LIMIT =
  60;

const RATE_WINDOW_SECONDS =
  60;

const SIGNED_URL_SECONDS =
  600;


/* =========================================================
   REQUIRED ENVIRONMENT
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
   ASSET ERROR
   ========================================================= */

function createAssetError(
  message,
  code
) {

  const error =
    new Error(
      message
    );

  error.code =
    code;

  return error;
}


/* =========================================================
   BEAN SESSION
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
      {
        status:
          response.status,

        statusText:
          response.statusText,

        response:
          data
      }
    );

    throw new Error(
      "Rate limit service unavailable"
    );
  }

  return data === true;
}


/* =========================================================
   GET PRO SUBSCRIPTION
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
      {
        status:
          response.status,

        statusText:
          response.statusText,

        response:
          data
      }
    );

    throw new Error(
      "Subscription lookup failed"
    );
  }

  return Array.isArray(
    data
  )
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
    status !==
      "active" &&
    status !==
      "on_trial"
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
   GET PRO ASSET FROM DATABASE
   ========================================================= */

async function getProAsset(
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

  const query =
    new URLSearchParams();

  query.set(
    "select",
    [
      "id",
      "name",
      "plan",
      "storage_bucket",
      "storage_path",
      "is_active"
    ].join(",")
  );

  query.set(
    "id",
    `eq.${assetId}`
  );

  query.set(
    "plan",
    "eq.pro"
  );

  query.set(
    "is_active",
    "eq.true"
  );

  query.set(
    "limit",
    "1"
  );

  const response =
    await fetch(
      `${supabaseUrl}/rest/v1/${SUPABASE_ICONS_TABLE}?${query.toString()}`,
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
      "UAsset Pro asset database lookup failed:",
      {
        assetId,

        status:
          response.status,

        statusText:
          response.statusText,

        response:
          data
      }
    );

    throw createAssetError(
      "Unable to verify Pro asset",
      "ASSET_DATABASE_ERROR"
    );
  }

  if (
    !Array.isArray(data) ||
    !data[0]
  ) {

    throw createAssetError(
      "Pro asset not found",
      "INVALID_ASSET"
    );
  }

  const asset =
    data[0];

  if (
    asset.storage_bucket !==
    PRO_BUCKET_NAME
  ) {

    console.error(
      "UAsset Pro asset bucket mismatch:",
      {
        assetId,

        storageBucket:
          asset.storage_bucket,

        expectedBucket:
          PRO_BUCKET_NAME
      }
    );

    throw createAssetError(
      "Pro asset storage configuration is invalid",
      "ASSET_BUCKET_INVALID"
    );
  }

  if (
    !asset.storage_path ||
    !String(
      asset.storage_path
    ).trim()
  ) {

    console.error(
      "UAsset Pro asset storage path missing:",
      {
        assetId
      }
    );

    throw createAssetError(
      "Pro asset storage path is missing",
      "ASSET_PATH_MISSING"
    );
  }

  return asset;
}


/* =========================================================
   CREATE SIGNED URL
   ========================================================= */

async function createSignedUrl(
  storageBucket,
  storagePath
) {

  const supabaseUrl =
    getRequiredEnv(
      "SUPABASE_URL"
    );

  const serviceRoleKey =
    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

  const encodedBucket =
    String(
      storageBucket
    )
      .split("/")
      .map(
        part =>
          encodeURIComponent(
            part
          )
      )
      .join("/");

  const encodedPath =
    String(
      storagePath
    )
      .split("/")
      .map(
        part =>
          encodeURIComponent(
            part
          )
      )
      .join("/");

  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${encodedBucket}/${encodedPath}`,
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

            expiresIn:
              SIGNED_URL_SECONDS

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
      "Supabase signed URL creation failed:",
      {
        storageBucket,

        storagePath,

        status:
          response.status,

        statusText:
          response.statusText,

        response:
          data
      }
    );

    if (
      response.status ===
      404
    ) {

      throw createAssetError(
        "Pro asset file not found in secure storage",
        "ASSET_NOT_FOUND"
      );
    }

    if (
      response.status ===
        401 ||
      response.status ===
        403
    ) {

      throw createAssetError(
        "Pro asset storage authorization failed",
        "ASSET_STORAGE_AUTH"
      );
    }

    throw createAssetError(
      `Secure Pro asset signing failed (${response.status})`,
      "ASSET_SIGN_FAILED"
    );
  }

  const signedPath =
    data?.signedURL ||
    data?.signedUrl ||
    data?.signed_url;

  if (
    !signedPath
  ) {

    console.error(
      "Supabase signed URL missing:",
      {
        storageBucket,

        storagePath,

        response:
          data
      }
    );

    throw createAssetError(
      "Secure Pro asset URL was not returned",
      "ASSET_SIGN_URL_MISSING"
    );
  }

  const signedUrl =
    String(
      signedPath
    ).startsWith(
      "http"
    )
      ? String(
          signedPath
        )
      : `${supabaseUrl}/storage/v1${
          String(
            signedPath
          ).startsWith("/")
            ? ""
            : "/"
        }${String(
          signedPath
        ).replace(
          /^\/storage\/v1/,
          ""
        )}`;

  return {

    signedUrl,

    expiresIn:
      SIGNED_URL_SECONDS

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
    "no-store, private"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
  );

  res.setHeader(
    "X-Frame-Options",
    "DENY"
  );


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


  const assetId =
    String(
      req.query?.id ||
        ""
    )
      .trim()
      .toLowerCase();


  if (
    !assetId ||
    !/^[a-z0-9-]+$/.test(
      assetId
    )
  ) {

    return res
      .status(404)
      .json({

        success:
          false,

        error:
          "Pro asset not found",

        code:
          "INVALID_ASSET"

      });
  }


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

        success:
          false,

        authenticated:
          false,

        error:
          "Unable to verify Bean account",

        code:
          "BEAN_SESSION_ERROR"

      });
  }


  if (!user) {

    return res
      .status(401)
      .json({

        success:
          false,

        authenticated:
          false,

        pro:
          false,

        error:
          "Login with Bean ID required",

        code:
          "AUTH_REQUIRED"

      });
  }


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

        success:
          false,

        authenticated:
          true,

        pro:
          false,

        error:
          "Asset service temporarily unavailable",

        code:
          "RATE_LIMIT_SERVICE_ERROR"

      });
  }


  if (
    !allowed
  ) {

    res.setHeader(
      "Retry-After",
      String(
        RATE_WINDOW_SECONDS
      )
    );

    return res
      .status(429)
      .json({

        success:
          false,

        authenticated:
          true,

        pro:
          false,

        error:
          "Too many Pro asset requests. Please try again shortly.",

        code:
          "RATE_LIMITED"

      });
  }


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

        success:
          false,

        authenticated:
          true,

        pro:
          false,

        error:
          "Unable to verify UAsset Pro",

        code:
          "PRO_STATUS_ERROR"

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

        success:
          false,

        authenticated:
          true,

        pro:
          false,

        error:
          "UAsset Pro access required",

        code:
          "PRO_ACCESS_REQUIRED"

      });
  }


  let asset;


  try {

    asset =
      await getProAsset(
        assetId
      );

  } catch (error) {

    console.error(
      "UAsset Pro asset verification failed:",
      {
        assetId,

        code:
          error?.code,

        message:
          error?.message
      }
    );

    if (
      error?.code ===
      "INVALID_ASSET"
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          pro:
            true,

          asset:
            assetId,

          error:
            "Pro asset not found",

          code:
            "INVALID_ASSET"

        });
    }

    return res
      .status(500)
      .json({

        success:
          false,

        pro:
          true,

        asset:
          assetId,

        error:
          error?.message ||
          "Unable to verify Pro asset",

        code:
          error?.code ||
          "ASSET_VERIFICATION_FAILED"

      });
  }


  try {

    const result =
      await createSignedUrl(
        asset.storage_bucket,
        asset.storage_path
      );


    return res
      .status(200)
      .json({

        success:
          true,

        pro:
          true,

        asset:
          asset.id,

        name:
          asset.name,

        url:
          result.signedUrl,

        expiresIn:
          result.expiresIn

      });

  } catch (error) {

    console.error(
      "UAsset Pro asset delivery failed:",
      {
        assetId,

        storageBucket:
          asset.storage_bucket,

        storagePath:
          asset.storage_path,

        code:
          error?.code ||
          "PRO_ASSET_DELIVERY_FAILED",

        message:
          error?.message ||
          error
      }
    );


    const statusCode =
      error?.code ===
        "ASSET_NOT_FOUND"
        ? 404
        : 500;


    return res
      .status(statusCode)
      .json({

        success:
          false,

        pro:
          true,

        asset:
          assetId,

        code:
          error?.code ||
          "PRO_ASSET_DELIVERY_FAILED",

        error:
          error?.message ||
          "Unable to load Pro asset"

      });
  }
}
