// import { useMemo, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { useData } from "../context/DataContext.jsx";
// import Cookies from "js-cookie";

// export default function ToolDetails() {
//   const { infraId } = useParams();
//   const { tools, loading, error } = useData();
//   const [msg, setMsg] = useState("");
//   const [exporting, setExporting] = useState(false);
//   const [creditsLeft, setCreditsLeft] = useState(null); // credits per 24h (per tool)

//   const tool = useMemo(() => {
//     const id = decodeURIComponent(infraId);
//     return tools.find(t =>
//       (t._raw?.INFRA_ID || t._raw?.infra_id || t.infraId || t.toolName) == id
//     );
//   }, [tools, infraId]);

//   const exportJSON = async () => {
//     if (!tool) return;
//     setMsg("");

//     if (creditsLeft === 0) {
//       setMsg("You’ve hit your export limit for the last 24 hours.");
//       return;
//     }

//     const jwt = Cookies.get("idToken");
//     if (!jwt) {
//       setMsg("Missing login token. Please sign out and sign in again.");
//       return;
//     }

//     const id =
//       tool._raw?.INFRA_ID ||
//       tool._raw?.infra_id ||
//       tool.infraId ||
//       tool.toolName;

//     setExporting(true);
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_BASE}/api/export`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${jwt}`
//           },
//           body: JSON.stringify({
//             infraIds: [id],
//             format: "json"
//           })
//         }
//       );

//       const data = await res.json().catch(() => ({}));

//       if (!res.ok) {
//         if (data.exportsLeft != null) setCreditsLeft(data.exportsLeft);
//         setMsg(data.error || "Export failed.");
//         return;
//       }

//       const payload = data.rows?.[0] || tool;
//       const left = data.exportsLeft;

//       setCreditsLeft(left);

//       const blob = new Blob(
//         [JSON.stringify(payload, null, 2)],
//         { type: "application/json" }
//       );
//       downloadBlob(blob, `${tool.toolName || "tool"}-details.json`);

//       setMsg(`Exported. Credits left (24h): ${left}.`);
//     } catch (e) {
//       setMsg(e.message || "Export failed.");
//     } finally {
//       setExporting(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading…</div>;
//   if (error) return <div className="p-6 text-red-600">{error}</div>;
//   if (!tool) {
//     return (
//       <div className="p-6">
//         <div className="text-lg font-semibold">Tool not found.</div>
//         <Link to="/details" className="text-blue-700 underline">
//           Back to dashboard
//         </Link>
//       </div>
//     );
//   }

//   const raw = tool._raw || {};

//   return (
//     <div className="min-h-screen bg-slate-50 p-8">
//       {/* top bar */}
//       <div className="flex items-center justify-between mb-3">
//         <Link to="/details" className="text-blue-700 underline text-sm">
//           ← Back to dashboard
//         </Link>

//         <div className="flex items-center gap-3">
//           <div className="text-xs text-blue-900/70">
//             Credits left (24h):{" "}
//             <span className="font-bold text-blue-950">
//               {creditsLeft == null ? "—" : creditsLeft}
//             </span>
//           </div>

//           <button
//             onClick={exportJSON}
//             disabled={exporting || creditsLeft === 0}
//             className={`px-4 py-2 rounded-lg text-sm font-semibold transition
//               ${exporting || creditsLeft === 0
//                 ? "bg-blue-200 text-blue-900 cursor-not-allowed"
//                 : "bg-blue-700 text-white hover:bg-blue-800"}
//             `}
//           >
//             Export JSON
//           </button>
//         </div>
//       </div>

//       {msg && <div className="text-sm mb-4 text-red-600">{msg}</div>}

//       {/* header */}
//       <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border">
//         <h1 className="text-3xl font-bold text-blue-950">{tool.toolName}</h1>
//         <div className="text-sm text-blue-900/70 mt-2 flex flex-wrap gap-4">
//           <Meta label="Infra ID" value={raw.INFRA_ID || raw.infra_id || "—"} />
//           <Meta label="Parent Org" value={tool.parentOrg || "—"} />
//           <Meta label="Year Launched" value={tool.yearLaunched || "—"} />
//           <Meta
//             label="Website"
//             value={
//               raw.LINK ? (
//                 <a
//                   className="underline text-blue-700"
//                   href={raw.LINK}
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   {raw.LINK}
//                 </a>
//               ) : "—"
//             }
//           />
//         </div>
//       </div>

//       {/* main two columns */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Section title="Technology">
//           <Field label="Tasks" value={(tool.tasks || []).join(", ") || "—"} />
//           <Field label="Software Type" value={tool.softwareType || "—"} />
//           <Field label="Expected Input" value={(tool.expectedInput || []).join(", ") || "—"} />
//           <Field label="Generated Output" value={(tool.generatedOutput || []).join(", ") || "—"} />
//           <Field label="Model Type" value={tool.modelType || "—"} />
//           <Field label="Foundational Model" value={tool.foundationalModel || "—"} />
//           <Field label="Inference Location" value={tool.inferenceLocation || "—"} />
//           <Field label="Has API" value={tool.hasApi == null ? "Info Not Public" : (tool.hasApi ? "YES" : "NO")} />
//           <Field label="Description" value={raw.DESCRIPTION || "—"} />
//         </Section>

