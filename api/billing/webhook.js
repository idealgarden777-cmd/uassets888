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

const SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
  "subscription_plan_changed"
]);

/* =========================================================
   HELPERS
   ========================================================= */

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value || !String(value).trim()) {
    throw new Error(`${name} is missing`);
  }

  return String(value).trim();
}

/* =========================================================
   RAW BODY
   Lemon Squeezy signature must be calculated from the
   original raw request body.
   ========================================================= */

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(
        Buffer.isBuffer(chunk)
          ? chunk
          : Buffer.from(chunk)
      );
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", (error) => {
      reject(error);
    });
  });
}

/* =========================================================
   SIGNATURE VERIFICATION
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

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(rawBody)
      .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
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
   SUPABASE UPSERT
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
    subscription.attributes || {};

  const row = {
    bean_user_id:
      subscription.bean_user_id,

    provider:
      "lemonsqueezy",

    provider_subscription_id:
      subscriptionId,

    customer_id:
      attributes.customer_id != null
        ? String(attributes.customer_id)
        : null,

    order_id:
      attributes.order_id != null
        ? String(attributes.order_id)
        : null,

    product_id:
      attributes.product_id != null
        ? String(attributes.product_id)
        : null,

    variant_id:
      attributes.variant_id != null
        ? String(attributes.variant_id)
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
        method:
          "POST",

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
   WEBHOOK HANDLER
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

    return res
      .status(405)
      .json({
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

  } catch (error) {
    console.error(
      "UAsset webhook configuration error:",
      error.message
    );

    return res
      .status(500)
      .json({
        error:
          "Webhook configuration is incomplete"
      });
  }

  /* =======================================================
     RAW REQUEST BODY
     ======================================================= */

  let rawBody;

  try {
    rawBody =
      await getRawBody(
        req
      );

  } catch (error) {
    console.error(
      "Failed to read webhook body:",
      error
    );

    return res
      .status(400)
      .json({
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

  const validSignature =
    verifySignature(
      rawBody,
      signature,
      webhookSecret
    );

  if (!validSignature) {
    console.error(
      "Invalid Lemon Squeezy webhook signature"
    );

    return res
      .status(403)
      .json({
        error:
          "Invalid webhook signature"
      });
  }

  /* =======================================================
     PARSE JSON
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
      "Invalid webhook JSON:",
      error
    );

    return res
      .status(400)
      .json({
        error:
          "Invalid JSON payload"
      });
  }

  /* =======================================================
     EVENT NAME
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
    "Lemon Squeezy event:",
    eventName
  );

  /* =======================================================
     IGNORE EVENTS WE DO NOT PROCESS
     ======================================================= */

  if (
    !SUBSCRIPTION_EVENTS.has(
      eventName
    )
  ) {
    return res
      .status(200)
      .json({
        received:
          true,

        ignored:
          true,

        event:
          eventName || null
      });
  }

  /* =======================================================
     DATA
     ======================================================= */

  const data =
    payload?.data;

  if (
    !data ||
    data.type !==
      "subscriptions"
  ) {
    console.error(
      "Webhook does not contain a subscription object"
    );

    return res
      .status(400)
      .json({
        error:
          "Invalid subscription payload"
      });
  }

  const attributes =
    data.attributes || {};

  /* =======================================================
     UASSET CUSTOM DATA
     create-checkout.js sends:
       application
       bean_user_id
       bean_id

     Lemon returns this custom data in:
       meta.custom_data
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
    console.log(
      "Ignoring non-UAsset webhook"
    );

    return res
      .status(200)
      .json({
        received:
          true,

        ignored:
          true,

        reason:
          "Not a UAsset checkout"
      });
  }

  /* =======================================================
     BEAN USER REQUIRED
     ======================================================= */

  if (
    !beanUserId
  ) {
    console.error(
      "UAsset webhook missing bean_user_id"
    );

    return res
      .status(400)
      .json({
        error:
          "Missing Bean user ID"
      });
  }

  /* =======================================================
     VALIDATE VARIANT
     Prevent another Lemon product/variant from
     accidentally granting UAsset Pro.
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
      "Unexpected Lemon Squeezy variant:",
      incomingVariantId
    );

    return res
      .status(400)
      .json({
        error:
          "Unexpected UAsset variant"
      });
  }

  /* =======================================================
     VALIDATE STORE
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
      "Unexpected Lemon Squeezy store:",
      incomingStoreId
    );

    return res
      .status(400)
      .json({
        error:
          "Unexpected Lemon store"
      });
  }

  /* =======================================================
     BUILD SUBSCRIPTION RECORD
     ======================================================= */

  const subscription = {
    id:
      data.id,

    bean_user_id:
      beanUserId,

    attributes
  };

  /* =======================================================
     SAVE TO SUPABASE
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

    return res
      .status(500)
      .json({
        error:
          "Failed to save subscription"
      });
  }

  /* =======================================================
     SUCCESS
     ======================================================= */

  return res
    .status(200)
    .json({
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
        beanUserId
    });
}

/* =========================================================
   IMPORTANT:
   Disable Vercel's automatic body parser so the original
   raw body is available for HMAC signature verification.
   ========================================================= */

export const config = {
  api: {
    bodyParser:
      false
  }
};
