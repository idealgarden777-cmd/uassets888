/* =========================================================
   UASSET / LEMON SQUEEZY WEBHOOK
   Billing belongs to UAsset.
   Bean is identity only.
   ========================================================= */

import crypto from "node:crypto";


/* =========================================================
   CONFIG
   ========================================================= */

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
   RAW BODY
   ========================================================= */

function getRawBody(req) {
  return new Promise(
    (resolve, reject) => {
      const chunks = [];

      req.on(
        "data",
        chunk => {
          chunks.push(
            Buffer.isBuffer(chunk)
              ? chunk
              : Buffer.from(chunk)
          );
        }
      );

      req.on(
        "end",
        () => {
          resolve(
            Buffer.concat(
              chunks
            )
          );
        }
      );

      req.on(
        "error",
        error => {
          reject(error);
        }
      );
    }
  );
}


/* =========================================================
   VERIFY SIGNATURE
   ========================================================= */

function verifySignature(
  rawBody,
  signature,
  secret
) {
  if (
    !rawBody ||
    !rawBody.length ||
    !signature
  ) {
    return false;
  }

  const expected =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(rawBody)
      .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8"
    );

  const receivedBuffer =
    Buffer.from(
      String(signature),
      "utf8"
    );

  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}


/* =========================================================
   UUID VALIDATION
   ========================================================= */