//         <Section title="Business">
//           <Field label="Parent Organization" value={tool.parentOrg || "—"} />
//           <Field label="Org Maturity" value={tool.orgMaturity || "—"} />
//           <Field label="Funding Type" value={tool.fundingType || "—"} />
//           <Field label="Business Model" value={tool.businessModel || "—"} />
//           <Field label="Potential for IP Creation" value={tool.ipCreationPotential || "—"} />
//           <Field label="Reason for IP" value={raw.REASON_FOR_IP || "—"} />
//           <Field label="Legal Case Pending" value={tool.legalCasePending == null ? "Info Not Public" : (tool.legalCasePending ? "YES" : "NO")} />
//           <Field label="Year Company Founded" value={tool.yearCompanyFounded || "—"} />
//           <Field
//             label="EULA Link"
//             value={
//               raw.EULA_LINK ? (
//                 <a
//                   className="underline text-blue-700"
//                   href={raw.EULA_LINK}
//                   target="_blank"
//                   rel="noreferrer"
//                 >
//                   Open EULA
//                 </a>
//               ) : "—"
//             }
//           />
//         </Section>
//       </div>

//       {/* raw record */}
//       <details className="mt-8 bg-white rounded-2xl shadow-sm border p-5">
//         <summary className="cursor-pointer font-semibold text-blue-950">
//           Full Raw Record (all fields)
//         </summary>

//         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//           {Object.entries(raw).map(([k, v]) => (
//             <div key={k} className="border rounded-lg p-3">
//               <div className="font-semibold text-blue-900">{k}</div>
//               <div className="text-slate-700 break-words mt-1">
//                 {String(v ?? "—")}
//               </div>
//             </div>
//           ))}
//         </div>
//       </details>
//     </div>
//   );
// }

// /* helpers */
// function Section({ title, children }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm p-6 border">
//       <h2 className="text-xl font-bold text-blue-950 mb-4">{title}</h2>
//       <div className="space-y-3">{children}</div>
//     </div>
//   );
// }

// function Field({ label, value }) {
//   return (
//     <div className="flex flex-col">
//       <div className="text-xs uppercase tracking-wide text-blue-900/60">{label}</div>
//       <div className="text-sm text-slate-800 mt-1">{value}</div>
//     </div>
//   );
// }

// function Meta({ label, value }) {
//   return (
//     <div>
//       <span className="text-xs uppercase text-blue-900/60">{label}:</span>{" "}
//       <span className="text-sm text-slate-800">{value}</span>
//     </div>
//   );
// }

// function downloadBlob(blob, filename) {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// }


import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext.jsx";
import Cookies from "js-cookie";

