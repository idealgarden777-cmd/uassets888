import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";


/* =========================================================
   SUPABASE
   ========================================================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);


/* =========================================================
   SIGNATURE VERIFICATION
   ========================================================= */

function verifySignature(
  rawBody,
  signature,
  secret
) {
  if (
    !signature ||
    !secret
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

  const signatureBuffer =
    Buffer.from(
      String(
        signature
      ),
      "utf8"
    );

  if (
    expectedBuffer.length !==
    signatureBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    signatureBuffer
  );
}


/* =========================================================
   NORMALIZE VALUE
   ========================================================= */

function toNullableNumber(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
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
     SECRET
     ======================================================= */

  const secret =
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "LEMONSQUEEZY_WEBHOOK_SECRET is missing"
    );

    return res
      .status(500)
      .json({
        error:
          "Webhook configuration is incomplete"
      });
  }


  /* =======================================================
     RAW BODY
     ======================================================= */

  let rawBody;

  try {
    if (
      typeof req.body ===
      "string"
    ) {
      rawBody =
        req.body;
    } else {
      rawBody =
        JSON.stringify(
          req.body || {}
        );
    }
  } catch (error) {
    console.error(
      "Webhook body parsing failed:",
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

  if (
    !verifySignature(
      rawBody,
      signature,
      secret
    )
  ) {
    console.warn(
      "Invalid Lemon Squeezy webhook signature"
    );

    return res
      .status(401)
      .json({
        error:
          "Invalid signature"
      });
  }


  /* =======================================================
     PAYLOAD
     ======================================================= */

  let payload;

  try {
    payload =
      JSON.parse(
        rawBody
      );
  } catch (error) {
    console.error(
      "Webhook JSON parse failed:",
      error
    );

    return res
      .status(400)
      .json({
        error:
          "Invalid JSON"
      });
  }


  const eventName =
    payload?.meta?.event_name ||
    req.headers[
      "x-event-name"
    ] ||
    "";


  /* =======================================================
     CUSTOM DATA
     ======================================================= */

  const customData =
    payload?.meta?.custom_data ||
    {};

  const userId =
    customData?.user_id;

  const application =
    customData?.application;


  /* =======================================================
     IGNORE NON-UASSET EVENTS
     ======================================================= */

  if (
    application !==
    "uasset"
  ) {
    return res
      .status(200)
      .json({
        received:
          true
      });
  }


  /* =======================================================
     USER ID REQUIRED
     ======================================================= */

  if (!userId) {
    console.error(
      "UAsset webhook missing Bean user_id",
      {
        eventName
      }
    );

    return res
      .status(400)
      .json({
        error:
          "Missing Bean user_id"
      });
  }


  /* =======================================================
     SUBSCRIPTION DATA
     ======================================================= */

  const subscription =
    payload?.data;

  const attributes =
    subscription?.attributes ||
    {};

  const subscriptionId =
    subscription?.id;


  if (
    !subscriptionId
  ) {
    console.error(
      "Webhook missing subscription ID"
    );

    return res
      .status(400)
      .json({
        error:
          "Missing subscription ID"
      });
  }


  /* =======================================================
     ALLOWED EVENTS
     ======================================================= */

  const allowedEvents =
    new Set([
      "subscription_created",
      "subscription_updated",
      "subscription_cancelled",
      "subscription_expired",
      "subscription_payment_success",
      "subscription_payment_failed",
      "subscription_payment_recovered"
    ]);

  if (
    !allowedEvents.has(
      eventName
    )
  ) {
    return res
      .status(200)
      .json({
        received:
          true
      });
  }


  /* =======================================================
     SUBSCRIPTION RECORD
     ======================================================= */

  const record = {
    user_id:
      userId,

    provider:
      "lemonsqueezy",

    provider_subscription_id:
      String(
        subscriptionId
      ),

    store_id:
      toNullableNumber(
        attributes.store_id
      ),

    customer_id:
      toNullableNumber(
        attributes.customer_id
      ),

    order_id:
      toNullableNumber(
        attributes.order_id
      ),

    product_id:
      toNullableNumber(
        attributes.product_id
      ),

    variant_id:
      toNullableNumber(
        attributes.variant_id
      ),

    product_name:
      attributes.product_name ||
      null,

    variant_name:
      attributes.variant_name ||
      null,

    status:
      attributes.status ||
      null,

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

    updated_at:
      new Date().toISOString()
  };


  /* =======================================================
     SAVE SUBSCRIPTION
     ======================================================= */

  try {
    const {
      error
    } =
      await supabase
        .from(
          "bean_subscriptions"
        )
        .upsert(
          record,
          {
            onConflict:
              "provider_subscription_id"
          }
        );

    if (error) {
      console.error(
        "Subscription save failed:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Unable to save subscription"
        });
    }

    console.log(
      "UAsset billing webhook processed:",
      {
        eventName,
        subscriptionId,
        userId,
        status:
          attributes.status
      }
    );

    return res
      .status(200)
      .json({
        received:
          true
      });

  } catch (error) {
    console.error(
      "Webhook processing exception:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Webhook processing failed"
      });
  }
}
