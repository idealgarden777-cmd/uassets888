/* =========================================================
   UASSET / BILLING STATUS
   Identity comes from central Bean Accounts.
   Billing data belongs to UAsset.
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
   BEAN USER
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
   CHECK ACTIVE SUBSCRIPTION
   ========================================================= */

function isSubscriptionActive(
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

  const now =
    Date.now();


  /* -------------------------------------------------------
     Cancelled subscription:
     access continues until ends_at.
     ------------------------------------------------------- */

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
      )
    ) {
      return false;
    }

    return (
      endsAt >
      now
    );
  }


  /* -------------------------------------------------------
     Standard active states
     ------------------------------------------------------- */

  if (
    status === "active" ||
    status === "on_trial"
  ) {
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
        endsAt <= now
      ) {
        return false;
      }
    }

    return true;
  }


  /* -------------------------------------------------------
     All other states are not Pro.
     ------------------------------------------------------- */

  return false;
}


/* =========================================================
   GET SUBSCRIPTION
   ========================================================= */

async function getSubscription(
  beanUserId,
  variantId,
  testMode
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
      "bean_user_id",
      "provider",
      "provider_subscription_id",
      "customer_id",
      "order_id",
      "product_id",
      "variant_id",
      "product_name",
      "variant_name",
      "status",
      "cancelled",
      "renews_at",
      "ends_at",
      "test_mode",
      "created_at",
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


  if (
    !response.ok
  ) {
    console.error(
      "Supabase billing status query failed:",
      data
    );

    throw new Error(
      "Failed to read subscription"
    );
  }


  if (
    !Array.isArray(
      data
    ) ||
    data.length === 0
  ) {
    return null;
  }


  return data[0];
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

    return res.status(405).json({
      error:
        "Method not allowed"
    });
  }


  /* =======================================================
     ENVIRONMENT
     ======================================================= */

  let variantId;

  const testMode =
    String(
      process.env.LEMONSQUEEZY_TEST_MODE ||
        "true"
    ).toLowerCase() ===
    "true";


  try {
    variantId =
      getRequiredEnv(
        "LEMONSQUEEZY_VARIANT_ID"
      );

    getRequiredEnv(
      "SUPABASE_URL"
    );

    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

  } catch (error) {
    console.error(
      "UAsset billing status configuration error:",
      error.message
    );

    return res.status(500).json({
      error:
        "Billing configuration is incomplete"
    });
  }


  /* =======================================================
     BEAN SESSION
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

    return res.status(502).json({
      error:
        "Unable to verify Bean account"
    });
  }


  /* =======================================================
     LOGIN REQUIRED
     ======================================================= */

  if (!user) {
    return res.status(401).json({
      authenticated:
        false,

      pro:
        false,

      plan:
        "free",

      subscription:
        null,

      error:
        "Please log in with Bean ID first"
    });
  }


  /* =======================================================
     USER ID
     ======================================================= */

  const beanUserId =
    user.id;

  if (!beanUserId) {
    return res.status(500).json({
      error:
        "Bean user identity is missing"
    });
  }


  /* =======================================================
     DATABASE
     ======================================================= */

  let subscription;

  try {
    subscription =
      await getSubscription(
        beanUserId,
        variantId,
        testMode
      );

  } catch (error) {
    console.error(
      "UAsset subscription lookup failed:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to load billing status"
    });
  }


  /* =======================================================
     NO SUBSCRIPTION
     ======================================================= */

  if (!subscription) {
    return res.status(200).json({
      authenticated:
        true,

      pro:
        false,

      plan:
        "free",

      testMode,

      subscription:
        null
    });
  }


  /* =======================================================
     PRO ACCESS
     ======================================================= */

  const pro =
    isSubscriptionActive(
      subscription
    );


  /* =======================================================
     RESPONSE
     ======================================================= */

  return res.status(200).json({
    authenticated:
      true,

    pro,

    plan:
      pro
        ? "pro"
        : "free",

    testMode,

    subscription: {
      id:
        subscription.provider_subscription_id,

      status:
        subscription.status,

      cancelled:
        subscription.cancelled,

      renewsAt:
        subscription.renews_at,

      endsAt:
        subscription.ends_at,

      productName:
        subscription.product_name,

      variantName:
        subscription.variant_name
    }
  });
}
