// // import { useEffect, useMemo, useRef, useState } from "react";
// // import Cookies from "js-cookie";
// // import { Link, useNavigate } from "react-router-dom";

// // const API_BASE = import.meta.env.VITE_API_BASE;

// // function getIdToken() {
// //   return Cookies.get("idToken") || "";
// // }

// // function authHeaders() {
// //   const t = getIdToken();
// //   return t ? { Authorization: `Bearer ${t}` } : {};
// // }

// // /**
// //  * Decode JWT payload (base64url) and return the email claim.
// //  * No external deps needed.
// //  */
// // function getEmailFromIdToken() {
// //   try {
// //     const token = getIdToken();
// //     if (!token) return "";
// //     const parts = token.split(".");
// //     if (parts.length < 2) return "";

// //     // base64url -> base64
// //     let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
// //     // pad to multiple of 4
// //     while (payload.length % 4) payload += "=";

// //     const json = JSON.parse(atob(payload));
// //     return String(json?.email || "").trim();
// //   } catch {
// //     return "";
// //   }
// // }

// // function isInternalEmail(email) {
// //   return String(email || "").toLowerCase().endsWith("@me-dmz.com");
// // }

// // function classNames(...xs) {
// //   return xs.filter(Boolean).join(" ");
// // }

// // function clamp01(n) {
// //   if (!Number.isFinite(n)) return 0;
// //   return Math.max(0, Math.min(1, n));
// // }

// // function toList(x) {
// //   if (x == null) return [];
// //   if (Array.isArray(x)) return x.map((v) => String(v ?? "").trim()).filter(Boolean);
// //   return [String(x).trim()].filter(Boolean);
// // }

// // function uniq(arr) {
// //   return Array.from(new Set((arr || []).map((v) => String(v ?? "").trim()).filter(Boolean)));
// // }

// // export default function AdminTools() {
// //   const navigate = useNavigate();

// //   // ✅ Derive email from idToken instead of relying on a cookie that isn't set
// //   const userEmail = getEmailFromIdToken();
// //   const isAdmin = isInternalEmail(userEmail);

// //   const [mode, setMode] = useState("create"); // "create" | "edit"
// //   const [infraId, setInfraId] = useState("");

// //   const [options, setOptions] = useState(null);
// //   const [loadingOptions, setLoadingOptions] = useState(false);

// //   const [q, setQ] = useState("");
// //   const [matches, setMatches] = useState([]);
// //   const [loadingSuggest, setLoadingSuggest] = useState(false);

// //   const [forceCreate, setForceCreate] = useState(false);

// //   const [saving, setSaving] = useState(false);
// //   const [deleting, setDeleting] = useState(false);

// //   const [error, setError] = useState("");
// //   const [notice, setNotice] = useState("");

// //   const [form, setForm] = useState({
// //     name: "",
// //     parentOrg: "",
// //     link: "",
// //     aiType: "",
// //     orgMaturity: "",
// //     tasks: [],
// //     inferenceLocation: "",
// //     desc: "",
// //     softwareType: "",
// //     expectedInput: [],
// //     generatedOutput: [],
// //     eulaLink: "",
// //     foundationalModel: "",
// //     businessModel: "",
// //     legalCasePending: "NO",
// //     hasApi: "NO",
// //     yearCompanyFounded: "",
// //     yearLaunched: "",
// //     funding: "",
// //   });

// //   const fundingDef = useMemo(() => {
// //     const defs = options?.fundingDefs || {};
// //     return form.funding ? defs[form.funding] || "" : "";
// //   }, [options, form.funding]);

// //   // Simple debounce for suggest
// //   const suggestTimer = useRef(null);

// //   useEffect(() => {
// //     if (!isAdmin) {
// //       // ✅ Cleaner target in your app than "/"
// //       navigate("/details", { replace: true });
// //       return;
// //     }
// //   }, [isAdmin, navigate]);

// //   async function fetchOptions() {
// //     setError("");
// //     setLoadingOptions(true);
// //     try {
// //       const res = await fetch(`${API_BASE}/options`, {
// //         method: "GET",
// //         headers: { ...authHeaders() },
// //       });
// //       const data = await res.json();
// //       if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load options");
// //       setOptions(data);
// //     } catch (e) {
// //       setError(String(e?.message || e));
// //     } finally {
// //       setLoadingOptions(false);
// //     }
// //   }

// //   useEffect(() => {
// //     if (!isAdmin) return;
// //     fetchOptions();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [isAdmin]);

// //   async function runSuggest(nextQ) {
// //     const qq = String(nextQ || "").trim();
// //     if (!qq) {
// //       setMatches([]);
// //       return;
// //     }
// //     setLoadingSuggest(true);
// //     setError("");
// //     try {
// //       const res = await fetch(`${API_BASE}/tools/suggest?q=${encodeURIComponent(qq)}`, {
// //         method: "GET",
// //         headers: { ...authHeaders() },
// //       });
// //       const data = await res.json();
// //       if (!res.ok || !data?.ok) throw new Error(data?.error || "Suggest failed");
// //       setMatches(Array.isArray(data.matches) ? data.matches : []);
// //     } catch (e) {
// //       setError(String(e?.message || e));
// //       setMatches([]);
// //     } finally {
// //       setLoadingSuggest(false);
// //     }
// //   }

// //   function onChangeQ(val) {
// //     setQ(val);
// //     setNotice("");
// //     setForceCreate(false);
// //     if (suggestTimer.current) clearTimeout(suggestTimer.current);
// //     suggestTimer.current = setTimeout(() => runSuggest(val), 250);
// //   }

// //   async function loadToolForEdit(selectedInfraId) {
// //     setError("");
// //     setNotice("");
// //     setSaving(false);
// //     setDeleting(false);

// //     try {
// //       const res = await fetch(`${API_BASE}/tool?infraId=${encodeURIComponent(selectedInfraId)}`, {
// //         method: "GET",
// //         headers: { ...authHeaders() },
// //       });
// //       const data = await res.json();
// //       if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load tool");

// //       const t = data.tool || {};
// //       setMode("edit");
// //       setInfraId(t.infraId || selectedInfraId);

// //       setForm({
// //         name: t.infraName || t.toolName || "",
// //         parentOrg: t.parentOrg || "",
// //         link: t.url || "",
// //         aiType: t.aiType || "",
// //         orgMaturity: t.orgMaturity || "",
// //         tasks: uniq(toList(t.tasks)),
// //         inferenceLocation: t.inferenceLocation || "",
// //         desc: t.desc || "",
// //         softwareType: t.softwareType || "",
// //         expectedInput: uniq(toList(t.expectedInput)),
// //         generatedOutput: uniq(toList(t.generatedOutput)),
// //         eulaLink: t.eulaLink || "",
// //         foundationalModel: t.foundationalModel || "",
// //         businessModel: t.businessModel || "",
// //         legalCasePending: (t.legalCasePending || "NO").toUpperCase(),
// //         hasApi: (t.hasApi || "NO").toUpperCase(),
// //         yearCompanyFounded: t.yearCompanyFounded ?? "",
// //         yearLaunched: t.yearLaunched ?? "",
// //         funding: t.fundingType || "",
// //       });
// //     } catch (e) {
// //       setError(String(e?.message || e));
// //     }
// //   }

