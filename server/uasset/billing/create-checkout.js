/* =========================================================
   UASSET / LEMON SQUEEZY CHECKOUT
   Identity comes from central Bean Accounts.
   Billing belongs to UAsset.
   ========================================================= */

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const LEMON_CHECKOUT_URL =
  "https://api.lemonsqueezy.com/v1/checkouts";


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

  let apiKey;
  let storeId;
  let variantId;

  const testMode =
    String(
      process.env.LEMONSQUEEZY_TEST_MODE ||
        "true"
    ).toLowerCase() ===
    "true";


  try {
    apiKey =
      getRequiredEnv(
        "LEMONSQUEEZY_API_KEY"
      );

    storeId =
      getRequiredEnv(
        "LEMONSQUEEZY_STORE_ID"
      );

    variantId =
      getRequiredEnv(
        "LEMONSQUEEZY_VARIANT_ID"
      );

  } catch (error) {
    console.error(
      "UAsset billing configuration error:",
      error.message
    );

    return res
      .status(500)
      .json({
        error:
          "Billing configuration is incomplete"
      });
  }


  /* =======================================================
     VERIFY BEAN LOGIN
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
        error:
          "Unable to verify Bean account"
      });
  }


  /* =======================================================
     LOGIN REQUIRED
     ======================================================= */

  if (!user) {
    return res
      .status(401)
      .json({
        error:
          "Please log in with Bean ID first"
      });
  }


  /* =======================================================
     USER ID REQUIRED
     ======================================================= */

  if (!user.id) {
    console.error(
      "Bean session has no user ID"
    );

    return res
      .status(500)
      .json({
        error:
          "Bean user identity is missing"
      });
  }


  /* =======================================================
     CUSTOM DATA
     This comes back later in Lemon webhooks.
     ======================================================= */

  const customData = {
    application:
      "uasset",

    bean_user_id:
      String(
        user.id
      ),

    bean_id:
      user.beanId ||
      (
        user.username
          ? `${user.username}@bean`
          : null
      )
  };


  /* =======================================================
     CHECKOUT PAYLOAD
     ======================================================= */

  const payload = {
    data: {
      type:
        "checkouts",

      attributes: {
        checkout_options: {
          embed:
            false,

          media:
            true,

          logo:
            true,

          desc:
            true,

          discount:
            true,

          skip_trial:
            false,

          subscription_preview:
            true
        },

        product_options: {
          redirect_url:
            "https://uasset.signaturesi.com/#pricing",

          enabled_variants: [
            String(
              variantId
            )
          ],

          receipt_button_text:
            "Return to UAsset",

          receipt_link_url:
            "https://uasset.signaturesi.com/#pricing",

          receipt_thank_you_note:
            "Thank you for subscribing to UAsset Pro."
        },

        checkout_data: {
          email:
            user.email ||
            undefined,

          name:
            user.displayName ||
            user.username ||
            undefined,

          custom:
            customData
        },

        test_mode:
          testMode
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


  /* =======================================================
     CALL LEMON SQUEEZY
     ======================================================= */

  try {
    const response =
      await fetch(
        LEMON_CHECKOUT_URL,
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
              payload
            )
        }
      );


    const data =
      await response
        .json()
        .catch(
          () => ({})
        );


    /* =====================================================
       LEMON ERROR
       ===================================================== */

    if (!response.ok) {
      console.error(
        "Lemon Squeezy checkout error:",
        {
          status:
            response.status,

          statusText:
            response.statusText,

          response:
            data
        }
      );

      const details =
        Array.isArray(
          data?.errors
        )
          ? data.errors.map(
              error => ({
                status:
                  error?.status ||
                  null,

                code:
                  error?.code ||
                  null,

                title:
                  error?.title ||
                  null,

                detail:
                  error?.detail ||
                  null
              })
            )
          : [];

      return res
        .status(502)
        .json({
          error:
            details[0]?.detail ||
            details[0]?.title ||
            "Unable to create UAsset Pro checkout",

          provider:
            "lemonsqueezy",

          providerStatus:
            response.status,

          details
        });
    }


    /* =====================================================
       GET CHECKOUT URL
       ===================================================== */

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
            "Checkout URL was not returned",

          provider:
            "lemonsqueezy",

          providerStatus:
            response.status,

          response:
            data
        });
    }


    /* =====================================================
       SUCCESS
       ===================================================== */

    return res
      .status(200)
      .json({
        success:
          true,

        checkoutUrl,

        testMode
      });

  } catch (error) {
    console.error(
      "UAsset checkout exception:",
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
