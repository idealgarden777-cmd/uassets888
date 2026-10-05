/* =========================================================
   UASSET / LEMON SQUEEZY WEBHOOK
   Billing belongs to UAsset.
   Bean is identity only.
   Production webhook security
   ========================================================= */

import crypto from "node:crypto";


/* =========================================================
   CONFIG
   ========================================================= */

const SUPABASE_TABLE =
  "uasset_subscriptions";


/* =========================================================
   ENVIRONMENT
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
   VERIFY LEMON SIGNATURE
   ========================================================= */

function verifySignature(
  rawBody,
  signature,
  secret
) {
  if (
    !rawBody ||
    !rawBody.length ||
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