// //   function resetToCreate() {
// //     setMode("create");
// //     setInfraId("");
// //     setMatches([]);
// //     setQ("");
// //     setForceCreate(false);
// //     setNotice("");
// //     setError("");
// //     setForm({
// //       name: "",
// //       parentOrg: "",
// //       link: "",
// //       aiType: "",
// //       orgMaturity: "",
// //       tasks: [],
// //       inferenceLocation: "",
// //       desc: "",
// //       softwareType: "",
// //       expectedInput: [],
// //       generatedOutput: [],
// //       eulaLink: "",
// //       foundationalModel: "",
// //       businessModel: "",
// //       legalCasePending: "NO",
// //       hasApi: "NO",
// //       yearCompanyFounded: "",
// //       yearLaunched: "",
// //       funding: "",
// //     });
// //   }

// //   async function save() {
// //     setError("");
// //     setNotice("");
// //     setSaving(true);
// //     try {
// //       const body = {
// //         mode,
// //         infraId: mode === "edit" ? infraId : undefined,
// //         forceCreate: mode === "create" ? !!forceCreate : undefined,
// //         data: {
// //           ...form,
// //           fundingDef, // (server will also auto-fill; this is mostly for UI parity)
// //         },
// //       };

// //       const res = await fetch(`${API_BASE}/tools/save`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           ...authHeaders(),
// //         },
// //         body: JSON.stringify(body),
// //       });

// //       const data = await res.json().catch(() => ({}));

// //       // Server uses 409 for “looks like duplicate”
// //       if (res.status === 409) {
// //         setMatches(Array.isArray(data?.matches) ? data.matches : []);
// //         setError(data?.error || "This tool looks like it already exists.");
// //         setSaving(false);
// //         return;
// //       }

// //       if (!res.ok || !data?.ok) {
// //         const msg = (data?.errors && data.errors.join(" ")) || data?.error || "Save failed";
// //         throw new Error(msg);
// //       }

// //       if (mode === "create") {
// //         setNotice(`Created ✅ (infraId: ${data.infraId})`);
// //         // After create, load it into edit mode so the modal feels “done”
// //         await loadToolForEdit(data.infraId);
// //       } else {
// //         setNotice("Updated ✅");
// //       }
// //     } catch (e) {
// //       setError(String(e?.message || e));
// //     } finally {
// //       setSaving(false);
// //     }
// //   }

// //   async function softDelete() {
// //     if (mode !== "edit" || !infraId) return;
// //     const ok = window.confirm("Soft delete this tool? (It will disappear from lists.)");
// //     if (!ok) return;

// //     setDeleting(true);
// //     setError("");
// //     setNotice("");
// //     try {
// //       const res = await fetch(`${API_BASE}/tools/delete`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           ...authHeaders(),
// //         },
// //         body: JSON.stringify({ infraId }),
// //       });
// //       const data = await res.json().catch(() => ({}));
// //       if (!res.ok || !data?.ok) throw new Error(data?.error || "Delete failed");
// //       setNotice("Deleted ✅");
// //       resetToCreate();
// //     } catch (e) {
// //       setError(String(e?.message || e));
// //     } finally {
// //       setDeleting(false);
// //     }
// //   }

// //   const canSubmit = useMemo(() => {
// //     // Light client-side guard; server does the real validation.
// //     const nameOk = String(form.name || "").trim().length > 0;
// //     const descOk = String(form.desc || "").trim().length >= 50;
// //     return nameOk && descOk;
// //   }, [form.name, form.desc]);

// //   const scoreBadge = (s) => {
// //     const n = clamp01(Number(s));
// //     const pct = Math.round(n * 100);
// //     const tone =
// //       n >= 0.9
// //         ? "bg-red-500/15 text-red-200 border-red-500/30"
// //         : n >= 0.75
// //           ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
// //           : "bg-white/10 text-white/70 border-white/15";
// //     return (
// //       <span className={classNames("text-xs px-2 py-0.5 rounded-full border", tone)}>
// //         {pct}%
// //       </span>
// //     );
// //   };

// //   if (!isAdmin) return null;

// //   return (
// //     <div className="min-h-screen bg-[#0b0b14] text-white">
// //       <div className="max-w-6xl mx-auto px-6 py-8">
// //         <div className="flex items-center justify-between mb-6">
// //           <div>
// //             <div className="text-sm text-white/60">
// //               <Link to="/stats" className="hover:underline">
// //                 Admin Stats
// //               </Link>
// //               <span className="mx-2">/</span>
// //               <span className="text-white/80">Tools</span>
// //             </div>
// //             <h1 className="text-2xl font-semibold mt-1">Manage Tools</h1>
// //             <p className="text-white/60 mt-1">
// //               Create new infra tools or edit existing ones. Updates set{" "}
// //               <span className="text-white/80">lastUpdatedBy</span> automatically.
// //             </p>
// //           </div>

// //           <div className="flex gap-2">
// //             <button
// //               onClick={resetToCreate}
// //               className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
// //             >
// //               New tool
// //             </button>
// //             <button
// //               onClick={fetchOptions}
// //               className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
// //             >
// //               Refresh options
// //             </button>
// //           </div>
// //         </div>

// //         {/* Mode toggle */}
// //         <div className="flex items-center gap-2 mb-6">
// //           <button
// //             onClick={() => setMode("create")}
// //             className={classNames(
// //               "px-3 py-2 rounded-lg border text-sm",
// //               mode === "create" ? "bg-[#232073] border-[#232073]" : "bg-white/5 border-white/10 hover:bg-white/10"
// //             )}
// //           >
// //             Create
// //           </button>
// //           <button
// //             onClick={() => setMode("edit")}
// //             className={classNames(
// //               "px-3 py-2 rounded-lg border text-sm",
// //               mode === "edit" ? "bg-[#232073] border-[#232073]" : "bg-white/5 border-white/10 hover:bg-white/10"
// //             )}
// //           >
// //             Edit
// //           </button>

// //           {mode === "edit" && infraId ? (
// //             <div className="ml-2 text-sm text-white/70">
// //               Editing: <span className="text-white/90 font-mono">{infraId}</span>
// //             </div>
// //           ) : null}
// //         </div>

// //         {/* Errors / notices */}
// //         {loadingOptions ? <div className="mb-4 text-white/70">Loading dropdown options…</div> : null}
// //         {error ? (
// //           <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
// //             {error}
// //             {mode === "create" && matches?.length ? (
// //               <div className="mt-2 text-sm text-red-200/90">
// //                 Looks like a match exists. Select it below to edit — or use{" "}
// //                 <button className="underline" onClick={() => setForceCreate(true)}>
// //                   force create
// //                 </button>{" "}
// //                 (not recommended unless you’re sure).
// //               </div>
// //             ) : null}
// //           </div>
// //         ) : null}
// //         {notice ? (
// //           <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
// //             {notice}
// //           </div>
// //         ) : null}

// //         {/* Smart search */}
// //         <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
// //           <div className="flex items-center justify-between gap-4">
// //             <div className="w-full">
// //               <label className="block text-sm text-white/70 mb-1">Infra search</label>
// //               <input
// //                 value={q}
// //                 onChange={(e) => onChangeQ(e.target.value)}
// //                 placeholder="Type a name (Google-ish match)…"
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               />
// //               <div className="mt-2 text-xs text-white/50">
// //                 Tip: if a strong match appears (≈90%+), create is blocked unless you explicitly force it.
// //               </div>
// //             </div>

