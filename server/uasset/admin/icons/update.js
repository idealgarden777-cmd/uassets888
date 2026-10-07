/* =========================================================
   UASSET ADMIN — UPDATE ICON API
   Bean authentication
   Server-side admin authorization
   Supabase database + storage
   Edit icon
   Replace SVG
   Change Free / Pro plan
   Hide / Unhide
   ========================================================= */

import { checkSvgSafety } from "../../svg-safety.js";

const ACCOUNTS_SESSION_URL =
  "https://accounts.signaturesi.com/api/auth/session";

const DEFAULT_FREE_BUCKET =
  "uasset-free";

const DEFAULT_PRO_BUCKET =
  "uasset-pro";


/* =========================================================
   REQUIRED ENV
   ========================================================= */

function requiredEnv(name) {

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

  return String(
    value
  ).trim();
}


/* =========================================================
   JSON ERROR
   ========================================================= */

function jsonError(
  res,
  status,
  error,
  code
) {

  return res
    .status(status)
    .json({
      success:
        false,

      error,

      code
    });
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
   ADMIN CHECK
   ========================================================= */

function isAdminUser(user) {

  const raw =
    process.env.UASSET_ADMIN_BEAN_IDS ||
    "";


  const allowedIds =
    raw
      .split(",")
      .map(
        value =>
          value.trim()
      )
      .filter(Boolean);


  return (
    !!user &&
    !!user.id &&
    allowedIds.includes(
      String(
        user.id
      )
    )
  );
}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanText(
  value,
  maxLength
) {

  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      maxLength
    );
}


/* =========================================================
   SVG VALIDATION
   ========================================================= */

function validateSvg(
  svg
) {

  const value =
    String(
      svg || ""
    ).trim();


  return (
    value.length > 0 &&
    value.length <= 200000 &&
    /^<svg\b/i.test(
      value
    ) &&
    /<\/svg>\s*$/i.test(
      value
    )
  );
}


/* =========================================================
   SUPABASE REQUEST
   ========================================================= */

async function supabaseRequest(
  path,
  options = {}
) {

  const supabaseUrl =
    requiredEnv(
      "SUPABASE_URL"
    );


  const serviceRoleKey =
    requiredEnv(
      "SUPABASE_SERVICE_ROLE_KEY"
    );


  return fetch(
    supabaseUrl + path,
    {

      ...options,

      headers: {

        apikey:
          serviceRoleKey,

        Authorization:
          "Bearer " +
          serviceRoleKey,

        ...(options.headers || {})
      },

      cache:
        "no-store"
    }
  );
}


/* =========================================================
   GET ICON
   ========================================================= */

