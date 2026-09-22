import { createClient } from "@supabase/supabase-js";
import argon2 from "argon2";
import crypto from "node:crypto";

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

const ALLOWED_ORIGINS = new Set([
  "https://uasset.signaturesi.com",
  "https://uassets888.vercel.app",
  "https://neyo.signaturesi.com",
  "http://localhost:5173",
  "http://localhost:4173"
]);

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/@bean$/i, "");
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function setCors(req, res) {
  const origin = req.headers.origin;

  if (!origin) {
    return true;
  }

  if (!ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({
      error: "Origin not allowed"
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
    "Content-Type"
  );

  return true;
}

export default async function handler(req, res) {
  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  if (!setCors(req, res)) {
    return;
  }

  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS"
    );

    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      "POST, OPTIONS"
    );

    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const username =
    normalizeUsername(
      req.body?.username
    );

  const password =
    String(
      req.body?.password || ""
    );

  if (
    !/^[a-z0-9_]{3,20}$/.test(
      username
    ) ||
    !password
  ) {
    return res.status(400).json({
      error:
        "Invalid Bean ID or password"
    });
  }

  try {
    const {
      data: user,
      error: userError
    } = await supabase
      .from("bean_users")
      .select(
        "id, username, display_name, status"
      )
      .eq("username", username)
      .maybeSingle();

    if (userError) {
      console.error(
        "Login user lookup failed:",
        userError
      );

      return res.status(500).json({
        error: "Unable to log in"
      });
    }

    if (
      !user ||
      user.status !== "active"
    ) {
      return res.status(401).json({
        error:
          "Invalid Bean ID or password"
      });
    }

    const {
      data: credential,
      error: credentialError
    } = await supabase
      .from("bean_credentials")
      .select("password_hash")
      .eq("user_id", user.id)
      .maybeSingle();

    if (credentialError) {
      console.error(
        "Credential lookup failed:",
        credentialError
      );

      return res.status(500).json({
        error: "Unable to log in"
      });
    }

    if (!credential) {
      return res.status(401).json({
        error:
          "Invalid Bean ID or password"
      });
    }

    const passwordMatches =
      await argon2.verify(
        credential.password_hash,
        password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        error:
          "Invalid Bean ID or password"
      });
    }

    let avatarUrl = null;

    try {
      const {
        data: profile,
        error: profileError
      } = await supabase
        .from("bean_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.warn(
          "Avatar lookup failed:",
          profileError
        );
      } else {
        avatarUrl =
          profile?.avatar_url || null;
      }
    } catch (profileException) {
      console.warn(
        "Avatar lookup exception:",
        profileException
      );
    }

    const rawToken =
      crypto
        .randomBytes(32)
        .toString("base64url");

    const tokenHash =
      hashToken(rawToken);

    const expiresAt =
      new Date(
        Date.now() +
          7 *
          24 *
          60 *
          60 *
          1000
      ).toISOString();

    const {
      error: sessionError
    } = await supabase
      .from("bean_sessions")
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        user_agent:
          String(
            req.headers["user-agent"] || ""
          ).slice(0, 500)
      });

    if (sessionError) {
      console.error(
        "Session insert failed:",
        sessionError
      );

      return res.status(500).json({
        error: "Unable to log in"
      });
    }

    const cookieName =
      process.env.SESSION_COOKIE_NAME ||
      "bean_session";

    res.setHeader(
      "Set-Cookie",
      `${cookieName}=${rawToken}; Path=/; Domain=.signaturesi.com; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
    );

    return res.status(200).json({
      success: true,

      user: {
        id: user.id,
        username: user.username,
        displayName:
          user.display_name,
        avatar_url:
          avatarUrl,
        beanId:
          `${user.username}@bean`
      }
    });

  } catch (error) {
    console.error(
      "Login exception:",
      error
    );

    return res.status(500).json({
      error: "Unable to log in"
    });
  }
}