// //             <div className="flex flex-col items-end gap-2">
// //               <div className="text-xs text-white/50">
// //                 {loadingSuggest ? "Searching…" : matches?.length ? `${matches.length} matches` : "No matches"}
// //               </div>

// //               {mode === "create" ? (
// //                 <label className="flex items-center gap-2 text-xs text-white/70 select-none">
// //                   <input
// //                     type="checkbox"
// //                     checked={forceCreate}
// //                     onChange={(e) => setForceCreate(e.target.checked)}
// //                   />
// //                   Force create
// //                 </label>
// //               ) : null}
// //             </div>
// //           </div>

// //           {matches?.length ? (
// //             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
// //               {matches.map((m, idx) => (
// //                 <button
// //                   key={`${m.infraId}-${idx}`}
// //                   onClick={() => loadToolForEdit(m.infraId)}
// //                   className="text-left rounded-xl border border-white/10 bg-black/20 hover:bg-black/30 px-4 py-3"
// //                 >
// //                   <div className="flex items-center justify-between gap-3">
// //                     <div className="font-medium">{m.name}</div>
// //                     {scoreBadge(m.score)}
// //                   </div>
// //                   <div className="text-xs text-white/60 mt-1">
// //                     Parent: {m.parentOrg || "—"} • infraId:{" "}
// //                     <span className="font-mono">{m.infraId}</span>
// //                   </div>
// //                   <div className="text-xs text-white/40 mt-1">Click to open in edit mode</div>
// //                 </button>
// //               ))}
// //             </div>
// //           ) : null}
// //         </div>

// //         {/* Form */}
// //         <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
// //           <div className="flex items-center justify-between mb-4">
// //             <h2 className="text-lg font-semibold">{mode === "create" ? "Create tool" : "Edit tool"}</h2>

// //             {mode === "edit" ? (
// //               <button
// //                 onClick={softDelete}
// //                 disabled={deleting || !infraId}
// //                 className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-200 disabled:opacity-50"
// //               >
// //                 {deleting ? "Deleting…" : "Delete"}
// //               </button>
// //             ) : null}
// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             {/* Name */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Name *</label>
// //               <input
// //                 value={form.name}
// //                 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               />
// //             </div>

// //             {/* Parent Org */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Parent Org *</label>
// //               <select
// //                 value={form.parentOrg}
// //                 onChange={(e) => setForm((f) => ({ ...f, parentOrg: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.parentOrgs || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Link */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Link (domain) *</label>
// //               <input
// //                 value={form.link}
// //                 onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
// //                 placeholder="https://example.com"
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               />
// //             </div>

// //             {/* AI Type */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">AI Type *</label>
// //               <select
// //                 value={form.aiType}
// //                 onChange={(e) => setForm((f) => ({ ...f, aiType: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.aiTypes || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Org Maturity */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Org Maturity *</label>
// //               <select
// //                 value={form.orgMaturity}
// //                 onChange={(e) => setForm((f) => ({ ...f, orgMaturity: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.orgMaturities || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Inference Location */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Inference Location *</label>
// //               <select
// //                 value={form.inferenceLocation}
// //                 onChange={(e) => setForm((f) => ({ ...f, inferenceLocation: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.inferenceLocations || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Software Type */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Software Type *</label>
// //               <select
// //                 value={form.softwareType}
// //                 onChange={(e) => setForm((f) => ({ ...f, softwareType: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.softwareTypes || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* YES/NO fields */}
// //             <div className="grid grid-cols-2 gap-4">
// //               <div>
// //                 <label className="block text-sm text-white/70 mb-1">HAS_API *</label>
// //                 <select
// //                   value={form.hasApi}
// //                   onChange={(e) => setForm((f) => ({ ...f, hasApi: e.target.value }))}
// //                   className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //                 >
// //                   <option value="YES">YES</option>
// //                   <option value="NO">NO</option>
// //                 </select>
// //               </div>
// //               <div>
// //                 <label className="block text-sm text-white/70 mb-1">LEGAL_CASE_PENDING *</label>
// //                 <select
// //                   value={form.legalCasePending}
// //                   onChange={(e) => setForm((f) => ({ ...f, legalCasePending: e.target.value }))}
// //                   className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //                 >
// //                   <option value="YES">YES</option>
// //                   <option value="NO">NO</option>
// //                 </select>
// //               </div>
// //             </div>

// //             {/* Years */}
// //             <div className="grid grid-cols-2 gap-4">
// //               <div>
// //                 <label className="block text-sm text-white/70 mb-1">Year Company Founded</label>
// //                 <input
// //                   value={form.yearCompanyFounded}
// //                   onChange={(e) => setForm((f) => ({ ...f, yearCompanyFounded: e.target.value }))}
// //                   inputMode="numeric"
// //                   className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //                 />
// //               </div>
// //               <div>
// //                 <label className="block text-sm text-white/70 mb-1">Year Launched</label>
// //                 <input
// //                   value={form.yearLaunched}
// //                   onChange={(e) => setForm((f) => ({ ...f, yearLaunched: e.target.value }))}
// //                   inputMode="numeric"
// //                   className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //                 />
// //               </div>
// //             </div>

// //             {/* Funding */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Funding</label>
// //               <select
// //                 value={form.funding}
// //                 onChange={(e) => setForm((f) => ({ ...f, funding: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.fundings || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //               {fundingDef ? (
// //                 <div className="text-xs text-white/60 mt-2">
// //                   <span className="text-white/70">Funding def:</span> {fundingDef}
// //                 </div>
// //               ) : null}
// //             </div>

// //             {/* Foundational model */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Foundational Model</label>
// //               <select
// //                 value={form.foundationalModel}
// //                 onChange={(e) => setForm((f) => ({ ...f, foundationalModel: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.foundationalModels || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* Business model */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">Business Model</label>
// //               <select
// //                 value={form.businessModel}
// //                 onChange={(e) => setForm((f) => ({ ...f, businessModel: e.target.value }))}
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //               >
// //                 <option value="">Select…</option>
// //                 {(options?.businessModels || []).map((v) => (
// //                   <option key={v} value={v}>
// //                     {v}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {/* EULA link */}
// //             <div>
// //               <label className="block text-sm text-white/70 mb-1">EULA Link</label>
// //               <input
// //                 value={form.eulaLink}
// //                 onChange={(e) => setForm((f) => ({ ...f, eulaLink: e.target.value }))}
// //                 placeholder="https://…"
// //                 className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10"
// //               />
// //             </div>
// //           </div>

// //           {/* Multi-selects */}
// //           <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
// //             <MultiSelect
// //               label="Tasks"
// //               options={options?.tasks || []}
// //               value={form.tasks}
// //               onChange={(v) => setForm((f) => ({ ...f, tasks: v }))}
// //             />
// //             <MultiSelect
// //               label="Expected Input"
// //               options={options?.expectedInputs || []}
// //               value={form.expectedInput}
// //               onChange={(v) => setForm((f) => ({ ...f, expectedInput: v }))}
// //             />
// //             <MultiSelect
// //               label="Generated Output"
// //               options={options?.generatedOutputs || []}
// //               value={form.generatedOutput}
// //               onChange={(v) => setForm((f) => ({ ...f, generatedOutput: v }))}
// //             />
// //           </div>

