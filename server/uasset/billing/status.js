/* =========================================================
   UASSET BILLING STATUS
   Bean authentication
   Lemon Squeezy subscription status
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";


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
   SUBSCRIPTION LOOKUP
   ========================================================= */

async function getSubscription(
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
      "provider",
      "provider_subscription_id",
      "status",
      "cancelled",
      "ends_at",
      "variant_id",
      "test_mode",
      "updated_at"
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
      "UAsset subscription lookup failed:",
      {
        status:
          response.status,

        response:
          data
      }
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
   ACTIVE SUBSCRIPTION
   ========================================================= */

function isActiveSubscription(
  subscription
) {
  if (!subscription) {
    return false;
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


    if (
      Number.isNaN(
        endsAt
      ) ||
      endsAt <=
        Date.now()
    ) {
      return false;
    }
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
        success:
          false,

        error:
          "Method not allowed"
      });
  }


  /* =======================================================
     VERIFY BEAN SESSION
     ======================================================= */

  let user;


  try {

    user =
      await getBeanUser(
        req
      );

  } catch (error) {

    console.error(
      "Bean session lookup failed:",
      error
    );

    return res
      .status(502)
      .json({

        success:
          false,

        authenticated:
          false,

        pro:
          false,

        plan:
          "free",

        testMode:
          String(
            process.env.LEMONSQUEEZY_TEST_MODE ||
              "true"
          ).toLowerCase() ===
          "true",

        error:
          "Unable to verify Bean account",

        code:
          "BEAN_SESSION_ERROR"

      });
  }


  /* =======================================================
     NOT LOGGED IN
     ======================================================= */

  if (!user) {

    return res
      .status(200)
      .json({

        success:
          true,

        authenticated:
          false,

        pro:
          false,

        plan:
          "free",

        testMode:
          String(
            process.env.LEMONSQUEEZY_TEST_MODE ||
              "true"
          ).toLowerCase() ===
          "true",

        subscription:
          null

      });
  }


  /* =======================================================
     USER ID
     ======================================================= */

  if (!user.id) {

    return res
      .status(500)
      .json({

        success:
          false,

        authenticated:
          true,

        pro:
          false,

        plan:
          "free",

        testMode:
          String(
            process.env.LEMONSQUEEZY_TEST_MODE ||
              "true"
          ).toLowerCase() ===
          "true",

        error:
          "Bean user identity is missing",

        code:
          "USER_ID_MISSING"

      });
  }


  /* =======================================================
     GET SUBSCRIPTION
     ======================================================= */

  let subscription;


  try {

    subscription =
      await getSubscription(
        user.id
      );

  } catch (error) {

    console.error(
      "UAsset billing status error:",
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

        plan:
          "free",

        testMode:
          String(
            process.env.LEMONSQUEEZY_TEST_MODE ||
              "true"
          ).toLowerCase() ===
          "true",

        error:
          "Unable to load subscription status",

        code:
          "SUBSCRIPTION_LOOKUP_ERROR"

      });
  }


  /* =======================================================
     PRO STATUS
     ======================================================= */

  const pro =
    isActiveSubscription(
      subscription
    );


  const testMode =
    String(
      process.env.LEMONSQUEEZY_TEST_MODE ||
        "true"
    ).toLowerCase() ===
    "true";


  const plan =
    pro
      ? "pro"
      : "free";


  /* =======================================================
     SAFE RESPONSE
     ======================================================= */

  return res
    .status(200)
    .json({

      success:
        true,

      authenticated:
        true,

      pro,

      plan,

      testMode,

      subscription:
        subscription
          ? {
              status:
                subscription.status,

              cancelled:
                subscription.cancelled ===
                true,

              endsAt:
                subscription.ends_at ||
                null
            }
          : null

    });
}
