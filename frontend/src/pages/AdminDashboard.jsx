import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin, getAdminHeaders } from "../hooks/useAdmin";
import s from "./AdminDashboard.module.css";

const ACTS = ["Interpersonal","Intrapersonal","Interactive","Reactive"];
const FUNCTIONS = ["Frustration","Irony","Disappointment","Complaint","Politeness","Confirming","Disagreement","Denial","Suggestion","Luring","Surprise","Warn","Guilt"];
const STRUCTURALS = ["Wh-question","Binary question","Alternative question"];

export default function AdminDashboard() {
  const { logout } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [busy, setBusy] = useState({});
  const [selected, setSelected] = useState([]);
  const [csvStatus, setCsvStatus] = useState(null);

  const H = getAdminHeaders();

  const load = () => {
    setLoading(true);
    const url = tab === "pending" ? "/api/admin/pending" : "/api/admin/all";
    fetch(url, { headers: H })
      .then(r => r.json())
      .then(d => { setEntries(Array.isArray(d) ? d : []); setLoading(false); setSelected([]); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const displayed = tab === "all" ? entries : entries.filter(e => e.status === "pending" || e.status === "approved_pending");

  // ── Selection ──
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === displayed.length ? [] : displayed.map(e => e.id));

  // ── Delete (permanent) ──
  const deleteSelected = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Permanently delete ${selected.length} entr${selected.length === 1 ? "y" : "ies"}? This cannot be undone.`)) return;
    for (const id of selected) {
      await fetch(`/api/admin/${id}`, { method: "DELETE", headers: H });
    }
    setSelected([]);
    load();
  };

  // ── Approve → approved_pending ──
  const approve = async (id) => {
    setBusy(b => ({ ...b, [id]: "approving" }));
    const body = editId === id ? editData : {};
    await fetch(`/api/admin/${id}/approve`, { method: "PATCH", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setEditId(null);
    setBusy(b => ({ ...b, [id]: null }));
    load();
  };

  // ── Generate illustration ──
  const generate = async (id) => {
    setBusy(b => ({ ...b, [id]: "generating" }));
    const res = await fetch(`/api/admin/${id}/generate`, { method: "PATCH", headers: H });
    const data = await res.json();
    setBusy(b => ({ ...b, [id]: null }));
    if (data.error) alert("Error: " + data.error);
    else load();
  };

  // ── Publish ──
  const publish = async (id) => {
    setBusy(b => ({ ...b, [id]: "publishing" }));
    await fetch(`/api/admin/${id}/publish`, { method: "PATCH", headers: H });
    setBusy(b => ({ ...b, [id]: null }));
    load();
  };

  // ── Reject ──
  const reject = async (id) => {
    setBusy(b => ({ ...b, [id]: "rejecting" }));
    await fetch(`/api/admin/${id}/reject`, { method: "PATCH", headers: H });
    setBusy(b => ({ ...b, [id]: null }));
    load();
  };

  // ── Edit ──
  const startEdit = (e) => {
    setEditId(e.id);
    setEditData({ rhq_id: e.rhq_id||"", tarifit: e.tarifit||"", locutionary: e.locutionary||"", illocutionary: e.illocutionary||"", act: e.act||"", function: e.function||"", structural: e.structural||"" });
  };

  const saveEdit = async (id) => {
    setBusy(b => ({ ...b, [id]: "saving" }));
    await fetch(`/api/admin/${id}/edit`, { method: "PATCH", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify(editData) });
    setBusy(b => ({ ...b, [id]: null }));
    setEditId(null);
    load();
  };

  // ── CSV ──
  const uploadCsv = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setCsvStatus("uploading");
    const form = new FormData(); form.append("file", file);
    const res = await fetch("/api/admin/import-csv", { method: "POST", headers: H, body: form });
    const data = await res.json();
    setCsvStatus(data.success ? `✓ Imported ${data.imported} entries` : "Error: " + data.error);
    load(); e.target.value = "";
  };

  const exportCsv = () => {
    fetch("/api/admin/export-csv", { headers: H })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "rhq_corpus.csv"; a.click();
        URL.revokeObjectURL(url);
      });
  };

  const pendingCount = entries.filter(e => e.status === "pending" || e.status === "approved_pending").length;

  return (
    <div className={s.page}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}>
          <span className={s.logoTif}>ⵔⵉⴽⵓ</span>
          <span className={s.logoSub}>Admin</span>
        </div>
        <nav className={s.sideNav}>
          <button className={`${s.navBtn} ${tab === "pending" ? s.navActive : ""}`} onClick={() => setTab("pending")}>
            <span>⏳</span> Pending
            {pendingCount > 0 && <span className={s.badge}>{pendingCount}</span>}
          </button>
          <button className={`${s.navBtn} ${tab === "all" ? s.navActive : ""}`} onClick={() => setTab("all")}>
            <span>📋</span> All Entries
          </button>
          <button className={s.navBtn} onClick={() => navigate("/")}>
            <span>🃏</span> Public View
          </button>
        </nav>
        <div className={s.csvSection}>
          <p className={s.csvLabel}>Import CSV</p>
          <label className={s.csvBtn}>Upload CSV<input type="file" accept=".csv" onChange={uploadCsv} hidden /></label>
          {csvStatus && <span className={s.csvStatus}>{csvStatus}</span>}
          <p className={s.csvLabel} style={{marginTop:"1rem"}}>Export Corpus</p>
          <button className={s.csvBtn} onClick={exportCsv}>⬇ Export CSV</button>
        </div>
        <button className={s.logoutBtn} onClick={() => { logout(); navigate("/"); }}>Sign out</button>
      </aside>

      {/* Main */}
      <main className={s.main}>
        <div className={s.mainHeader}>
          <h1 className={s.mainTitle}>{tab === "pending" ? "Pending Review" : "All Entries"}</h1>
          <span className={s.mainCount}>{displayed.length} entries</span>
        </div>

        {/* Batch bar */}
        {displayed.length > 0 && (
          <div className={s.batchBar}>
            <label className={s.selectAll}>
              <input type="checkbox" checked={selected.length === displayed.length && displayed.length > 0} onChange={toggleAll} className={s.cb} />
              {selected.length === 0 ? "Select all" : `${selected.length} selected`}
            </label>
            {selected.length > 0 && (
              <button className={s.btnDelete} onClick={deleteSelected}>
                🗑 Delete {selected.length} entr{selected.length === 1 ? "y" : "ies"}
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className={s.empty}>Loading...</div>
        ) : displayed.length === 0 ? (
          <div className={s.empty}>{tab === "pending" ? "No pending submissions — all clear! 🎉" : "No entries yet."}</div>
        ) : (
          <div className={s.entries}>
            {displayed.map(entry => (
              <div key={entry.id} className={`${s.entry} ${s["st_" + entry.status.replace("_","")]} ${selected.includes(entry.id) ? s.entrySelected : ""}`}>

                {/* Entry header */}
                <div className={s.entryTop}>
                  <div className={s.entryMeta}>
                    <input type="checkbox" checked={selected.includes(entry.id)} onChange={() => toggleOne(entry.id)} className={s.cb} />
                    <span className={s.statusBadge} data-st={entry.status}>
                      {entry.status === "approved_pending" ? "needs illustration" : entry.status}
                    </span>
                    <span className={s.metaText}>by {entry.submitted_by || "anonymous"}</span>
                    <span className={s.metaText}>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={s.entryActions}>
                    {entry.status === "pending" && <>
                      {editId !== entry.id
                        ? <button className={s.btnEdit} onClick={() => startEdit(entry)}>Edit</button>
                        : <button className={s.btnSave} onClick={() => saveEdit(entry.id)} disabled={!!busy[entry.id]}>{busy[entry.id] === "saving" ? "Saving..." : "Save"}</button>
                      }
                      <button className={s.btnApprove} onClick={() => approve(entry.id)} disabled={!!busy[entry.id]}>{busy[entry.id] === "approving" ? "..." : "✓ Approve"}</button>
                      <button className={s.btnReject} onClick={() => reject(entry.id)} disabled={!!busy[entry.id]}>{busy[entry.id] === "rejecting" ? "..." : "✕ Reject"}</button>
                    </>}
                    {entry.status === "approved_pending" && <>
                      <button className={s.btnGen} onClick={() => generate(entry.id)} disabled={!!busy[entry.id]}>{busy[entry.id] === "generating" ? "⏳ Generating..." : "🎨 Generate"}</button>
                      <button className={s.btnApprove} onClick={() => publish(entry.id)} disabled={!entry.illustration || !!busy[entry.id]}>{busy[entry.id] === "publishing" ? "..." : "✓ Publish"}</button>
                      <button className={s.btnReject} onClick={() => reject(entry.id)} disabled={!!busy[entry.id]}>✕</button>
                    </>}
                    {entry.status === "approved" && <>
                      <button className={s.btnEdit} onClick={() => startEdit(entry)}>Edit</button>
                      <button className={s.btnGen} onClick={() => generate(entry.id)} disabled={!!busy[entry.id]}>{busy[entry.id] === "generating" ? "⏳ Generating..." : "🎨 Regenerate"}</button>
                    </>}
                  </div>
                </div>

                {/* Edit form */}
                {editId === entry.id ? (
                  <div className={s.editForm}>
                    <div className={s.g2}><EF label="RHQ ID" v={editData.rhq_id} o={v => setEditData(d=>({...d,rhq_id:v}))}/><EF label="Tarifit *" v={editData.tarifit} o={v => setEditData(d=>({...d,tarifit:v}))}/></div>
                    <div className={s.g2}><EF label="Locutionary" v={editData.locutionary} o={v => setEditData(d=>({...d,locutionary:v}))}/><EF label="Illocutionary" v={editData.illocutionary} o={v => setEditData(d=>({...d,illocutionary:v}))}/></div>
                    <div className={s.g3}>
                      <ES label="Act" v={editData.act} opts={ACTS} o={v => setEditData(d=>({...d,act:v}))}/>
                      <ES label="Function" v={editData.function} opts={FUNCTIONS} o={v => setEditData(d=>({...d,function:v}))}/>
                      <ES label="Structural" v={editData.structural} opts={STRUCTURALS} o={v => setEditData(d=>({...d,structural:v}))}/>
                    </div>
                    <button className={s.btnCancel} onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                ) : (
                  <div className={s.entryBody}>
                    <p className={s.tarifit}>{entry.tarifit}</p>
                    <div className={s.dataFields}>
                      {entry.locutionary && <DF label="Locutionary" v={entry.locutionary}/>}
                      {entry.illocutionary && <DF label="Illocutionary" v={entry.illocutionary}/>}
                      {entry.act && <DF label="Act" v={entry.act}/>}
                      {entry.function && <DF label="Function" v={entry.function}/>}
                      {entry.structural && <DF label="Structural" v={entry.structural}/>}
                    </div>
                    {entry.illustration && (
                      <div className={s.thumbRow}>
                        <img src={entry.illustration} alt="illustration" className={s.thumb}/>
                        <span className={s.thumbNote}>{entry.status === "approved_pending" ? "Preview — click Publish when satisfied" : "✓ Published"}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EF({ label, v, o }) {
  return <div className={s.ef}><label>{label}</label><input value={v} onChange={e => o(e.target.value)} className={s.ei}/></div>;
}
function ES({ label, v, opts, o }) {
  return <div className={s.ef}><label>{label}</label><select value={v} onChange={e => o(e.target.value)} className={s.ei}><option value="">— select —</option>{opts.map(x=><option key={x} value={x}>{x}</option>)}</select></div>;
}
function DF({ label, v }) {
  return <div className={s.df}><span className={s.dfLabel}>{label}</span><span className={s.dfVal}>{v}</span></div>;
}