export default function ToolDetails() {
  const { infraId } = useParams();
  const { tools, loading, error } = useData();
  const [msg, setMsg] = useState("");
  const [exporting, setExporting] = useState(false);
  const [creditsLeft, setCreditsLeft] = useState(null); // credits per 24h (per tool)

  const tool = useMemo(() => {
    const id = decodeURIComponent(infraId);
    return tools.find(t =>
      (t._raw?.INFRA_ID || t._raw?.infra_id || t.infraId || t.toolName) == id
    );
  }, [tools, infraId]);

  const exportJSON = async () => {
    if (!tool) return;
    setMsg("");

    if (creditsLeft === 0) {
      setMsg("You’ve hit your export limit for the last 24 hours.");
      return;
    }

    const jwt = Cookies.get("idToken");
    if (!jwt) {
      setMsg("Missing login token. Please sign out and sign in again.");
      return;
    }

    const id =
      tool._raw?.INFRA_ID ||
      tool._raw?.infra_id ||
      tool.infraId ||
      tool.toolName;

    setExporting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`
          },
          body: JSON.stringify({
            infraIds: [id],
            format: "json"
          })
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.exportsLeft != null) setCreditsLeft(data.exportsLeft);
        setMsg(data.error || "Export failed.");
        return;
      }

      const payload = data.rows?.[0] || tool;
      const left = data.exportsLeft;

      setCreditsLeft(left);

      const blob = new Blob(
        [JSON.stringify(payload, null, 2)],
        { type: "application/json" }
      );
      downloadBlob(blob, `${tool.toolName || "tool"}-details.json`);

      setMsg(`Exported. Credits left (24h): ${left}.`);
    } catch (e) {
      setMsg(e.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!tool) {
    return (
      <div className="p-6">
        <div className="text-lg font-semibold">Tool not found.</div>
        <Link to="/details" className="text-blue-700 underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const raw = tool._raw || {};

  // ✅ NORMALIZED BOOLS (same precedence as table + applyFilters)
  const hasApiBool = (() => {
    const rawVal = String(raw.HAS_API || raw.has_api || "")
      .trim()
      .toUpperCase();
    if (rawVal) return rawVal === "YES";
    if (typeof tool.hasApi === "boolean") return tool.hasApi;
    return null; // unknown / not public
  })();

  const legalCaseBool = (() => {
    const rawVal = String(raw.LEGAL_CASE_PENDING || raw.legal_case_pending || "")
      .trim()
      .toUpperCase();
    if (rawVal) return rawVal === "YES";
    if (typeof tool.legalCasePending === "boolean") return tool.legalCasePending;
    return null;
  })();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* top bar */}
      <div className="flex items-center justify-between mb-3">
        <Link to="/details" className="text-blue-700 underline text-sm">
          ← Back to dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-xs text-blue-900/70">
            Credits left (24h):{" "}
            <span className="font-bold text-blue-950">
              {creditsLeft == null ? "—" : creditsLeft}
            </span>
          </div>

          <button
            onClick={exportJSON}
            disabled={exporting || creditsLeft === 0}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition
              ${exporting || creditsLeft === 0
                ? "bg-blue-200 text-blue-900 cursor-not-allowed"
                : "bg-blue-700 text-white hover:bg-blue-800"}
            `}
          >
            Export JSON
          </button>
        </div>
      </div>

      {msg && <div className="text-sm mb-4 text-red-600">{msg}</div>}

      {/* header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border">
        <h1 className="text-3xl font-bold text-blue-950">{tool.toolName}</h1>
        <div className="text-sm text-blue-900/70 mt-2 flex flex-wrap gap-4">
          <Meta label="Infra ID" value={raw.INFRA_ID || raw.infra_id || "—"} />
          <Meta label="Parent Org" value={tool.parentOrg || "—"} />
          <Meta label="Year Launched" value={tool.yearLaunched || "—"} />
          <Meta
            label="Website"
            value={
              raw.LINK ? (
                <a
                  className="underline text-blue-700"
                  href={raw.LINK}
                  target="_blank"
                  rel="noreferrer"
                >
                  {raw.LINK}
                </a>
              ) : "—"
            }
          />
        </div>
      </div>

      {/* main two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Technology">
          <Field label="Tasks" value={(tool.tasks || []).join(", ") || "—"} />
          <Field label="Software Type" value={tool.softwareType || "—"} />
          <Field label="Expected Input" value={(tool.expectedInput || []).join(", ") || "—"} />
          <Field label="Generated Output" value={(tool.generatedOutput || []).join(", ") || "—"} />
          <Field label="Model Type" value={tool.modelType || "—"} />
          <Field label="Foundational Model" value={tool.foundationalModel || "—"} />
          <Field label="Inference Location" value={tool.inferenceLocation || "—"} />
          <Field
            label="Has API"
            value={
              hasApiBool == null
                ? "Info Not Public"
                : hasApiBool
                ? "YES"
                : "NO"
            }
          />
          <Field label="Description" value={raw.DESCRIPTION || "—"} />
        </Section>

        <Section title="Business">
          <Field label="Parent Organization" value={tool.parentOrg || "—"} />
          <Field label="Org Maturity" value={tool.orgMaturity || "—"} />
          <Field label="Funding Type" value={tool.fundingType || "—"} />
          <Field label="Business Model" value={tool.businessModel || "—"} />
          <Field label="Potential for IP Creation" value={tool.ipCreationPotential || "—"} />
          <Field label="Reason for IP" value={raw.REASON_FOR_IP || "—"} />
          <Field
            label="Legal Case Pending"
            value={
              legalCaseBool == null
                ? "Info Not Public"
                : legalCaseBool
                ? "YES"
                : "NO"
            }
          />
          <Field label="Year Company Founded" value={tool.yearCompanyFounded || "—"} />
          <Field
            label="EULA Link"
            value={
              raw.EULA_LINK ? (
                <a
                  className="underline text-blue-700"
                  href={raw.EULA_LINK}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open EULA
                </a>
              ) : "—"
            }
          />
        </Section>
      </div>

      {/* raw record */}
      <details className="mt-8 bg-white rounded-2xl shadow-sm border p-5">
        <summary className="cursor-pointer font-semibold text-blue-950">
          Full Raw Record (all fields)
        </summary>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {Object.entries(raw).map(([k, v]) => (
            <div key={k} className="border rounded-lg p-3">
              <div className="font-semibold text-blue-900">{k}</div>
              <div className="text-slate-700 break-words mt-1">
                {String(v ?? "—")}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

/* helpers */
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border">
      <h2 className="text-xl font-bold text-blue-950 mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col">
      <div className="text-xs uppercase tracking-wide text-blue-900/60">{label}</div>
      <div className="text-sm text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <span className="text-xs uppercase text-blue-900/60">{label}:</span>{" "}
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