// //           {/* Desc */}
// //           <div className="mt-6">
// //             <label className="block text-sm text-white/70 mb-1">Desc * (min 50 chars)</label>
// //             <textarea
// //               value={form.desc}
// //               onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
// //               rows={4}
// //               className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#232073]"
// //             />
// //             <div className="text-xs text-white/50 mt-1">{String(form.desc || "").trim().length} / 50</div>
// //           </div>

// //           {/* Actions */}
// //           <div className="mt-6 flex items-center justify-between gap-3">
// //             <div className="text-xs text-white/50">
// //               Signed in as <span className="text-white/70">{userEmail || "—"}</span>
// //             </div>

// //             <div className="flex gap-2">
// //               <button
// //                 onClick={() => navigate("/stats")}
// //                 className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
// //               >
// //                 Back to Stats
// //               </button>

// //               <button
// //                 onClick={save}
// //                 disabled={!canSubmit || saving || loadingOptions}
// //                 className={classNames(
// //                   "px-5 py-2 rounded-lg border font-medium",
// //                   "bg-[#232073] border-[#232073] hover:brightness-110",
// //                   !canSubmit || saving || loadingOptions ? "opacity-60 cursor-not-allowed" : ""
// //                 )}
// //               >
// //                 {saving ? "Saving…" : mode === "create" ? "Create" : "Update"}
// //               </button>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="mt-6 text-xs text-white/40">
// //           API base: <span className="font-mono">{API_BASE}</span>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // function MultiSelect({ label, options, value, onChange }) {
// //   const [filter, setFilter] = useState("");
// //   const filtered = useMemo(() => {
// //     const f = String(filter || "").trim().toLowerCase();
// //     if (!f) return options;
// //     return (options || []).filter((v) => String(v).toLowerCase().includes(f));
// //   }, [options, filter]);

// //   function toggle(v) {
// //     const s = new Set(value || []);
// //     if (s.has(v)) s.delete(v);
// //     else s.add(v);
// //     onChange(Array.from(s));
// //   }

// //   return (
// //     <div className="rounded-xl border border-white/10 bg-black/20 p-4">
// //       <div className="flex items-center justify-between mb-2">
// //         <div className="text-sm text-white/80 font-medium">{label}</div>
// //         <div className="text-xs text-white/50">{(value || []).length} selected</div>
// //       </div>

// //       <input
// //         value={filter}
// //         onChange={(e) => setFilter(e.target.value)}
// //         placeholder="Search…"
// //         className="w-full mb-3 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm"
// //       />

// //       <div className="max-h-56 overflow-auto pr-1 space-y-2">
// //         {filtered.map((v) => {
// //           const checked = (value || []).includes(v);
// //           return (
// //             <label key={v} className="flex items-center gap-2 text-sm text-white/80 select-none">
// //               <input type="checkbox" checked={checked} onChange={() => toggle(v)} />
// //               <span className="truncate">{v}</span>
// //             </label>
// //           );
// //         })}
// //         {!filtered.length ? <div className="text-sm text-white/50">No matches</div> : null}
// //       </div>
// //     </div>
// //   );
// // }


// import { useEffect, useMemo, useRef, useState } from "react";
// import Cookies from "js-cookie";
// import { Link, useNavigate } from "react-router-dom";

// const API_BASE = import.meta.env.VITE_API_BASE;

// function getIdToken() {
//   return Cookies.get("idToken") || "";
// }

// function authHeaders() {
//   const t = getIdToken();
//   return t ? { Authorization: `Bearer ${t}` } : {};
// }

// /**
//  * Decode JWT payload (base64url) and return the email claim.
//  * No external deps needed.
//  */
// function getEmailFromIdToken() {
//   try {
//     const token = getIdToken();
//     if (!token) return "";
//     const parts = token.split(".");
//     if (parts.length < 2) return "";

//     // base64url -> base64
//     let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
//     // pad to multiple of 4
//     while (payload.length % 4) payload += "=";

//     const json = JSON.parse(atob(payload));
//     return String(json?.email || "").trim();
//   } catch {
//     return "";
//   }
// }

// function isInternalEmail(email) {
//   return String(email || "").toLowerCase().endsWith("@me-dmz.com");
// }

// function classNames(...xs) {
//   return xs.filter(Boolean).join(" ");
// }

// function clamp01(n) {
//   if (!Number.isFinite(n)) return 0;
//   return Math.max(0, Math.min(1, n));
// }

// function toList(x) {
//   if (x == null) return [];
//   if (Array.isArray(x)) return x.map((v) => String(v ?? "").trim()).filter(Boolean);
//   return [String(x).trim()].filter(Boolean);
// }

// function uniq(arr) {
//   return Array.from(new Set((arr || []).map((v) => String(v ?? "").trim()).filter(Boolean)));
// }

// /**
//  * Simple searchable select (combobox) with keyboard-friendly behavior:
//  * - type to filter
//  * - click an option to select
//  * - keeps the selected value visible even when filter is empty
//  */
// function SearchableSelect({
//   label,
//   placeholder = "Search…",
//   options = [],
//   value,
//   onChange,
//   required = false,
// }) {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const wrapRef = useRef(null);

//   const selectedLabel = value || "";
//   const normalizedOptions = useMemo(() => uniq(options).sort(), [options]);

//   const filtered = useMemo(() => {
//     const q = String(query || "").trim().toLowerCase();
//     if (!q) return normalizedOptions.slice(0, 50);
//     return normalizedOptions
//       .filter((v) => String(v).toLowerCase().includes(q))
//       .slice(0, 50);
//   }, [normalizedOptions, query]);

//   useEffect(() => {
//     function onDocMouseDown(e) {
//       if (!wrapRef.current) return;
//       if (!wrapRef.current.contains(e.target)) setOpen(false);
//     }
//     document.addEventListener("mousedown", onDocMouseDown);
//     return () => document.removeEventListener("mousedown", onDocMouseDown);
//   }, []);

//   function pick(v) {
//     onChange(v);
//     setQuery("");
//     setOpen(false);
//   }

//   return (
//     <div ref={wrapRef}>
//       <label className="block text-sm text-blue-900/70 mb-1">
//         {label} {required ? "*" : null}
//       </label>

//       <div className="relative">
//         <input
//           value={open ? query : selectedLabel}
//           onChange={(e) => {
//             setQuery(e.target.value);
//             if (!open) setOpen(true);
//           }}
//           onFocus={() => setOpen(true)}
//           onKeyDown={(e) => {
//             if (e.key === "Escape") setOpen(false);
//           }}
//           placeholder={selectedLabel ? "" : placeholder}
//           className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {open ? (
//           <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-blue-200 bg-white shadow-lg">
//             {/* quick actions */}
//             <div className="flex items-center justify-between px-3 py-2 border-b border-blue-100">
//               <div className="text-xs text-blue-900/60">
//                 {filtered.length} match{filtered.length === 1 ? "" : "es"}
//               </div>
//               {value ? (
//                 <button
//                   type="button"
//                   onClick={() => pick("")}
//                   className="text-xs text-blue-700 hover:underline"
//                 >
//                   Clear
//                 </button>
//               ) : (
//                 <span className="text-xs text-blue-900/40"> </span>
//               )}
//             </div>

