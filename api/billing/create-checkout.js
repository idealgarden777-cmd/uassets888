import { createClient } from "@supabase/supabase-js";


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
   ALLOWED ORIGINS
   ========================================================= */

const ALLOWED_ORIGINS = new Set([
  "https://uasset.signaturesi.com",
  "https://uassets888.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173"
]);


/* =========================================================
   CORS
   ========================================================= */

function setCors(req, res) {
  const origin =
    req.headers.origin;

  if (!origin) {
    return true;
  }

  if (
    !ALLOWED_ORIGINS.has(
      origin
    )
  ) {
    res.status(403).json({
      error:
        "Origin not allowed"
    });

    return false;
  }

  res.setHeader(
    "Access-Control-Allow-Origin",
    origin
  );

  res.setHeader(
    "Vary",
    "Origin"
  );

  res.setHeader(
    "Access-Control-Allow-Credentials",
    "true"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept"
  );

  return true;
}


/* =========================================================
   COOKIE READER
   ========================================================= */

function getCookie(
  req,
  name
) {
  const cookies =
    String(
      req.headers.cookie || ""
    ).split(";");

  for (const cookie of cookies) {
    const [
      key,
      ...valueParts
    ] =
      cookie
        .trim()
        .split("=");

    if (
      key === name
    ) {
      return decodeURIComponent(
        valueParts.join("=")
      );
    }
  }

  return null;
}


/* =========================================================
   USER SESSION
   ========================================================= */

async function getAuthenticatedUser(
  req
) {
  const cookieName =
    process.env.SESSION_COOKIE_NAME ||
    "bean_session";

  const rawToken =
    getCookie(
      req,
      cookieName
    );

  if (!rawToken) {
    return null;
  }

  const crypto =
    await import("node:crypto");

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

  const {
    data: session,
    error: sessionError
  } =
    await supabase
      .from("bean_sessions")
      .select(
        "user_id, expires_at, revoked_at"
      )
      .eq(
        "token_hash",
        tokenHash
      )
      .maybeSingle();

  if (
    sessionError ||
    !session
  ) {
    return null;
  }

  if (
    session.revoked_at ||
    new Date(
      session.expires_at
    ).getTime() <=
      Date.now()
  ) {
    return null;
  }

  const {
    data: user,
    error: userError
  } =
    await supabase
      .from("bean_users")
      .select(
        "id, username, display_name, email, status"
      )
      .eq(
        "id",
        session.user_id
      )
      .maybeSingle();

  if (
    userError ||
    !user ||
    user.status !== "active"
  ) {
    return null;
  }

  return user;
}


/* =========================================================
   CREATE CHECKOUT
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
    !setCors(
      req,
      res
    )
  ) {
    return;
  }

  if (
    req.method ===
    "OPTIONS"
  ) {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS"
    );

    return res
      .status(204)
      .end();
  }

  if (
    req.method !==
    "POST"
  ) {
    res.setHeader(
      "Allow",
      "POST, OPTIONS"
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

  const apiKey =
    process.env.LEMONSQUEEZY_API_KEY;

  const storeId =
    process.env.LEMONSQUEEZY_STORE_ID;

  const variantId =
    process.env.LEMONSQUEEZY_VARIANT_ID;

  if (
    !apiKey ||
    !storeId ||
    !variantId
  ) {
    console.error(
      "Lemon Squeezy environment variables are missing"
    );

    return res
      .status(500)
      .json({
        error:
          "Billing configuration is incomplete"
      });
  }


  /* =======================================================
     AUTHENTICATED BEAN USER
     ======================================================= */

  let user;

  try {
    user =
      await getAuthenticatedUser(
        req
      );
  } catch (error) {
    console.error(
      "Session verification failed:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Unable to verify account"
      });
  }

  if (!user) {
    return res
      .status(401)
      .json({
        error:
          "Please log in with Bean ID first"
      });
  }


  /* =======================================================
     CHECKOUT
     ======================================================= */

  const customData = {
    user_id:
      user.id,

    bean_id:
      `${user.username}@bean`,

    application:
      "uasset"
  };

  const checkoutPayload = {
    data: {
      type:
        "checkouts",

      attributes: {
        product_options: {
          enabled_variants: [
            Number(
              variantId
            )
          ],

          redirect_url:
            "https://uasset.signaturesi.com/#pricing"
        },

        checkout_data: {
          email:
            user.email || "",

          name:
            user.display_name ||
            user.username ||
            "",

          custom:
            customData
        },

        test_mode:
          process.env.LEMONSQUEEZY_TEST_MODE ===
          "true"
      },

      relationships: {
        store: {
          data: {
            type:
              "stores",

            id:
              String(
                storeId
              )
          }
        },

        variant: {
          data: {
            type:
              "variants",

            id:
              String(
                variantId
              )
          }
        }
      }
    }
  };


  try {
    const response =
      await fetch(
        "https://api.lemonsqueezy.com/v1/checkouts",
        {
          method:
            "POST",

          headers: {
            Accept:
              "application/vnd.api+json",

            "Content-Type":
              "application/vnd.api+json",

            Authorization:
              `Bearer ${apiKey}`
          },

          body:
            JSON.stringify(
              checkoutPayload
            )
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      !response.ok
    ) {
      console.error(
        "Lemon checkout creation failed:",
        data
      );

      return res
        .status(502)
        .json({
          error:
            "Unable to create checkout"
        });
    }

    const checkoutUrl =
      data?.data?.attributes?.url;

    if (!checkoutUrl) {
      console.error(
        "Lemon checkout URL missing:",
        data
      );

      return res
        .status(502)
        .json({
          error:
            "Checkout URL was not returned"
        });
    }

    return res
      .status(200)
      .json({
        success:
          true,

        checkoutUrl
      });

  } catch (error) {
    console.error(
      "Lemon checkout exception:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Unable to create checkout"
      });
  }
}