function isUuid(value) {
  return (
    typeof value ===
      "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}


/* =========================================================
   UPSERT SUBSCRIPTION
   ========================================================= */

async function upsertSubscription(
  subscription
) {
  const supabaseUrl =
    getRequiredEnv(
      "SUPABASE_URL"
    );

  const serviceRoleKey =
    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

  const subscriptionId =
    String(
      subscription.id
    );

  const attributes =
    subscription.attributes ||
    {};

  const row = {
    bean_user_id:
      subscription.bean_user_id,

    provider:
      "lemonsqueezy",

    provider_subscription_id:
      subscriptionId,

    customer_id:
      attributes.customer_id != null
        ? String(
            attributes.customer_id
          )
        : null,

    order_id:
      attributes.order_id != null
        ? String(
            attributes.order_id
          )
        : null,

    product_id:
      attributes.product_id != null
        ? String(
            attributes.product_id
          )
        : null,

    variant_id:
      attributes.variant_id != null
        ? String(
            attributes.variant_id
          )
        : null,

    product_name:
      attributes.product_name ||
      null,

    variant_name:
      attributes.variant_name ||
      null,

    status:
      attributes.status ||
      "unknown",

    cancelled:
      Boolean(
        attributes.cancelled
      ),

    renews_at:
      attributes.renews_at ||
      null,

    ends_at:
      attributes.ends_at ||
      null,

    test_mode:
      Boolean(
        attributes.test_mode
      ),

    updated_at:
      new Date().toISOString()
  };

  const response =
    await fetch(
      `${supabaseUrl}/rest/v1/${SUPABASE_TABLE}?on_conflict=provider,provider_subscription_id`,
      {
        method: "POST",

        headers: {
          apikey:
            serviceRoleKey,

          Authorization:
            `Bearer ${serviceRoleKey}`,

          "Content-Type":
            "application/json",

          Prefer:
            "resolution=merge-duplicates,return=representation"
        },

        body:
          JSON.stringify([
            row
          ])
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
      "Supabase subscription upsert failed:",
      data
    );

    throw new Error(
      "Failed to save subscription"
    );
  }

  return data;
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
    "POST"
  ) {
    res.setHeader(
      "Allow",
      "POST"
    );

    return res.status(405).json({
      error:
        "Method not allowed"
    });
  }


  /* =======================================================
     ENVIRONMENT
     ======================================================= */

  let webhookSecret;
  let expectedVariantId;
  let expectedStoreId;

  const expectedTestMode =
    String(
      process.env.LEMONSQUEEZY_TEST_MODE ||
        "true"
    ).toLowerCase() ===
    "true";

  try {
    webhookSecret =
      getRequiredEnv(
        "LEMONSQUEEZY_WEBHOOK_SECRET"
      );

    expectedVariantId =
      getRequiredEnv(
        "LEMONSQUEEZY_VARIANT_ID"
      );

    expectedStoreId =
      getRequiredEnv(
        "LEMONSQUEEZY_STORE_ID"
      );

    getRequiredEnv(
      "SUPABASE_URL"
    );

    getRequiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

  } catch (error) {
    console.error(
      "UAsset webhook configuration error:",
      error.message
    );

    return res.status(500).json({
      error:
        "Webhook configuration is incomplete"
    });
  }


  /* =======================================================
     RAW BODY
     ======================================================= */

  let rawBody;

  try {
    rawBody =
      await getRawBody(
        req
      );

  } catch (error) {
    console.error(
      "Webhook raw body error:",
      error
    );

    return res.status(400).json({
      error:
        "Invalid webhook body"
    });
  }


  /* =======================================================
     SIGNATURE
     ======================================================= */

  const signature =
    req.headers[
      "x-signature"
    ];

  if (
    !verifySignature(
      rawBody,
      signature,
      webhookSecret
    )
  ) {
    console.error(
      "Invalid Lemon Squeezy webhook signature"
    );

    return res.status(403).json({
      error:
        "Invalid webhook signature"
    });
  }


  /* =======================================================
     PARSE PAYLOAD
     ======================================================= */

  let payload;

  try {
    payload =
      JSON.parse(
        rawBody.toString(
          "utf8"
        )
      );

  } catch (error) {
    console.error(
      "Webhook JSON parse error:",
      error
    );

    return res.status(400).json({
      error:
        "Invalid JSON payload"
    });
  }


  /* =======================================================
     EVENT
     ======================================================= */

  const eventName =
    String(
      req.headers[
        "x-event-name"
      ] ||
      payload?.meta?.event_name ||
      ""
    );


  console.log(
    "UAsset Lemon webhook:",
    eventName
  );


  /* =======================================================
     ONLY SUBSCRIPTION EVENTS
     ======================================================= */

  if (
    !eventName.startsWith(
      "subscription_"
    )
  ) {
    return res.status(200).json({
      received:
        true,

      ignored:
        true,

      event:
        eventName || null
    });
  }


  /* =======================================================
     SUBSCRIPTION DATA
     ======================================================= */

  const data =
    payload?.data;

  if (
    !data ||
    data.type !==
      "subscriptions"
  ) {
    console.error(
      "Invalid subscription webhook data"
    );

    return res.status(400).json({
      error:
        "Invalid subscription payload"
    });
  }


  const attributes =
    data.attributes ||
    {};


  /* =======================================================
     CUSTOM DATA
     ======================================================= */

  const customData =
    payload?.meta?.custom_data ||
    {};

  const application =
    customData?.application;

  const beanUserId =
    customData?.bean_user_id;


  /* =======================================================
     ONLY UASSET
     ======================================================= */

  if (
    application !==
    "uasset"
  ) {
    return res.status(200).json({
      received:
        true,

      ignored:
        true,

      reason:
        "Not a UAsset subscription"
    });
  }


  /* =======================================================
     BEAN USER REQUIRED
     ======================================================= */

  if (
    !beanUserId ||
    !isUuid(
      String(beanUserId)
    )
  ) {
    console.error(
      "Invalid Bean user ID:",
      beanUserId
    );

    return res.status(400).json({
      error:
        "Invalid Bean user ID"
    });
  }


  /* =======================================================
     VARIANT CHECK
     ======================================================= */

  const incomingVariantId =
    String(
      attributes.variant_id ??
      ""
    );

  if (
    incomingVariantId !==
    String(
      expectedVariantId
    )
  ) {
    console.error(
      "Unexpected Lemon variant:",
      incomingVariantId
    );

    return res.status(400).json({
      error:
        "Unexpected UAsset variant"
    });
  }


  /* =======================================================
     STORE CHECK
     ======================================================= */

  const incomingStoreId =
    String(
      attributes.store_id ??
      ""
    );

  if (
    incomingStoreId !==
    String(
      expectedStoreId
    )
  ) {
    console.error(
      "Unexpected Lemon store:",
      incomingStoreId
    );

    return res.status(400).json({
      error:
        "Unexpected Lemon store"
    });
  }


  /* =======================================================
     TEST MODE CHECK
     ======================================================= */

  const incomingTestMode =
    Boolean(
      attributes.test_mode
    );

  if (
    incomingTestMode !==
    expectedTestMode
  ) {
    console.error(
      "Webhook test mode mismatch:",
      {
        incomingTestMode,
        expectedTestMode
      }
    );

    return res.status(400).json({
      error:
        "Lemon test mode mismatch"
    });
  }


  /* =======================================================
     SUBSCRIPTION OBJECT
     ======================================================= */

  const subscription = {
    id:
      data.id,

    bean_user_id:
      String(beanUserId),

    attributes
  };


  /* =======================================================
     SAVE
     ======================================================= */

  try {
    await upsertSubscription(
      subscription
    );

  } catch (error) {
    console.error(
      "UAsset webhook database error:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to save subscription"
    });
  }


  /* =======================================================
     SUCCESS
     ======================================================= */

  return res.status(200).json({
    received:
      true,

    processed:
      true,

    event:
      eventName,

    subscriptionId:
      String(
        data.id
      ),

    beanUserId:
      String(
        beanUserId
      )
  });
}


/* =========================================================
   VERCEL RAW BODY CONFIG
   ========================================================= */

export const config = {
  api: {
    bodyParser: false
  }
};
