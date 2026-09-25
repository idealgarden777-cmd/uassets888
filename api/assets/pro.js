/* =========================================================
   UASSET PRO ASSET ACCESS
   Server-side Pro authorization endpoint.
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const SUPABASE_TABLE =
  "uasset_subscriptions";


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
        method: "GET",

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
      `${supabaseUrl}/rest/v1/${SUPABASE_TABLE}?${query.toString()}`,
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


  if (!response.ok) {
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
   CHECK ACTIVE PRO
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


  return (
    status === "active" ||
    status === "on_trial"
  );
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
     AUTH
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
     PRO CHECK
     ======================================================= */

  let subscription;

  try {
    subscription =
      await getProSubscription(
        user.id
      );

  } catch (error) {
    console.error(
      "Pro access check failed:",
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


  /* =======================================================
     RESPONSE
     ======================================================= */

  return res
    .status(200)
    .json({
      authenticated:
        true,

      pro,

      plan:
        pro
          ? "pro"
          : "free",

      userId:
        user.id
    });
}
