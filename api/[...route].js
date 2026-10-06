/*
=========================================================
UASSET — CENTRAL API ROUTER

Purpose:
- Keep UAsset API inside one Vercel Serverless Function
- Prevent Vercel Hobby 12-function limit
- Preserve existing API URLs
- Keep webhook raw-body handling intact
=========================================================
*/


/* =======================================================
   ROUTE MODULES
   ======================================================= */

import iconsHandler
  from "../server/uasset/icons.js";

import proAssetsHandler
  from "../server/uasset/assets/pro.js";


import createCheckoutHandler
  from "../server/uasset/billing/create-checkout.js";

import billingStatusHandler
  from "../server/uasset/billing/status.js";

import billingWebhookHandler
  from "../server/uasset/billing/webhook.js";


/* =======================================================
   ADMIN — ICONS
   ======================================================= */

import adminIconsCreateHandler
  from "../server/uasset/admin/icons/create.js";

import adminIconsDeleteHandler
  from "../server/uasset/admin/icons/delete.js";

import adminIconsListHandler
  from "../server/uasset/admin/icons/list.js";

import adminIconsUpdateHandler
  from "../server/uasset/admin/icons/update.js";


/* =======================================================
   ADMIN — COLLECTIONS
   ======================================================= */

import adminCollectionsCreateHandler
  from "../server/uasset/admin/collections/create.js";

import adminCollectionsDeleteHandler
  from "../server/uasset/admin/collections/delete.js";

import adminCollectionsListHandler
  from "../server/uasset/admin/collections/list.js";

import adminCollectionsUpdateHandler
  from "../server/uasset/admin/collections/update.js";


/* =======================================================
   ADMIN — CATEGORIES
   ======================================================= */

import adminCategoriesCreateHandler
  from "../server/uasset/admin/categories/create.js";

import adminCategoriesDeleteHandler
  from "../server/uasset/admin/categories/delete.js";

import adminCategoriesListHandler
  from "../server/uasset/admin/categories/list.js";

import adminCategoriesUpdateHandler
  from "../server/uasset/admin/categories/update.js";


/* =======================================================
   ROUTE TABLE
   ======================================================= */

const ROUTES = new Map([

  /* =====================================================
     PUBLIC ICONS
     ===================================================== */

  [
    "GET /api/icons",
    iconsHandler
  ],


  /* =====================================================
     PRO ASSETS
     ===================================================== */

  [
    "GET /api/assets/pro",
    proAssetsHandler
  ],


  /* =====================================================
     BILLING
     ===================================================== */

  [
    "POST /api/billing/create-checkout",
    createCheckoutHandler
  ],

  [
    "GET /api/billing/status",
    billingStatusHandler
  ],

  [
    "POST /api/billing/webhook",
    billingWebhookHandler
  ],


  /* =====================================================
     ADMIN — ICONS
     ===================================================== */

  [
    "POST /api/admin/icons/create",
    adminIconsCreateHandler
  ],

  [
    "GET /api/admin/icons/list",
    adminIconsListHandler
  ],

  [
    "PATCH /api/admin/icons/update",
    adminIconsUpdateHandler
  ],

  [
    "POST /api/admin/icons/update",
    adminIconsUpdateHandler
  ],

  [
    "DELETE /api/admin/icons/delete",
    adminIconsDeleteHandler
  ],

  [
    "POST /api/admin/icons/delete",
    adminIconsDeleteHandler
  ],


  /* =====================================================
     ADMIN — COLLECTIONS
     ===================================================== */

  [
    "POST /api/admin/collections/create",
    adminCollectionsCreateHandler
  ],

  [
    "GET /api/admin/collections/list",
    adminCollectionsListHandler
  ],

  [
    "PATCH /api/admin/collections/update",
    adminCollectionsUpdateHandler
  ],

  [
    "POST /api/admin/collections/update",
    adminCollectionsUpdateHandler
  ],

  [
    "DELETE /api/admin/collections/delete",
    adminCollectionsDeleteHandler
  ],

  [
    "POST /api/admin/collections/delete",
    adminCollectionsDeleteHandler
  ],


  /* =====================================================
     ADMIN — CATEGORIES
     ===================================================== */

  [
    "POST /api/admin/categories/create",
    adminCategoriesCreateHandler
  ],

  [
    "GET /api/admin/categories/list",
    adminCategoriesListHandler
  ],

  [
    "PATCH /api/admin/categories/update",
    adminCategoriesUpdateHandler
  ],

  [
    "PUT /api/admin/categories/update",
    adminCategoriesUpdateHandler
  ],

  [
    "POST /api/admin/categories/update",
    adminCategoriesUpdateHandler
  ],

  [
    "DELETE /api/admin/categories/delete",
    adminCategoriesDeleteHandler
  ],

  [
    "POST /api/admin/categories/delete",
    adminCategoriesDeleteHandler
  ]

]);


