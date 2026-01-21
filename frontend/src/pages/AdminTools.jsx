import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

function getIdToken() {
  return Cookies.get("idToken") || "";
}

function authHeaders() {
  const t = getIdToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function isInternalEmail(email) {
  return String(email || "").toLowerCase().endsWith("@me-dmz.com");
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function toList(x) {
  if (x == null) return [];
  if (Array.isArray(x)) return x.map(v => String(v ?? "").trim()).filter(Boolean);
  return [String(x).trim()].filter(Boolean);
}

function uniq(arr) {
  return Array.from(new Set((arr || []).map(v => String(v ?? "").trim()).filter(Boolean)));
}

export default function AdminTools() {
  const navigate = useNavigate();

  // Your app already stores userEmail in cookies via AuthContext
  const userEmail = Cookies.get("userEmail") || "";
  const isAdmin = isInternalEmail(userEmail);

  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [infraId, setInfraId] = useState("");

  const [options, setOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [q, setQ] = useState("");
  const [matches, setMatches] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const [forceCreate, setForceCreate] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    parentOrg: "",
    link: "",
    aiType: "",
    orgMaturity: "",
    tasks: [],
    inferenceLocation: "",
    desc: "",
    softwareType: "",
    expectedInput: [],
    generatedOutput: [],
    eulaLink: "",
    foundationalModel: "",
    businessModel: "",
    legalCasePending: "NO",
    hasApi: "NO",
    yearCompanyFounded: "",
    yearLaunched: "",
    funding: ""
  });

  const fundingDef = useMemo(() => {
    const defs = options?.fundingDefs || {};
    return form.funding ? (defs[form.funding] || "") : "";
  }, [options, form.funding]);

  // Simple debounce for suggest
  const suggestTimer = useRef(null);

  useEffect(() => {
    if (!isAdmin) {
      // keep it simple: bounce to home
      navigate("/");
      return;
    }
  }, [isAdmin, navigate]);

  async function fetchOptions() {
    setError("");
    setLoadingOptions(true);
    try {
      const res = await fetch(`${API_BASE}/api/options`, {
        method: "GET",
        headers: { ...authHeaders() }
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load options");
      setOptions(data);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoadingOptions(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function runSuggest(nextQ) {
    const qq = String(nextQ || "").trim();
    if (!qq) {
      setMatches([]);
      return;
    }
    setLoadingSuggest(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/tools/suggest?q=${encodeURIComponent(qq)}`, {
        method: "GET",
        headers: { ...authHeaders() }
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Suggest failed");
      setMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch (e) {
      setError(String(e?.message || e));
      setMatches([]);
    } finally {
      setLoadingSuggest(false);
    }
  }

  function onChangeQ(val) {
    setQ(val);
    setNotice("");
    setForceCreate(false);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => runSuggest(val), 250);
  }

  async function loadToolForEdit(selectedInfraId) {
    setError("");
    setNotice("");
    setSaving(false);
    setDeleting(false);

    try {
      const res = await fetch(`${API_BASE}/api/tool?infraId=${encodeURIComponent(selectedInfraId)}`, {
        method: "GET",
        headers: { ...authHeaders() }
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load tool");

      const t = data.tool || {};
      setMode("edit");
      setInfraId(t.infraId || selectedInfraId);

      setForm({
        name: t.infraName || t.toolName || "",
        parentOrg: t.parentOrg || "",
        link: t.url || "",
        aiType: t.aiType || "",
        orgMaturity: t.orgMaturity || "",
        tasks: uniq(toList(t.tasks)),
        inferenceLocation: t.inferenceLocation || "",
        desc: t.desc || "",
        softwareType: t.softwareType || "",
        expectedInput: uniq(toList(t.expectedInput)),
        generatedOutput: uniq(toList(t.generatedOutput)),
        eulaLink: t.eulaLink || "",
        foundationalModel: t.foundationalModel || "",
        businessModel: t.businessModel || "",
        legalCasePending: (t.legalCasePending || "NO").toUpperCase(),
        hasApi: (t.hasApi || "NO").toUpperCase(),
        yearCompanyFounded: t.yearCompanyFounded ?? "",
        yearLaunched: t.yearLaunched ?? "",
        funding: t.fundingType || ""
      });
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  function resetToCreate() {
    setMode("create");
    setInfraId("");
    setMatches([]);
    setQ("");
    setForceCreate(false);
    setNotice("");
    setError("");
    setForm({
      name: "",
      parentOrg: "",
      link: "",
      aiType: "",
      orgMaturity: "",
      tasks: [],
      inferenceLocation: "",
      desc: "",
      softwareType: "",
      expectedInput: [],
      generatedOutput: [],
      eulaLink: "",
      foundationalModel: "",
      businessModel: "",
      legalCasePending: "NO",
      hasApi: "NO",
      yearCompanyFounded: "",
      yearLaunched: "",
      funding: ""
    });
  }

  async function save() {
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const body = {
        mode,
        infraId: mode === "edit" ? infraId : undefined,
        forceCreate: mode === "create" ? !!forceCreate : undefined,
        data: {
          ...form,
          fundingDef // (server will also auto-fill; this is mostly for UI parity)
        }
      };

      const res = await fetch(`${API_BASE}/api/tools/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));

      // Server uses 409 for “looks like duplicate”
      if (res.status === 409) {
        setMatches(Array.isArray(data?.matches) ? data.matches : []);
        setError(data?.error || "This tool looks like it already exists.");
        setSaving(false);
        return;
      }

      if (!res.ok || !data?.ok) {
        const msg = (data?.errors && data.errors.join(" ")) || data?.error || "Save failed";
        throw new Error(msg);
      }

      if (mode === "create") {
        setNotice(`Created ✅ (infraId: ${data.infraId})`);
        // After create, load it into edit mode so the modal feels “done”
        await loadToolForEdit(data.infraId);
      } else {
        setNotice("Updated ✅");
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function softDelete() {
    if (mode !== "edit" || !infraId) return;
    const ok = window.confirm("Soft delete this tool? (It will disappear from lists.)");
    if (!ok) return;

    setDeleting(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${API_BASE}/api/tools/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ infraId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Delete failed");
      setNotice("Deleted ✅");
      resetToCreate();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setDeleting(false);
    }
  }

  const canSubmit = useMemo(() => {
    // Light client-side guard; server does the real validation.
    const nameOk = String(form.name || "").trim().length > 0;
    const descOk = String(form.desc || "").trim().length >= 50;
    return nameOk && descOk;
  }, [form.name, form.desc]);

  const scoreBadge = (s) => {
    const n = clamp01(Number(s));
    const pct = Math.round(n * 100);
    const tone =
      n >= 0.9 ? "bg-red-500/15 text-red-200 border-red-500/30" :
      n >= 0.75 ? "bg-amber-500/15 text-amber-200 border-amber-500/30" :
      "bg-white/10 text-white/70 border-white/15";
    return (
      <span className={classNames("text-xs px-2 py-0.5 rounded-full border", tone)}>
        {pct}%
      </span>
    );
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-white/60">
              <Link to="/stats" className="hover:underline">Admin Stats</Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">Tools</span>
            </div>
            <h1 className="text-2xl font-semibold mt-1">Manage Tools</h1>
            <p className="text-white/60 mt-1">
              Create new infra tools or edit existing ones. Updates set <span className="text-white/80">lastUpdatedBy</span> automatically.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetToCreate}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              New tool
            </button>
            <button
              onClick={fetchOptions}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              Refresh options
            </button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setMode("create")}
            className={classNames(
              "px-3 py-2 rounded-lg border text-sm",
              mode === "create"
                ? "bg-[#232073] border-[#232073]"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            )}
          >
            Create
          </button>
          <button
            onClick={() => setMode("edit")}
            className={classNames(
              "px-3 py-2 rounded-lg border text-sm",
              mode === "edit"
                ? "bg-[#232073] border-[#232073]"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            )}
          >
            Edit
          </button>

          {mode === "edit" && infraId ? (
            <div className="ml-2 text-sm text-white/70">
              Editing: <span className="text-white/90 font-mono">{infraId}</span>
            </div>
          ) : null}
        </div>

        {/* Errors / notices */}
        {loadingOptions ? (
          <div className="mb-4 text-white/70">Loading dropdown options…</div>
        ) : null}
        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
            {mode === "create" && matches?.length ? (
              <div className="mt-2 text-sm text-red-200/90">
                Looks like a match exists. Select it below to edit — or use{" "}
                <button
                  className="underline"
                  onClick={() => setForceCreate(true)}
                >
                  force create
                </button>{" "}
                (not recommended unless you’re sure).
              </div>
            ) : null}
          </div>
        ) : null}
        {notice ? (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
            {notice}
          </div>
        ) : null}

        {/* Smart search */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="w-full">
              <label className="block text-sm text-white/70 mb-1">Infra search</label>
              <input
                value={q}
                onChange={(e) => onChangeQ(e.target.value)}
                placeholder="Type a name (Google-ish match)…"
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              />
              <div className="mt-2 text-xs text-white/50">
                Tip: if a strong match appears (≈90%+), create is blocked unless you explicitly force it.
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-white/50">
                {loadingSuggest ? "Searching…" : matches?.length ? `${matches.length} matches` : "No matches"}
              </div>

              {mode === "create" ? (
                <label className="flex items-center gap-2 text-xs text-white/70 select-none">
                  <input
                    type="checkbox"
                    checked={forceCreate}
                    onChange={(e) => setForceCreate(e.target.checked)}
                  />
                  Force create
                </label>
              ) : null}
            </div>
          </div>

          {matches?.length ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {matches.map((m, idx) => (
                <button
                  key={`${m.infraId}-${idx}`}
                  onClick={() => loadToolForEdit(m.infraId)}
                  className="text-left rounded-xl border border-white/10 bg-black/20 hover:bg-black/30 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{m.name}</div>
                    {scoreBadge(m.score)}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    Parent: {m.parentOrg || "—"} • infraId: <span className="font-mono">{m.infraId}</span>
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    Click to open in edit mode
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {mode === "create" ? "Create tool" : "Edit tool"}
            </h2>

            {mode === "edit" ? (
              <button
                onClick={softDelete}
                disabled={deleting || !infraId}
                className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-200 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              />
            </div>

            {/* Parent Org */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Parent Org *</label>
              <select
                value={form.parentOrg}
                onChange={(e) => setForm(f => ({ ...f, parentOrg: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              >
                <option value="">Select…</option>
                {(options?.parentOrgs || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Link (domain) *</label>
              <input
                value={form.link}
                onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://example.com"
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              />
            </div>

            {/* AI Type */}
            <div>
              <label className="block text-sm text-white/70 mb-1">AI Type *</label>
              <select
                value={form.aiType}
                onChange={(e) => setForm(f => ({ ...f, aiType: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              >
                <option value="">Select…</option>
                {(options?.aiTypes || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Org Maturity */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Org Maturity *</label>
              <select
                value={form.orgMaturity}
                onChange={(e) => setForm(f => ({ ...f, orgMaturity: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              >
                <option value="">Select…</option>
                {(options?.orgMaturities || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Inference Location */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Inference Location *</label>
              <select
                value={form.inferenceLocation}
                onChange={(e) => setForm(f => ({ ...f, inferenceLocation: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              >
                <option value="">Select…</option>
                {(options?.inferenceLocations || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Software Type */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Software Type *</label>
              <select
                value={form.softwareType}
                onChange={(e) => setForm(f => ({ ...f, softwareType: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
              >
                <option value="">Select…</option>
                {(options?.softwareTypes || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* YES/NO fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">HAS_API *</label>
                <select
                  value={form.hasApi}
                  onChange={(e) => setForm(f => ({ ...f, hasApi: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">LEGAL_CASE_PENDING *</label>
                <select
                  value={form.legalCasePending}
                  onChange={(e) => setForm(f => ({ ...f, legalCasePending: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>
            </div>

            {/* Years */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Year Company Founded</label>
                <input
                  value={form.yearCompanyFounded}
                  onChange={(e) => setForm(f => ({ ...f, yearCompanyFounded: e.target.value }))}
                  inputMode="numeric"
                  className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Year Launched</label>
                <input
                  value={form.yearLaunched}
                  onChange={(e) => setForm(f => ({ ...f, yearLaunched: e.target.value }))}
                  inputMode="numeric"
                  className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
                />
              </div>
            </div>

            {/* Funding */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Funding</label>
              <select
                value={form.funding}
                onChange={(e) => setForm(f => ({ ...f, funding: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
              >
                <option value="">Select…</option>
                {(options?.fundings || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              {fundingDef ? (
                <div className="text-xs text-white/60 mt-2">
                  <span className="text-white/70">Funding def:</span> {fundingDef}
                </div>
              ) : null}
            </div>

            {/* Foundational model */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Foundational Model</label>
              <select
                value={form.foundationalModel}
                onChange={(e) => setForm(f => ({ ...f, foundationalModel: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
              >
                <option value="">Select…</option>
                {(options?.foundationalModels || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Business model */}
            <div>
              <label className="block text-sm text-white/70 mb-1">Business Model</label>
              <select
                value={form.businessModel}
                onChange={(e) => setForm(f => ({ ...f, businessModel: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
              >
                <option value="">Select…</option>
                {(options?.businessModels || []).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* EULA link */}
            <div>
              <label className="block text-sm text-white/70 mb-1">EULA Link</label>
              <input
                value={form.eulaLink}
                onChange={(e) => setForm(f => ({ ...f, eulaLink: e.target.value }))}
                placeholder="https://…"
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
              />
            </div>
          </div>

          {/* Multi-selects */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MultiSelect
              label="Tasks"
              options={options?.tasks || []}
              value={form.tasks}
              onChange={(v) => setForm(f => ({ ...f, tasks: v }))}
            />
            <MultiSelect
              label="Expected Input"
              options={options?.expectedInputs || []}
              value={form.expectedInput}
              onChange={(v) => setForm(f => ({ ...f, expectedInput: v }))}
            />
            <MultiSelect
              label="Generated Output"
              options={options?.generatedOutputs || []}
              value={form.generatedOutput}
              onChange={(v) => setForm(f => ({ ...f, generatedOutput: v }))}
            />
          </div>

          {/* Desc */}
          <div className="mt-6">
            <label className="block text-sm text-white/70 mb-1">Desc * (min 50 chars)</label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
            />
            <div className="text-xs text-white/50 mt-1">
              {String(form.desc || "").trim().length} / 50
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="text-xs text-white/50">
              Signed in as <span className="text-white/70">{userEmail}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/stats")}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
              >
                Back to Stats
              </button>

              <button
                onClick={save}
                disabled={!canSubmit || saving || loadingOptions}
                className={classNames(
                  "px-5 py-2 rounded-lg border font-medium",
                  "bg-[#232073] border-[#232073] hover:brightness-110",
                  (!canSubmit || saving || loadingOptions) ? "opacity-60 cursor-not-allowed" : ""
                )}
              >
                {saving ? "Saving…" : (mode === "create" ? "Create" : "Update")}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-white/40">
          API base: <span className="font-mono">{API_BASE}</span>
        </div>
      </div>
    </div>
  );
}

function MultiSelect({ label, options, value, onChange }) {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    const f = String(filter || "").trim().toLowerCase();
    if (!f) return options;
    return (options || []).filter(v => String(v).toLowerCase().includes(f));
  }, [options, filter]);

  function toggle(v) {
    const s = new Set(value || []);
    if (s.has(v)) s.delete(v);
    else s.add(v);
    onChange(Array.from(s));
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white/80 font-medium">{label}</div>
        <div className="text-xs text-white/50">{(value || []).length} selected</div>
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search…"
        className="w-full mb-3 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
      />

      <div className="max-h-56 overflow-auto pr-1 space-y-2">
        {filtered.map((v) => {
          const checked = (value || []).includes(v);
          return (
            <label key={v} className="flex items-center gap-2 text-sm text-white/80 select-none">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(v)}
              />
              <span className="truncate">{v}</span>
            </label>
          );
        })}
        {!filtered.length ? (
          <div className="text-sm text-white/50">No matches</div>
        ) : null}
      </div>
    </div>
  );
}