async function getIcon(
  id
) {

  const query =
    new URLSearchParams();


  query.set(
    "select",
    [
      "id",
      "name",
      "category",
      "tags",
      "description",
      "plan",
      "storage_bucket",
      "storage_path",
      "is_active",
      "created_by_bean_user_id",
      "created_at",
      "updated_at"
    ].join(",")
  );


  query.set(
    "id",
    `eq.${id}`
  );


  query.set(
    "limit",
    "1"
  );


  const response =
    await supabaseRequest(
      `/rest/v1/uasset_icons?${query.toString()}`,
      {
        method:
          "GET",

        headers: {
          Accept:
            "application/json"
        }
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

    const error =
      new Error(
        `Database lookup failed (${response.status})`
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }


  if (
    !Array.isArray(data) ||
    !data[0]
  ) {

    return null;
  }


  return data[0];
}


/* =========================================================
   UPDATE DATABASE ROW
   ========================================================= */

async function updateIconRow(
  id,
  updates
) {

  const encodedId =
    encodeURIComponent(
      id
    );


  const response =
    await supabaseRequest(
      `/rest/v1/uasset_icons?id=eq.${encodedId}`,
      {
        method:
          "PATCH",

        headers: {

          "Content-Type":
            "application/json",

          Prefer:
            "return=representation"
        },

        body:
          JSON.stringify(
            updates
          )
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

    const error =
      new Error(
        `Database update failed (${response.status})`
      );


    error.status =
      response.status;


    error.data =
      data;


    throw error;
  }


  return Array.isArray(
    data
  )
    ? data[0] ||
      null
    : data;
}


/* =========================================================
   UPLOAD / REPLACE SVG
   ========================================================= */

async function uploadSvg(
  bucket,
  filePath,
  svg
) {

  const safePath =
    String(
      filePath
    )
      .split("/")
      .map(
        part =>
          encodeURIComponent(
            part
          )
      )
      .join("/");


  const response =
    await supabaseRequest(
      "/storage/v1/object/" +
        encodeURIComponent(
          bucket
        ) +
        "/" +
        safePath,
      {
        method:
          "POST",

        headers: {

          "Content-Type":
            "image/svg+xml",

          "x-upsert":
            "true"
        },

        body:
          svg
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

    const error =
      new Error(
        `Storage upload failed (${response.status})`
      );


    error.status =
      response.status;


    error.data =
      data;


    throw error;
  }


  return data;
}


/* =========================================================
   DELETE SVG
   ========================================================= */

async function removeSvg(
  bucket,
  filePath
) {

  if (
    !bucket ||
    !filePath
  ) {

    return;
  }


  try {

    const safePath =
      String(
        filePath
      )
        .split("/")
        .map(
          part =>
            encodeURIComponent(
              part
            )
        )
        .join("/");


    const response =
      await supabaseRequest(
        "/storage/v1/object/" +
          encodeURIComponent(
            bucket
          ) +
          "/" +
          safePath,
        {
          method:
            "DELETE"
        }
      );


    if (
      !response.ok
    ) {

      const data =
        await response
          .json()
          .catch(
            () => null
          );


      console.error(
        "UAsset storage delete failed:",
        {
          bucket,

          filePath,

          status:
            response.status,

          response:
            data
        }
      );
    }

  } catch (error) {

    console.error(
      "UAsset storage delete exception:",
      error
    );
  }
}


/* =========================================================
   REQUEST BODY
   ========================================================= */

function getRequestBody(
  req
) {

  let body =
    req.body ||
    {};


  if (
    typeof body ===
    "string"
  ) {

    try {

      body =
        JSON.parse(
          body
        );

    } catch {

      body =
        {};
    }
  }


  return (
    body &&
    typeof body ===
      "object"
  )
    ? body
    : {};
}


/* =========================================================
   MAIN HANDLER
   ========================================================= */

export default async function handler(
  req,
  res
) {

  /* =======================================================
     SECURITY HEADERS
     ======================================================= */

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

  res.setHeader(
    "X-Frame-Options",
    "DENY"
  );


  /* =======================================================
     METHOD
     ======================================================= */

  if (
    req.method !== "PATCH" &&
    req.method !== "POST"
  ) {

    res.setHeader(
      "Allow",
      "PATCH, POST"
    );


    return jsonError(
      res,
      405,
      "Method not allowed",
      "METHOD_NOT_ALLOWED"
    );
  }


  /* =======================================================
     BEAN AUTH
     ======================================================= */

  let user;


  try {

    user =
      await getBeanUser(
        req
      );

  } catch (error) {

    console.error(
      "UAsset admin Bean verification failed:",
      error
    );


    return jsonError(
      res,
      502,
      "Unable to verify Bean account",
      "BEAN_SESSION_ERROR"
    );
  }


  if (!user) {

    return jsonError(
      res,
      401,
      "Login with Bean ID required",
      "AUTH_REQUIRED"
    );
  }


  /* =======================================================
     ADMIN AUTHORIZATION
     ======================================================= */

  if (
    !isAdminUser(
      user
    )
  ) {

    return jsonError(
      res,
      403,
      "UAsset admin access required",
      "ADMIN_REQUIRED"
    );
  }


  /* =======================================================
     BODY
     ======================================================= */

  const body =
    getRequestBody(
      req
    );


  const id =
    cleanText(
      body.id,
      60
    ).toLowerCase();


  /* =======================================================
     ID VALIDATION
     ======================================================= */

  if (
    !id ||
    !/^[a-z0-9-]+$/.test(
      id
    )
  ) {

    return jsonError(
      res,
      400,
      "Valid icon ID is required",
      "INVALID_ID"
    );
  }


  /* =======================================================
     LOAD EXISTING ICON
     ======================================================= */

  let existingIcon;


  try {

    existingIcon =
      await getIcon(
        id
      );

  } catch (error) {

    console.error(
      "UAsset icon lookup failed:",
      error
    );


    return jsonError(
      res,
      500,
      "Unable to load icon",
      "ICON_LOOKUP_FAILED"
    );
  }


  if (
    !existingIcon
  ) {

    return jsonError(
      res,
      404,
      "Icon not found",
      "ICON_NOT_FOUND"
    );
  }


  /* =======================================================
     NORMALIZE UPDATE VALUES
     ======================================================= */

  const hasName =
    Object.prototype.hasOwnProperty.call(
      body,
      "name"
    );


  const hasCategory =
    Object.prototype.hasOwnProperty.call(
      body,
      "category"
    );


  const hasTags =
    Object.prototype.hasOwnProperty.call(
      body,
      "tags"
    );


  const hasDescription =
    Object.prototype.hasOwnProperty.call(
      body,
      "description"
    );


  const hasPlan =
    Object.prototype.hasOwnProperty.call(
      body,
      "plan"
    );


  const hasSvg =
    Object.prototype.hasOwnProperty.call(
      body,
      "svg"
    );


  const hasActive =
    Object.prototype.hasOwnProperty.call(
      body,
      "is_active"
    ) ||
    Object.prototype.hasOwnProperty.call(
      body,
      "isActive"
    );


  const name =
    hasName
      ? cleanText(
          body.name,
          120
        )
      : existingIcon.name;


  const category =
    hasCategory
      ? cleanText(
          body.category,
          80
        )
      : existingIcon.category;


  const description =
    hasDescription
      ? cleanText(
          body.description,
          1000
        )
      : (
          existingIcon.description ||
          ""
        );


  const plan =
    hasPlan
      ? (
          String(
            body.plan ||
              ""
          ).toLowerCase() ===
          "pro"
            ? "pro"
            : "free"
        )
      : existingIcon.plan;


  const tags =
    hasTags
      ? (
          Array.isArray(
            body.tags
          )
            ? body.tags
                .map(
                  tag =>
                    cleanText(
                      tag,
                      40
                    ).toLowerCase()
                )
                .filter(Boolean)
                .slice(
                  0,
                  20
                )
            : []
        )
      : (
          Array.isArray(
            existingIcon.tags
          )
            ? existingIcon.tags
            : []
        );


  let isActive =
    existingIcon.is_active ===
    true;


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "is_active"
    )
  ) {

    isActive =
      body.is_active ===
      true;
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "isActive"
    )
  ) {

    isActive =
      body.isActive ===
      true;
  }


  const svg =
    hasSvg
      ? String(
          body.svg ||
            ""
        ).trim()
      : null;


  /* =======================================================
     VALIDATION
     ======================================================= */

  if (!name) {

    return jsonError(
      res,
      400,
      "Icon name is required",
      "INVALID_NAME"
    );
  }


  if (!category) {

    return jsonError(
      res,
      400,
      "Icon category is required",
      "INVALID_CATEGORY"
    );
  }


  const svgCheck =
    hasSvg
      ? checkSvgSafety(svg)
      : { ok: true };

  if (!svgCheck.ok) {

    return jsonError(
      res,
      400,
      svgCheck.reason,
      "INVALID_SVG"
    );
  }


  /* =======================================================
     STORAGE TARGET
     ======================================================= */

  const newBucket =
    plan === "pro"
      ? (
          process.env
            .UASSET_PRO_BUCKET ||
          DEFAULT_PRO_BUCKET
        )
      : (
          process.env
            .UASSET_FREE_BUCKET ||
          DEFAULT_FREE_BUCKET
        );


  const existingBucket =
    existingIcon.storage_bucket;


  const existingPath =
    existingIcon.storage_path;


  const newPath =
    id +
    ".svg";


  const planChanged =
    plan !==
    existingIcon.plan;


  const bucketChanged =
    newBucket !==
    existingBucket;


  /* =======================================================
     PLAN CHANGE REQUIREMENT
     ======================================================= */

  if (
    planChanged &&
    !hasSvg
  ) {

    return jsonError(
      res,
      400,
      "SVG is required when changing the icon plan",
      "SVG_REQUIRED_FOR_PLAN_CHANGE"
    );
  }


  /* =======================================================
     UPDATE STATE
     ======================================================= */

  const databaseUpdates = {

    name,

    category,

    tags,

    description:
      description ||
      null,

    plan,

    is_active:
      isActive,

    updated_at:
      new Date()
        .toISOString()

  };


  let uploadedNewFile =
    false;


  let newFileNeedsUpload =
    hasSvg ||
    planChanged ||
    bucketChanged;


  /* =======================================================
     SAVE PROCESS
     ======================================================= */

  try {

    /* -----------------------------------------------------
       1. Upload new SVG when needed
       ----------------------------------------------------- */

    if (
      newFileNeedsUpload
    ) {

      if (
        !hasSvg
      ) {

        throw new Error(
          "SVG content is required for this storage update"
        );
      }


      await uploadSvg(
        newBucket,
        newPath,
        svg
      );


      uploadedNewFile =
        true;


      databaseUpdates.storage_bucket =
        newBucket;


      databaseUpdates.storage_path =
        newPath;
    }


    /* -----------------------------------------------------
       2. Update database metadata
       ----------------------------------------------------- */

    const updatedIcon =
      await updateIconRow(
        id,
        databaseUpdates
      );


    /* -----------------------------------------------------
       3. Remove old storage file if storage changed
       ----------------------------------------------------- */

    if (
      uploadedNewFile &&
      existingBucket &&
      existingPath &&
      (
        existingBucket !==
          newBucket ||
        existingPath !==
          newPath
      )
    ) {

      await removeSvg(
        existingBucket,
        existingPath
      );
    }


    /* -----------------------------------------------------
       4. Success
       ----------------------------------------------------- */

    return res
      .status(200)
      .json({

        success:
          true,

        icon:
          updatedIcon
      });


  } catch (error) {

    console.error(
      "UAsset update icon failed:",
      {
        message:
          error?.message,

        status:
          error?.status,

        data:
          error?.data,

        id,

        plan,

        newBucket,

        newPath
      }
    );


    /* -----------------------------------------------------
       Cleanup newly uploaded file
       ----------------------------------------------------- */

    if (
      uploadedNewFile &&
      (
        newBucket !==
          existingBucket ||
        newPath !==
          existingPath
      )
    ) {

      await removeSvg(
        newBucket,
        newPath
      );
    }


    /* -----------------------------------------------------
       Storage error
       ----------------------------------------------------- */

    if (
      error?.message?.startsWith(
        "Storage upload failed"
      )
    ) {

      return jsonError(
        res,
        500,
        "Icon SVG could not be uploaded to storage",
        "STORAGE_UPLOAD_FAILED"
      );
    }


    /* -----------------------------------------------------
       SVG requirement
       ----------------------------------------------------- */

    if (
      error?.message ===
      "SVG content is required for this storage update"
    ) {

      return jsonError(
        res,
        400,
        "SVG is required for this storage update",
        "SVG_REQUIRED"
      );
    }


    /* -----------------------------------------------------
       DATABASE ERROR
       ----------------------------------------------------- */

    if (
      error?.message?.startsWith(
        "Database update failed"
      )
    ) {

      return jsonError(
        res,
        500,
        "Icon metadata could not be updated",
        "DATABASE_UPDATE_FAILED"
      );
    }


    /* -----------------------------------------------------
       GENERIC ERROR
       ----------------------------------------------------- */

    return jsonError(
      res,
      500,
      "Unable to update icon",
      "ICON_UPDATE_FAILED"
    );
  }
}