//             {filtered.length ? (
//               <ul className="py-1">
//                 {filtered.map((v) => {
//                   const active = v === value;
//                   return (
//                     <li key={v}>
//                       <button
//                         type="button"
//                         onClick={() => pick(v)}
//                         className={classNames(
//                           "w-full text-left px-3 py-2 text-sm hover:bg-blue-50",
//                           active ? "bg-blue-50 text-blue-950 font-medium" : "text-blue-950"
//                         )}
//                       >
//                         {v}
//                       </button>
//                     </li>
//                   );
//                 })}
//               </ul>
//             ) : (
//               <div className="px-3 py-3 text-sm text-blue-900/70">No matches.</div>
//             )}
//           </div>
//         ) : null}
//       </div>

//       {value ? <div className="mt-1 text-xs text-blue-900/50">Selected: {value}</div> : null}
//     </div>
//   );
// }

// export default function AdminTools() {
//   const navigate = useNavigate();

//   // ✅ Derive email from idToken instead of relying on a cookie that isn't set
//   const userEmail = getEmailFromIdToken();
//   const isAdmin = isInternalEmail(userEmail);

//   const [mode, setMode] = useState("create"); // "create" | "edit"
//   const [infraId, setInfraId] = useState("");

//   const [options, setOptions] = useState(null);
//   const [loadingOptions, setLoadingOptions] = useState(false);

//   const [q, setQ] = useState("");
//   const [matches, setMatches] = useState([]);
//   const [loadingSuggest, setLoadingSuggest] = useState(false);

//   const [forceCreate, setForceCreate] = useState(false);

//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");

//   const [form, setForm] = useState({
//     name: "",
//     parentOrg: "",
//     link: "",
//     aiType: "",
//     orgMaturity: "",
//     tasks: [],
//     inferenceLocation: "",
//     desc: "",
//     softwareType: "",
//     expectedInput: [],
//     generatedOutput: [],
//     eulaLink: "",
//     foundationalModel: "",
//     businessModel: "",
//     legalCasePending: "NO",
//     hasApi: "NO",
//     yearCompanyFounded: "",
//     yearLaunched: "",
//     funding: "",
//   });

//   const fundingDef = useMemo(() => {
//     const defs = options?.fundingDefs || {};
//     return form.funding ? defs[form.funding] || "" : "";
//   }, [options, form.funding]);

//   // Simple debounce for suggest
//   const suggestTimer = useRef(null);

//   useEffect(() => {
//     if (!isAdmin) {
//       navigate("/details", { replace: true });
//       return;
//     }
//   }, [isAdmin, navigate]);

//   async function fetchOptions() {
//     setError("");
//     setLoadingOptions(true);
//     try {
//       const res = await fetch(`${API_BASE}/options`, {
//         method: "GET",
//         headers: { ...authHeaders() },
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load options");
//       setOptions(data);
//     } catch (e) {
//       setError(String(e?.message || e));
//     } finally {
//       setLoadingOptions(false);
//     }
//   }

//   useEffect(() => {
//     if (!isAdmin) return;
//     fetchOptions();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isAdmin]);

//   async function runSuggest(nextQ) {
//     const qq = String(nextQ || "").trim();
//     if (!qq) {
//       setMatches([]);
//       return;
//     }
//     setLoadingSuggest(true);
//     setError("");
//     try {
//       const res = await fetch(`${API_BASE}/tools/suggest?q=${encodeURIComponent(qq)}`, {
//         method: "GET",
//         headers: { ...authHeaders() },
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.ok) throw new Error(data?.error || "Suggest failed");
//       setMatches(Array.isArray(data.matches) ? data.matches : []);
//     } catch (e) {
//       setError(String(e?.message || e));
//       setMatches([]);
//     } finally {
//       setLoadingSuggest(false);
//     }
//   }

//   function onChangeQ(val) {
//     setQ(val);
//     setNotice("");
//     setForceCreate(false);
//     if (suggestTimer.current) clearTimeout(suggestTimer.current);
//     suggestTimer.current = setTimeout(() => runSuggest(val), 250);
//   }

//   async function loadToolForEdit(selectedInfraId) {
//     setError("");
//     setNotice("");
//     setSaving(false);
//     setDeleting(false);

//     try {
//       const res = await fetch(`${API_BASE}/tool?infraId=${encodeURIComponent(selectedInfraId)}`, {
//         method: "GET",
//         headers: { ...authHeaders() },
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load tool");

//       const t = data.tool || {};
//       setMode("edit");
//       setInfraId(t.infraId || selectedInfraId);

//       setForm({
//         name: t.infraName || t.toolName || "",
//         parentOrg: t.parentOrg || "",
//         link: t.url || "",
//         aiType: t.aiType || "",
//         orgMaturity: t.orgMaturity || "",
//         tasks: uniq(toList(t.tasks)),
//         inferenceLocation: t.inferenceLocation || "",
//         desc: t.desc || "",
//         softwareType: t.softwareType || "",
//         expectedInput: uniq(toList(t.expectedInput)),
//         generatedOutput: uniq(toList(t.generatedOutput)),
//         eulaLink: t.eulaLink || "",
//         foundationalModel: t.foundationalModel || "",
//         businessModel: t.businessModel || "",
//         legalCasePending: (t.legalCasePending || "NO").toUpperCase(),
//         hasApi: (t.hasApi || "NO").toUpperCase(),
//         yearCompanyFounded: t.yearCompanyFounded ?? "",
//         yearLaunched: t.yearLaunched ?? "",
//         funding: t.fundingType || "",
//       });
//     } catch (e) {
//       setError(String(e?.message || e));
//     }
//   }

//   function resetToCreate() {
//     setMode("create");
//     setInfraId("");
//     setMatches([]);
//     setQ("");
//     setForceCreate(false);
//     setNotice("");
//     setError("");
//     setForm({
//       name: "",
//       parentOrg: "",
//       link: "",
//       aiType: "",
//       orgMaturity: "",
//       tasks: [],
//       inferenceLocation: "",
//       desc: "",
//       softwareType: "",
//       expectedInput: [],
//       generatedOutput: [],
//       eulaLink: "",
//       foundationalModel: "",
//       businessModel: "",
//       legalCasePending: "NO",
//       hasApi: "NO",
//       yearCompanyFounded: "",
//       yearLaunched: "",
//       funding: "",
//     });
//   }

//   async function save() {
//     setError("");
//     setNotice("");
//     setSaving(true);
//     try {
//       const body = {
//         mode,
//         infraId: mode === "edit" ? infraId : undefined,
//         forceCreate: mode === "create" ? !!forceCreate : undefined,
//         data: {
//           ...form,
//           fundingDef,
//         },
//       };

