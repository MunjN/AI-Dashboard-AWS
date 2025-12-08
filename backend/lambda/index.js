import csv from "csvtojson";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import LoginLog from "../models/LoginLog.js";
import ExportLog from "../models/ExportLog.js";

/* ---------------------------
   Env
---------------------------- */
const MONGO_URI = process.env.MONGO_URI;
const REGION = process.env.COGNITO_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

/* ---------------------------
   Mongo (connect once)
---------------------------- */
let mongoReady = false;
async function ensureMongo() {
  if (mongoReady) return;
  if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI not set. Logs/exports will fail.");
    return;
  }
  await mongoose.connect(MONGO_URI);
  mongoReady = true;
  console.log("✅ Mongo connected");
}

/* ---------------------------
   Cognito JWT verification
---------------------------- */
const jwks = jwksClient({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, cb) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    cb(null, key.getPublicKey());
  });
}

function verifyCognitoToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      { issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}` },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

async function requireUser(headers) {
  const auth = headers?.authorization || headers?.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return { ok: false, status: 401, body: { error: "Missing token" } };
  }

  try {
    const decoded = await verifyCognitoToken(token);
    const email =
      decoded.email ||
      decoded["cognito:username"] ||
      decoded.username;

    if (!email) {
      return { ok: false, status: 401, body: { error: "No email in token" } };
    }

    return { ok: true, user: { email, decoded, token } };
  } catch (e) {
    return { ok: false, status: 401, body: { error: "Invalid token" } };
  }
}

/* ---------------------------
   CSV loading (same as Express)
---------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "data", "tools.csv");

let toolsCache = [];

const toBool = (x) =>
  String(x || "").trim().toLowerCase() === "true" ||
  String(x || "").trim() === "1";

const toNum = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
};

const toList = (x) => {
  if (x == null) return [];
  if (Array.isArray(x)) return x;
  return String(x)
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const pick = (row, keys, fallback = null) => {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== "") return row[k];
  }
  return fallback;
};

async function loadData() {
  const rows = await csv().fromFile(DATA_PATH);

  toolsCache = rows.map((r) => {
    const toolName = pick(r, ["NAME", "Tool Name", "toolName", "tool_name", "Name"]);
    const infraName = pick(
      r,
      ["INFRA_NAME", "Infra Name", "infraName", "infra_name", "NAME", "Tool Name"],
      toolName
    );
    const parentOrg = pick(
      r,
      ["PARENT_ORG", "Parent Org", "parentOrg", "parent_org"]
    );

    return {
      infraId: pick(r, ["INFRA_ID", "Infra_ID", "infraId", "infra_id"]),
      infraName,
      toolName,
      url: pick(r, ["URL", "Tool URL", "url"]),
      category: pick(r, ["CATEGORY", "Category", "category"]),
      tags: toList(pick(r, ["TAGS", "Tags", "tags"])),
      strengths: toList(pick(r, ["STRENGTHS", "Strengths", "strengths"])),
      weaknesses: toList(pick(r, ["WEAKNESSES", "Weaknesses", "weaknesses"])),

      pricingModel: pick(r, ["PRICING_MODEL", "Pricing Model", "pricingModel", "pricing_model"]),
      pricingNotes: pick(r, ["PRICING_NOTES", "Pricing Notes", "pricingNotes", "pricing_notes"]),
      trialAvailable: toBool(pick(r, ["TRIAL_AVAILABLE", "Trial Available", "trialAvailable", "trial_available"])),
      openSource: toBool(pick(r, ["OPEN_SOURCE", "Open Source", "openSource", "open_source"])),

      supportedPlatforms: toList(pick(r, ["SUPPORTED_PLATFORMS", "Supported Platforms", "supportedPlatforms", "supported_platforms"])),
      supportedContentTypes: toList(pick(r, ["SUPPORTED_CONTENT_TYPES", "Supported Content Types", "supportedContentTypes", "supported_content_types"])),
      tasks: toList(pick(r, ["TASKS", "Tasks", "tasks"])),
      softwareType: pick(r, ["SOFTWARE_TYPE", "Software Type", "softwareType", "software_type"]),
      expectedInput: toList(pick(r, ["EXPECTED_INPUT", "Expected Input", "expectedInput", "expected_input"])),
      generatedOutput: toList(pick(r, ["GENERATED_OUTPUT", "Generated Output", "generatedOutput", "generated_output"])),
      modelType: pick(r, ["MODEL_PRIVATE_OR_PUBLIC", "Model Type", "modelType", "model_type"]),
      foundationalModel: pick(r, ["FOUNDATIONAL_MODEL", "Foundational Model", "foundationalModel", "foundational_model"]),
      inferenceLocation: pick(r, ["INFERENCE_LOCATION", "Inference Location", "inferenceLocation", "inference_location"]),
      hasApi: toBool(pick(r, ["HAS_API", "Has API", "hasApi", "has_api"])),
      yearLaunched: toNum(pick(r, ["YEAR_LAUNCHED", "Year Launched", "yearLaunched", "year_launched"])),

      parentOrg,
      orgMaturity: pick(r, ["ORGANIZATION_MATURITY", "Org Maturity", "orgMaturity", "org_maturity", "Maturity"]),
      fundingType: pick(r, ["FUNDING", "Funding", "fundingType", "funding_type", "Funding Type"]),
      businessModel: pick(r, ["BUSINESS_MODEL", "Business Model", "businessModel", "business_model"]),
      ipCreationPotential: pick(r, ["POTENTIAL_FOR_IP", "Potential for IP Creation", "ipCreationPotential", "ip_creation_potential"]),
      yearCompanyFounded: toNum(pick(r, ["YEAR_COMPANY_FOUNDED", "Year Company Founded", "yearCompanyFounded", "year_company_founded"])),
      legalCasePending: toBool(pick(r, ["LEGAL_CASE_PENDING", "Legal Case Pending", "legalCasePending", "legal_case_pending"])),

      _raw: r
    };
  });

  console.log(`Loaded ${toolsCache.length} rows from tools.csv`);
}

await loadData();

/* ---------------------------
   Export limits (same as Express)
---------------------------- */
const MAX_EXPORTS_PER_24H = 10;  // "tool credits"
const MAX_IDS_PER_EXPORT = 10;

/* ---------------------------
   Response helper (CORS)
---------------------------- */
function response(statusCode, body, extraHeaders = {}, isBase64Encoded = false) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    ...extraHeaders
  };

  return {
    statusCode,
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
    isBase64Encoded
  };
}

function getEventMethod(event) {
  return (
    event?.requestContext?.http?.method ||
    event?.httpMethod ||
    "GET"
  );
}

function getEventPath(event) {
  return (
    event?.rawPath ||
    event?.path ||
    "/"
  );
}

/* ---------------------------
   Lambda handler (routing)
---------------------------- */
export const handler = async (event) => {
  const method = getEventMethod(event);
  const route = getEventPath(event);
  const headers = event.headers || {};

  // Handle preflight
  if (method === "OPTIONS") {
    return response(200, "");
  }

  // Parse JSON body if present
  let bodyJson = null;
  if (event.body) {
    try {
      bodyJson = event.isBase64Encoded
        ? JSON.parse(Buffer.from(event.body, "base64").toString("utf8"))
        : JSON.parse(event.body);
    } catch {
      bodyJson = null;
    }
  }

  try {
    /* ---------------------------
       GET /
    ---------------------------- */
    if (method === "GET" && route === "/") {
      return response(200, "AI Tools backend is running. Try /api/tools", {
        "Content-Type": "text/plain"
      });
    }

    /* ---------------------------
       GET /api/health
    ---------------------------- */
    if (method === "GET" && route === "/api/health") {
      return response(200, { ok: true });
    }

    /* ---------------------------
       GET /api/tools
    ---------------------------- */
    if (method === "GET" && route === "/api/tools") {
      return response(200, toolsCache);
    }

    /* ---------------------------
       POST /api/reload
    ---------------------------- */
    if (method === "POST" && route === "/api/reload") {
      await loadData();
      return response(200, { ok: true, rows: toolsCache.length });
    }

    /* ---------------------------
       POST /api/track-login
    ---------------------------- */
    if (method === "POST" && route === "/api/track-login") {
      const auth = await requireUser(headers);
      if (!auth.ok) return response(auth.status, auth.body);

      await ensureMongo();

      const { email } = auth.user;
      const appId = bodyJson?.appId || "unknown-app";
      const ip =
        headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        headers["X-Forwarded-For"]?.split(",")[0]?.trim() ||
        "";
      const ua = headers["user-agent"] || headers["User-Agent"] || "";
      const now = new Date();

      const doc = await LoginLog.findOneAndUpdate(
        { email },
        {
          $set: {
            lastLoginAt: now,
            lastIp: ip,
            lastUserAgent: ua,
            lastAppId: appId
          },
          $inc: { loginCount: 1 },
          $push: {
            events: { at: now, appId, ip, ua }
          }
        },
        { upsert: true, new: true }
      );

      return response(200, {
        ok: true,
        email: doc.email,
        loginCount: doc.loginCount,
        lastAppId: doc.lastAppId
      });
    }

    /* ---------------------------
       GET /api/login-stats
    ---------------------------- */
    if (method === "GET" && route === "/api/login-stats") {
      const auth = await requireUser(headers);
      if (!auth.ok) return response(auth.status, auth.body);

      await ensureMongo();

      const email = String(auth.user.email || "").toLowerCase();
      if (!email.endsWith("@me-dmz.com")) {
        return response(403, { error: "Forbidden" });
      }

      const totalLoginsAgg = await LoginLog.aggregate([
        { $group: { _id: null, total: { $sum: "$loginCount" } } }
      ]);
      const totalLogins = totalLoginsAgg[0]?.total || 0;

      const uniqueUsers = await LoginLog.countDocuments();

      const topUsers = await LoginLog.find({})
        .sort({ loginCount: -1, lastLoginAt: -1 })
        .limit(20)
        .select({ email: 1, loginCount: 1, lastLoginAt: 1, lastAppId: 1 });

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const trendAgg = await LoginLog.aggregate([
        { $unwind: "$events" },
        { $match: { "events.at": { $gte: since } } },
        {
          $group: {
            _id: {
              day: {
                $dateToString: { format: "%Y-%m-%d", date: "$events.at" }
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.day": 1 } }
      ]);

      const trendLast30Days = trendAgg.map(r => ({
        day: r._id.day,
        count: r.count
      }));

      return response(200, {
        ok: true,
        totalLogins,
        uniqueUsers,
        topUsers,
        trendLast30Days
      });
    }

    /* ---------------------------
       POST /api/export
    ---------------------------- */
    if (method === "POST" && route === "/api/export") {
      const auth = await requireUser(headers);
      if (!auth.ok) return response(auth.status, auth.body);

      await ensureMongo();

      const { email } = auth.user;
      const { infraIds = [], format = "json" } = bodyJson || {};

      if (!Array.isArray(infraIds) || infraIds.length === 0) {
        return response(400, { error: "infraIds required" });
      }

      if (infraIds.length > MAX_IDS_PER_EXPORT) {
        return response(400, {
          error: `Max ${MAX_IDS_PER_EXPORT} infraIds per export`
        });
      }

      const now = new Date();
      const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      let log = await ExportLog.findOne({ email });
      if (!log) log = await ExportLog.create({ email, events: [] });

      // keep only last 24h events
      log.events = log.events.filter(e => e.at >= since);

      // count TOOLS used in last 24h
      const toolsUsedLast24h = log.events.reduce(
        (sum, e) => sum + (e.infraIds?.length || 0),
        0
      );

      if (toolsUsedLast24h >= MAX_EXPORTS_PER_24H) {
        return response(403, {
          error: `Export limit reached (${MAX_EXPORTS_PER_24H} tools per 24h)`,
          toolsUsed: toolsUsedLast24h,
          exportsLeft: 0
        });
      }

      // block if this export would exceed remaining credits
      if (toolsUsedLast24h + infraIds.length > MAX_EXPORTS_PER_24H) {
        const left = MAX_EXPORTS_PER_24H - toolsUsedLast24h;
        return response(403, {
          error: `Not enough credits. You have ${left} tool exports left in the last 24h.`,
          toolsUsed: toolsUsedLast24h,
          exportsLeft: left
        });
      }

      const selected = toolsCache.filter(r => {
        const id =
          r._raw?.INFRA_ID ||
          r._raw?.infra_id ||
          r._raw?.Infra_ID;
        return infraIds.includes(id);
      });

      // record export event
      log.events.push({ at: now, infraIds, format });
      await log.save();

      const exportsLeft =
        MAX_EXPORTS_PER_24H - (toolsUsedLast24h + infraIds.length);

      if (format === "csv") {
        const headers = Object.keys(selected[0] || {});
        const lines = [
          headers.join(","),
          ...selected.map(row =>
            headers.map(h => JSON.stringify(row[h] ?? "")).join(",")
          )
        ];

        return response(
          200,
          lines.join("\n"),
          {
            "Content-Type": "text/csv",
            "X-Exports-Left": String(exportsLeft)
          }
        );
      }

      return response(200, {
        ok: true,
        exportsLeft,
        rows: selected
      });
    }

    // Fallback
    return response(404, { error: "Not found" });

  } catch (e) {
    console.error("Lambda error:", e);
    return response(500, { error: "Server error" });
  }
};
