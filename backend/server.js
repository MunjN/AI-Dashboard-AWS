import express from "express";
import cors from "cors";
import csv from "csvtojson";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import LoginLog from "./models/LoginLog.js";
import ExportLog from "./models/ExportLog.js";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mongo connect
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch(err => console.error("❌ Mongo connection error:", err));

/* ---------------------------
   ✅ Cognito JWT verification
---------------------------- */
const REGION = process.env.COGNITO_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const jwks = jwksClient({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  jwks.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
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

// helper to get email+decoded from request
async function requireUser(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return null;
  }

  try {
    const decoded = await verifyCognitoToken(token);

    const email =
      decoded.email ||
      decoded["cognito:username"] ||
      decoded.username;

    if (!email) {
      res.status(400).json({ error: "No email in token" });
      return null;
    }

    return { email, decoded, token };
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
}

/* ---------------------------
   Existing CSV loading logic
---------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "data", "tools.csv");

let toolsCache = [];

const toList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;

  const s = String(v).trim();
  if (!s) return [];

  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) {
        return arr.map(x => String(x).trim()).filter(Boolean);
      }
    } catch {}
  }

  return s.split(/[,|;]/).map(x => x.trim()).filter(Boolean);
};

const toBool = (v) => {
  if (v === true || v === false) return v;
  const s = String(v || "").trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(s)) return true;
  if (["no", "n", "false", "0"].includes(s)) return false;
  return null;
};

const toNum = (v) => {
  const n = Number(String(v || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
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
      ["PARENT_ORGANIZATION", "Parent Org", "parentOrg", "parent_org", "Provider Org"]
    );

    return {
      toolName,
      infraName,
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
   ✅ Login tracking route
---------------------------- */
app.post("/api/track-login", async (req, res) => {
  const u = await requireUser(req, res);
  if (!u) return;

  try {
    const { email } = u;

    const appId = req.body?.appId || "unknown-app";
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.ip;
    const ua = req.headers["user-agent"] || "";
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

    res.json({
      ok: true,
      email: doc.email,
      loginCount: doc.loginCount,
      lastAppId: doc.lastAppId
    });
  } catch (e) {
    console.error("track-login error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   ✅ Login stats (ME-DMZ only)
---------------------------- */
app.get("/api/login-stats", async (req, res) => {
  const u = await requireUser(req, res);
  if (!u) return;

  try {
    const email = String(u.email || "").toLowerCase();

    if (!email.endsWith("@me-dmz.com")) {
      return res.status(403).json({ error: "Forbidden" });
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

    res.json({
      ok: true,
      totalLogins,
      uniqueUsers,
      topUsers,
      trendLast30Days
    });
  } catch (e) {
    console.error("login-stats error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------
   ✅ Export route (FIXED)
   max 10 TOOLS per 24h
   max 10 infraIds per export
---------------------------- */
const MAX_EXPORTS_PER_24H = 10;  // now means "tool credits"
const MAX_IDS_PER_EXPORT = 10;

app.post("/api/export", async (req, res) => {
  const u = await requireUser(req, res);
  if (!u) return;

  const { email } = u;
  const { infraIds = [], format = "json" } = req.body || {};

  if (!Array.isArray(infraIds) || infraIds.length === 0) {
    return res.status(400).json({ error: "infraIds required" });
  }

  if (infraIds.length > MAX_IDS_PER_EXPORT) {
    return res.status(400).json({
      error: `Max ${MAX_IDS_PER_EXPORT} infraIds per export`
    });
  }

  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let log = await ExportLog.findOne({ email });
  if (!log) log = await ExportLog.create({ email, events: [] });

  // keep only last 24h events
  log.events = log.events.filter(e => e.at >= since);

  // ✅ count TOOLS used in last 24h
  const toolsUsedLast24h = log.events.reduce(
    (sum, e) => sum + (e.infraIds?.length || 0),
    0
  );

  if (toolsUsedLast24h >= MAX_EXPORTS_PER_24H) {
    return res.status(403).json({
      error: `Export limit reached (${MAX_EXPORTS_PER_24H} tools per 24h)`,
      toolsUsed: toolsUsedLast24h,
      exportsLeft: 0
    });
  }

  // ✅ block if this export would exceed remaining credits
  if (toolsUsedLast24h + infraIds.length > MAX_EXPORTS_PER_24H) {
    const left = MAX_EXPORTS_PER_24H - toolsUsedLast24h;
    return res.status(403).json({
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
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("X-Exports-Left", String(exportsLeft));
    return res.send(lines.join("\n"));
  }

  res.json({
    ok: true,
    exportsLeft,
    rows: selected
  });
});

/* ---------------------------
   Existing routes
---------------------------- */
app.get("/", (req, res) => {
  res.send("AI Tools backend is running. Try /api/tools");
});

app.get("/api/tools", (req, res) => {
  res.json(toolsCache);
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/reload", async (req, res) => {
  try {
    await loadData();
    res.json({ ok: true, rows: toolsCache.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