//       const res = await fetch(`${API_BASE}/tools/save`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...authHeaders(),
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (res.status === 409) {
//         setMatches(Array.isArray(data?.matches) ? data.matches : []);
//         setError(data?.error || "This tool looks like it already exists.");
//         setSaving(false);
//         return;
//       }

//       if (!res.ok || !data?.ok) {
//         const msg = (data?.errors && data.errors.join(" ")) || data?.error || "Save failed";
//         throw new Error(msg);
//       }

//       if (mode === "create") {
//         setNotice(`Created ✅ (infraId: ${data.infraId})`);
//         await loadToolForEdit(data.infraId);
//       } else {
//         setNotice("Updated ✅");
//       }
//     } catch (e) {
//       setError(String(e?.message || e));
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function softDelete() {
//     if (mode !== "edit" || !infraId) return;
//     const ok = window.confirm("Soft delete this tool? (It will disappear from lists.)");
//     if (!ok) return;

//     setDeleting(true);
//     setError("");
//     setNotice("");
//     try {
//       const res = await fetch(`${API_BASE}/tools/delete`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...authHeaders(),
//         },
//         body: JSON.stringify({ infraId }),
//       });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || !data?.ok) throw new Error(data?.error || "Delete failed");
//       setNotice("Deleted ✅");
//       resetToCreate();
//     } catch (e) {
//       setError(String(e?.message || e));
//     } finally {
//       setDeleting(false);
//     }
//   }

//   const canSubmit = useMemo(() => {
//     const nameOk = String(form.name || "").trim().length > 0;
//     const descOk = String(form.desc || "").trim().length >= 50;
//     return nameOk && descOk;
//   }, [form.name, form.desc]);

//   // Theme: match the rest of the project (light / blue)
//   const scoreBadge = (s) => {
//     const n = clamp01(Number(s));
//     const pct = Math.round(n * 100);
//     const tone =
//       n >= 0.9
//         ? "bg-red-50 text-red-700 border-red-200"
//         : n >= 0.75
//           ? "bg-amber-50 text-amber-700 border-amber-200"
//           : "bg-blue-50 text-blue-700 border-blue-200";
//     return (
//       <span className={classNames("text-xs px-2 py-0.5 rounded-full border", tone)}>
//         {pct}%
//       </span>
//     );
//   };

//   if (!isAdmin) return null;

//   return (
//     <div className="min-h-screen bg-blue-50/30 text-blue-950">
//       <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <div className="text-sm text-blue-900/70">
//               <Link to="/stats" className="hover:underline text-blue-700">
//                 Admin Stats
//               </Link>
//               <span className="mx-2">/</span>
//               <span className="text-blue-950">Tools</span>
//             </div>
//             <h1 className="text-2xl font-semibold mt-1">Manage Tools</h1>
//             <p className="text-blue-900/70 mt-1">
//               Create new infra tools or edit existing ones. Updates set{" "}
//               <span className="text-blue-950">lastUpdatedBy</span> automatically.
//             </p>
//             <div className="mt-2 text-xs text-blue-900/60">
//               Signed in as <span className="font-medium text-blue-950">{userEmail || "—"}</span>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={resetToCreate}
//               className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
//             >
//               New tool
//             </button>
//             <button
//               onClick={fetchOptions}
//               className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 shadow-sm hover:bg-blue-50"
//             >
//               {loadingOptions ? "Refreshing…" : "Refresh options"}
//             </button>
//             <button
//               onClick={() => navigate("/stats")}
//               className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 shadow-sm hover:bg-blue-50"
//             >
//               Back to Stats
//             </button>
//           </div>
//         </div>

//         {/* Mode toggle */}
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setMode("create")}
//             className={classNames(
//               "px-3 py-2 rounded-lg border text-sm font-medium",
//               mode === "create"
//                 ? "bg-blue-700 border-blue-700 text-white"
//                 : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
//             )}
//           >
//             Create
//           </button>
//           <button
//             onClick={() => setMode("edit")}
//             className={classNames(
//               "px-3 py-2 rounded-lg border text-sm font-medium",
//               mode === "edit"
//                 ? "bg-blue-700 border-blue-700 text-white"
//                 : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
//             )}
//           >
//             Edit
//           </button>

//           {mode === "edit" && infraId ? (
//             <div className="ml-2 text-sm text-blue-900/70">
//               Editing: <span className="text-blue-950 font-mono">{infraId}</span>
//             </div>
//           ) : null}
//         </div>

//         {/* Errors / notices */}
//         {error ? (
//           <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
//             {error}
//             {mode === "create" && matches?.length ? (
//               <div className="mt-2 text-sm text-red-800/90">
//                 Looks like a match exists. Select it below to edit — or use{" "}
//                 <button className="underline" onClick={() => setForceCreate(true)}>
//                   force create
//                 </button>{" "}
//                 (not recommended unless you’re sure).
//               </div>
//             ) : null}
//           </div>
//         ) : null}

//         {notice ? (
//           <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
//             {notice}
//           </div>
//         ) : null}

//         {/* Smart search */}
//         <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
//           <div className="flex items-start justify-between gap-4">
//             <div className="w-full">
//               <label className="block text-sm text-blue-900/70 mb-1">Infra search</label>
//               <input
//                 value={q}
//                 onChange={(e) => onChangeQ(e.target.value)}
//                 placeholder="Type a name (Google-ish match)…"
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <div className="mt-2 text-xs text-blue-900/60">
//                 Tip: if a strong match appears (≈90%+), create is blocked unless you explicitly force it.
//               </div>
//             </div>

//             <div className="flex flex-col items-end gap-2 pt-6">
//               <div className="text-xs text-blue-900/60">
//                 {loadingSuggest ? "Searching…" : matches?.length ? `${matches.length} matches` : "No matches"}
//               </div>

//               {mode === "create" ? (
//                 <label className="flex items-center gap-2 text-xs text-blue-900/70 select-none">
//                   <input
//                     type="checkbox"
//                     checked={forceCreate}
//                     onChange={(e) => setForceCreate(e.target.checked)}
//                   />
//                   Force create
//                 </label>
//               ) : null}
//             </div>
//           </div>

//           {matches?.length ? (
//             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
//               {matches.map((m, idx) => (
//                 <button
//                   key={`${m.infraId}-${idx}`}
//                   onClick={() => loadToolForEdit(m.infraId)}
//                   className="text-left rounded-xl border border-blue-100 bg-white hover:bg-blue-50 px-4 py-3 shadow-sm"
//                 >
//                   <div className="flex items-center justify-between gap-3">
//                     <div className="font-medium text-blue-950">{m.name}</div>
//                     {scoreBadge(m.score)}
//                   </div>
//                   <div className="text-xs text-blue-900/70 mt-1">
//                     Parent: {m.parentOrg || "—"} • infraId:{" "}
//                     <span className="font-mono">{m.infraId}</span>
//                   </div>
//                   <div className="text-xs text-blue-900/50 mt-1">Click to open in edit mode</div>
//                 </button>
//               ))}
//             </div>
//           ) : null}
//         </div>

//         {/* Form */}
//         <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-blue-950">
//               {mode === "create" ? "Create tool" : "Edit tool"}
//             </h2>

//             {mode === "edit" ? (
//               <button
//                 onClick={softDelete}
//                 disabled={deleting || !infraId}
//                 className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 disabled:opacity-50"
//               >
//                 {deleting ? "Deleting…" : "Delete"}
//               </button>
//             ) : null}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Name */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Name *</label>
//               <input
//                 value={form.name}
//                 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Parent Org (SEARCHABLE) */}
//             <SearchableSelect
//               label="Parent Org"
//               required
//               options={options?.parentOrgs || []}
//               value={form.parentOrg}
//               onChange={(v) => setForm((f) => ({ ...f, parentOrg: v }))}
//               placeholder="Search parent org…"
//             />

//             {/* Link */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Link (domain) *</label>
//               <input
//                 value={form.link}
//                 onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
//                 placeholder="https://example.com"
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* AI Type */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">AI Type *</label>
//               <select
//                 value={form.aiType}
//                 onChange={(e) => setForm((f) => ({ ...f, aiType: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select…</option>
//                 {(options?.aiTypes || []).map((v) => (
//                   <option key={v} value={v}>
//                     {v}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Org Maturity */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Org Maturity *</label>
//               <select
//                 value={form.orgMaturity}
//                 onChange={(e) => setForm((f) => ({ ...f, orgMaturity: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select…</option>
//                 {(options?.orgMaturities || []).map((v) => (
//                   <option key={v} value={v}>
//                     {v}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Inference Location */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Inference Location *</label>
//               <select
//                 value={form.inferenceLocation}
//                 onChange={(e) => setForm((f) => ({ ...f, inferenceLocation: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select…</option>
//                 {(options?.inferenceLocations || []).map((v) => (
//                   <option key={v} value={v}>
//                     {v}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Software Type */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Software Type *</label>
//               <select
//                 value={form.softwareType}
//                 onChange={(e) => setForm((f) => ({ ...f, softwareType: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select…</option>
//                 {(options?.softwareTypes || []).map((v) => (
//                   <option key={v} value={v}>
//                     {v}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* YES/NO fields */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm text-blue-900/70 mb-1">HAS_API *</label>
//                 <select
//                   value={form.hasApi}
//                   onChange={(e) => setForm((f) => ({ ...f, hasApi: e.target.value }))}
//                   className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//                 >
//                   <option value="YES">YES</option>
//                   <option value="NO">NO</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm text-blue-900/70 mb-1">LEGAL_CASE_PENDING *</label>
//                 <select
//                   value={form.legalCasePending}
//                   onChange={(e) => setForm((f) => ({ ...f, legalCasePending: e.target.value }))}
//                   className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//                 >
//                   <option value="YES">YES</option>
//                   <option value="NO">NO</option>
//                 </select>
//               </div>
//             </div>

//             {/* Years */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm text-blue-900/70 mb-1">Year Company Founded</label>
//                 <input
//                   value={form.yearCompanyFounded}
//                   onChange={(e) => setForm((f) => ({ ...f, yearCompanyFounded: e.target.value }))}
//                   inputMode="numeric"
//                   className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm text-blue-900/70 mb-1">Year Launched</label>
//                 <input
//                   value={form.yearLaunched}
//                   onChange={(e) => setForm((f) => ({ ...f, yearLaunched: e.target.value }))}
//                   inputMode="numeric"
//                   className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//                 />
//               </div>
//             </div>

//             {/* Funding */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Funding</label>
//               <select
//                 value={form.funding}
//                 onChange={(e) => setForm((f) => ({ ...f, funding: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//               >
//                 <option value="">Select…</option>
//                 {(options?.fundings || []).map((v) => (
//                   <option key={v} value={v}>
//                     {v}
//                   </option>
//                 ))}
//               </select>
//               {fundingDef ? (
//                 <div className="text-xs text-blue-900/60 mt-2">
//                   <span className="text-blue-900/70">Funding def:</span> {fundingDef}
//                 </div>
//               ) : null}
//             </div>

//             {/* Foundational model */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Foundational Model</label>
//               <select
//                 value={form.foundationalModel}
//                 onChange={(e) => setForm((f) => ({ ...f, foundationalModel: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//               >
//                 <option value="">Select…</option>
//                 {(options?.foundationalModels || []).map((v) => (
//                   <option key={v} value={v}>
//                     {v}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Business model */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">Business Model</label>
//               <select
//                 value={form.businessModel}
//                 onChange={(e) => setForm((f) => ({ ...f, businessModel: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//               >
//                 <option value="">Select…</option>
//                 {(options?.businessModels || []).map((v) => (
//                   <option key={v} value={v}>
//                     {v}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* EULA link */}
//             <div>
//               <label className="block text-sm text-blue-900/70 mb-1">EULA Link</label>
//               <input
//                 value={form.eulaLink}
//                 onChange={(e) => setForm((f) => ({ ...f, eulaLink: e.target.value }))}
//                 placeholder="https://…"
//                 className="w-full px-4 py-2 rounded-lg bg-white border border-blue-200"
//               />
//             </div>
//           </div>

//           {/* Multi-selects */}
//           <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//             <MultiSelect
//               label="Tasks"
//               options={options?.tasks || []}
//               value={form.tasks}
//               onChange={(v) => setForm((f) => ({ ...f, tasks: v }))}
//               theme="light"
//             />
//             <MultiSelect
//               label="Expected Input"
//               options={options?.expectedInputs || []}
//               value={form.expectedInput}
//               onChange={(v) => setForm((f) => ({ ...f, expectedInput: v }))}
//               theme="light"
//             />
//             <MultiSelect
//               label="Generated Output"
//               options={options?.generatedOutputs || []}
//               value={form.generatedOutput}
//               onChange={(v) => setForm((f) => ({ ...f, generatedOutput: v }))}
//               theme="light"
//             />
//           </div>

//           {/* Desc */}
//           <div className="mt-6">
//             <label className="block text-sm text-blue-900/70 mb-1">Desc * (min 50 chars)</label>
//             <textarea
//               value={form.desc}
//               onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
//               rows={4}
//               className="w-full px-4 py-3 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <div className="text-xs text-blue-900/60 mt-1">
//               {String(form.desc || "").trim().length} / 50
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="mt-6 flex items-center justify-between gap-3">
//             <div className="text-xs text-blue-900/60">
//               API base: <span className="font-mono">{API_BASE}</span>
//             </div>

//             <button
//               onClick={save}
//               disabled={!canSubmit || saving || loadingOptions}
//               className={classNames(
//                 "px-5 py-2 rounded-lg border font-semibold shadow-sm",
//                 "bg-blue-700 border-blue-700 text-white hover:bg-blue-800",
//                 !canSubmit || saving || loadingOptions ? "opacity-60 cursor-not-allowed" : ""
//               )}
//             >
//               {saving ? "Saving…" : mode === "create" ? "Create" : "Update"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function MultiSelect({ label, options, value, onChange, theme = "dark" }) {
//   const [filter, setFilter] = useState("");
//   const filtered = useMemo(() => {
//     const f = String(filter || "").trim().toLowerCase();
//     if (!f) return options;
//     return (options || []).filter((v) => String(v).toLowerCase().includes(f));
//   }, [options, filter]);

//   function toggle(v) {
//     const s = new Set(value || []);
//     if (s.has(v)) s.delete(v);
//     else s.add(v);
//     onChange(Array.from(s));
//   }

//   const isLight = theme === "light";
//   const wrap = isLight
//     ? "rounded-xl border border-blue-100 bg-white p-4"
//     : "rounded-xl border border-white/10 bg-black/20 p-4";
//   const labelCls = isLight ? "text-sm text-blue-900/80 font-medium" : "text-sm text-white/80 font-medium";
//   const metaCls = isLight ? "text-xs text-blue-900/60" : "text-xs text-white/50";
//   const inputCls = isLight
//     ? "w-full mb-3 px-3 py-2 rounded-lg bg-white border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//     : "w-full mb-3 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm";
//   const itemCls = isLight ? "text-sm text-blue-950" : "text-sm text-white/80";
//   const emptyCls = isLight ? "text-sm text-blue-900/60" : "text-sm text-white/50";

//   return (
//     <div className={wrap}>
//       <div className="flex items-center justify-between mb-2">
//         <div className={labelCls}>{label}</div>
//         <div className={metaCls}>{(value || []).length} selected</div>
//       </div>

//       <input
//         value={filter}
//         onChange={(e) => setFilter(e.target.value)}
//         placeholder="Search…"
//         className={inputCls}
//       />

//       <div className="max-h-56 overflow-auto pr-1 space-y-2">
//         {filtered.map((v) => {
//           const checked = (value || []).includes(v);
//           return (
//             <label key={v} className={classNames("flex items-center gap-2 select-none", itemCls)}>
//               <input type="checkbox" checked={checked} onChange={() => toggle(v)} />
//               <span className="truncate">{v}</span>
//             </label>
//           );
//         })}
//         {!filtered.length ? <div className={emptyCls}>No matches</div> : null}
//       </div>
//     </div>
//   );
// }


// AdminTools.jsx
// ✅ Adds “Hard delete” next to Delete (only in edit mode) and wires it to the backend.
// Notes:
// - Soft delete = existing behavior (POST /tools/delete { infraId })
// - Hard delete = POST /tools/delete { infraId, hardDelete: true }
// - Uses same admin checks already in your file.

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

/**
 * Decode JWT payload (base64url) and return the email claim.
 * No external deps needed.
 */
function getEmailFromIdToken() {
  try {
    const token = getIdToken();
    if (!token) return "";
    const parts = token.split(".");
    if (parts.length < 2) return "";

    // base64url -> base64
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4) payload += "=";

    const json = JSON.parse(atob(payload));
    return String(json?.email || "").trim();
  } catch {
    return "";
  }
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
  if (Array.isArray(x)) return x.map((v) => String(v ?? "").trim()).filter(Boolean);
  return [String(x).trim()].filter(Boolean);
}