/* =======================================================
   PATH
   ======================================================= */

function getPath(req) {

  const rawUrl =
    String(
      req.url || "/"
    );


  const url =
    new URL(
      rawUrl,
      "http://uasset.internal"
    );


  return url.pathname;
}


/* =======================================================
   QUERY
   ======================================================= */

function getQuery(req) {

  const rawUrl =
    String(
      req.url || "/"
    );


  const url =
    new URL(
      rawUrl,
      "http://uasset.internal"
    );


  const query = {};


  for (
    const [
      key,
      value
    ]
    of url.searchParams.entries()
  ) {

    if (
      query[key] === undefined
    ) {

      query[key] =
        value;

      continue;
    }


    if (
      Array.isArray(
        query[key]
      )
    ) {

      query[key].push(
        value
      );

      continue;
    }


    query[key] = [
      query[key],
      value
    ];
  }


  return query;
}


/* =======================================================
   READ REQUEST BODY
   ======================================================= */

async function readRequestBody(
  req
) {

  /*
  Vercel may already provide req.body.
  */

  if (
    req.body !== undefined &&
    req.body !== null
  ) {

    if (
      typeof req.body ===
      "object"
    ) {

      return req.body;
    }


    if (
      typeof req.body ===
      "string"
    ) {

      try {

        return JSON.parse(
          req.body
        );

      } catch {

        return {};
      }
    }
  }


  /*
  Body parser is disabled because
  Lemon Squeezy webhook needs the
  original raw request stream.
  */

  const chunks = [];


  for await (
    const chunk of req
  ) {

    chunks.push(
      Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk)
    );
  }


  if (
    chunks.length === 0
  ) {

    return {};
  }


  const rawBody =
    Buffer.concat(
      chunks
    );


  if (
    rawBody.length === 0
  ) {

    return {};
  }


  const text =
    rawBody.toString(
      "utf8"
    );


  try {

    return JSON.parse(
      text
    );

  } catch {

    return {};
  }
}


/* =======================================================
   JSON ERROR
   ======================================================= */

function sendError(
  res,
  status,
  message,
  code
) {

  if (
    res.headersSent
  ) {

    return;
  }


  return res
    .status(status)
    .json({
      success: false,
      error: message,
      code
    });
}


/* =======================================================
   MAIN HANDLER
   ======================================================= */

export default async function handler(
  req,
  res
) {

  /*
  Basic security header.
  */

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );


  /*
  Resolve request path.
  */

  const path =
    getPath(req);


  /*
  Resolve query parameters.
  */

  req.query =
    getQuery(req);


  /*
  Find handler.
  */

  const route =
    ROUTES.get(
      `${req.method} ${path}`
    );


  /*
  Unknown route.
  */

  if (!route) {

    return sendError(
      res,
      404,
      "API route not found",
      "ROUTE_NOT_FOUND"
    );
  }


  /*
  IMPORTANT:
  Lemon Squeezy webhook must receive
  the original request stream itself.

  Therefore we DO NOT read req for
  webhook requests.
  */

  const isWebhook =
    path ===
    "/api/billing/webhook";


  /*
  Parse normal JSON request bodies.
  */

  if (
    !isWebhook &&
    (
      req.method === "POST" ||
      req.method === "PATCH" ||
      req.method === "PUT"
    )
  ) {

    try {

      req.body =
        await readRequestBody(
          req
        );

    } catch (error) {

      console.error(
        "UAsset request body error:",
        error
      );


      return sendError(
        res,
        400,
        "Invalid request body",
        "INVALID_REQUEST_BODY"
      );
    }
  }


  /*
  Execute selected handler.
  */

  try {

    return await route(
      req,
      res
    );

  } catch (error) {

    console.error(
      "UAsset API error:",
      error
    );


    if (
      res.headersSent
    ) {

      return;
    }


    return sendError(
      res,
      500,
      "Internal server error",
      "INTERNAL_SERVER_ERROR"
    );
  }
}


/* =======================================================
   VERCEL CONFIG
   ======================================================= */

export const config = {

  api: {

    /*
    We manually parse normal JSON
    requests and preserve the raw
    request stream for the webhook.
    */

    bodyParser: false
  }

};