function uniq(arr) {
  return Array.from(new Set((arr || []).map((v) => String(v ?? "").trim()).filter(Boolean)));
}

export default function AdminTools() {
  const navigate = useNavigate();

  const userEmail = getEmailFromIdToken();
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
  const [hardDeleting, setHardDeleting] = useState(false);

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
    funding: "",
  });

  const fundingDef = useMemo(() => {
    const defs = options?.fundingDefs || {};
    return form.funding ? defs[form.funding] || "" : "";
  }, [options, form.funding]);

  const suggestTimer = useRef(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/details", { replace: true });
      return;
    }
  }, [isAdmin, navigate]);

  async function fetchOptions() {
    setError("");
    setLoadingOptions(true);
    try {
      const res = await fetch(`${API_BASE}/options`, {
        method: "GET",
        headers: { ...authHeaders() },
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
      const res = await fetch(`${API_BASE}/tools/suggest?q=${encodeURIComponent(qq)}`, {
        method: "GET",
        headers: { ...authHeaders() },
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
    setHardDeleting(false);

    try {
      const res = await fetch(`${API_BASE}/tool?infraId=${encodeURIComponent(selectedInfraId)}`, {
        method: "GET",
        headers: { ...authHeaders() },
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
        funding: t.fundingType || "",
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
    setDeleting(false);
    setHardDeleting(false);
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
      funding: "",
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
        data: { ...form, fundingDef },
      };

      const res = await fetch(`${API_BASE}/tools/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

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

  // ✅ existing: soft delete
  async function softDelete() {
    if (mode !== "edit" || !infraId) return;
    const ok = window.confirm("Soft delete this tool? (It will disappear from lists.)");
    if (!ok) return;

    setDeleting(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${API_BASE}/tools/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ infraId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Delete failed");
      setNotice("Soft deleted ✅");
      resetToCreate();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setDeleting(false);
    }
  }

  // ✅ NEW: hard delete
  async function hardDelete() {
    if (mode !== "edit" || !infraId) return;

    const ok = window.confirm(
      "HARD delete this tool?\n\nThis permanently removes the record from Mongo.\nThis cannot be undone."
    );
    if (!ok) return;

    // optional second confirm to prevent accidents
    const ok2 = window.confirm("Last chance — permanently delete?");
    if (!ok2) return;

    setHardDeleting(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`${API_BASE}/tools/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ infraId, hardDelete: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Hard delete failed");
      setNotice("Hard deleted ✅");
      resetToCreate();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setHardDeleting(false);
    }
  }

  const canSubmit = useMemo(() => {
    const nameOk = String(form.name || "").trim().length > 0;
    const descOk = String(form.desc || "").trim().length >= 50;
    return nameOk && descOk;
  }, [form.name, form.desc]);

  const scoreBadge = (s) => {
    const n = clamp01(Number(s));
    const pct = Math.round(n * 100);
    const tone =
      n >= 0.9
        ? "bg-red-500/15 text-red-200 border-red-500/30"
        : n >= 0.75
        ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
        : "bg-white/10 text-white/70 border-white/15";
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
              <Link to="/stats" className="hover:underline">
                Admin Stats
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/80">Tools</span>
            </div>
            <h1 className="text-2xl font-semibold mt-1">Manage Tools</h1>
            <p className="text-white/60 mt-1">
              Create new infra tools or edit existing ones. Updates set{" "}
              <span className="text-white/80">lastUpdatedBy</span> automatically.
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
        {loadingOptions ? <div className="mb-4 text-white/70">Loading dropdown options…</div> : null}
        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
            {error}
            {mode === "create" && matches?.length ? (
              <div className="mt-2 text-sm text-red-200/90">
                Looks like a match exists. Select it below to edit — or use{" "}
                <button className="underline" onClick={() => setForceCreate(true)}>
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
                placeholder="Search Existing AI Tools"
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
                    Parent: {m.parentOrg || "—"} • infraId:{" "}
                    <span className="font-mono">{m.infraId}</span>
                  </div>
                  <div className="text-xs text-white/40 mt-1">Click to open in edit mode</div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{mode === "create" ? "Create tool" : "Edit tool"}</h2>

            {/* ✅ Delete buttons cluster (soft + hard) */}
            {mode === "edit" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={softDelete}
                  disabled={deleting || hardDeleting || !infraId}
                  className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/20 border border-red-500/30 text-red-200 disabled:opacity-50"
                  title="Soft delete (reversible if you edit DB / allowEditDeleted)"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>

                <button
                  onClick={hardDelete}
                  disabled={hardDeleting || deleting || !infraId}
                  className="px-3 py-2 rounded-lg bg-red-600/25 hover:bg-red-600/35 border border-red-600/40 text-red-100 disabled:opacity-50"
                  title="Hard delete (permanent)"
                >
                  {hardDeleting ? "Hard deleting…" : "Hard delete"}
                </button>
              </div>
            ) : null}
          </div>

          {/* ---- rest of your form stays the same ---- */}
          {/* KEEP your existing form fields below this line (unchanged) */}

          {/* ... your existing form JSX ... */}

          <div className="mt-6 text-xs text-white/50">
            Signed in as <span className="text-white/70">{userEmail || "—"}</span>
          </div>
        </div>

        <div className="mt-6 text-xs text-white/40">
          API base: <span className="font-mono">{API_BASE}</span>
        </div>
      </div>
    </div>
  );
}

/* Keep your existing MultiSelect component below (unchanged) */
function MultiSelect({ label, options, value, onChange }) {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    const f = String(filter || "").trim().toLowerCase();
    if (!f) return options;
    return (options || []).filter((v) => String(v).toLowerCase().includes(f));
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
              <input type="checkbox" checked={checked} onChange={() => toggle(v)} />
              <span className="truncate">{v}</span>
            </label>
          );
        })}
        {!filtered.length ? <div className="text-sm text-white/50">No matches</div> : null}
      </div>
    </div>
  );
}

