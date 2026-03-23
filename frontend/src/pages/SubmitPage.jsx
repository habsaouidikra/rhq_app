import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import s from "./SubmitPage.module.css";

const ACTS = ["","Interpersonal","Intrapersonal","Interactive","Reactive"];
const FUNCTIONS = ["","Frustration","Irony","Disappointment","Complaint","Politeness","Confirming","Disagreement","Denial","Suggestion","Luring","Surprise","Warn","Guilt"];
const STRUCTURALS = ["","Wh-question","Binary question","Alternative question"];

export default function SubmitPage() {
  const [form, setForm] = useState({ tarifit:"", locutionary:"", illocutionary:"", act:"", function:"", structural:"", submitted_by:"" });
  const [status, setStatus] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.tarifit.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/rhq/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
      if (data.success) setForm({ tarifit:"", locutionary:"", illocutionary:"", act:"", function:"", structural:"", submitted_by:"" });
    } catch { setStatus("error"); }
  };

  if (status === "success") return (
    <div className={s.page}><Nav />
      <div className={s.container}>
        <div className={s.successBox}>
          <div className={s.successIcon}>✓</div>
          <h2>Submission received!</h2>
          <p>Your RHQ has been sent for admin review. Thank you for contributing to the corpus.</p>
          <div className={s.successBtns}>
            <button onClick={() => setStatus(null)} className={s.btnPrimary}>Submit another</button>
            <Link to="/" className={s.btnSecondary}>Back to explore</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={s.page}><Nav />
      <div className={s.container}>
        <Link to="/" className={s.back}>← Back to explore</Link>
        <h1 className={s.title}>Contribute an RHQ</h1>
        <p className={s.desc}>Add a Tarifit rhetorical question to the corpus. Only the Tarifit text is required — fill in what you know and the admin will complete the rest.</p>
        <div className={s.notice}>ℹ Submissions are reviewed before appearing publicly.</div>

        <form className={s.form} onSubmit={submit}>
          <div className={s.fieldReq}>
            <label>Tarifit text <span className={s.req}>*required</span></label>
            <input value={form.tarifit} onChange={e => set("tarifit", e.target.value)} placeholder="e.g. min šəm yuɣin?" className={s.input} required />
            <span className={s.hint}>The rhetorical question in Tarifit Berber</span>
          </div>

          <div className={s.divider}>Optional — fill in what you know</div>

          <div className={s.grid2}>
            <div className={s.field}>
              <label>Locutionary meaning</label>
              <input value={form.locutionary} onChange={e => set("locutionary", e.target.value)} placeholder="Literal English translation" className={s.input} />
            </div>
            <div className={s.field}>
              <label>Illocutionary meaning</label>
              <input value={form.illocutionary} onChange={e => set("illocutionary", e.target.value)} placeholder="What is actually meant" className={s.input} />
            </div>
          </div>

          <div className={s.grid3}>
            <div className={s.field}>
              <label>Speech Act</label>
              <select value={form.act} onChange={e => set("act", e.target.value)} className={s.select}>
                {ACTS.map(a => <option key={a} value={a}>{a || "— select —"}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label>Pragmatic Function</label>
              <select value={form.function} onChange={e => set("function", e.target.value)} className={s.select}>
                {FUNCTIONS.map(f => <option key={f} value={f}>{f || "— select —"}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label>Structural type</label>
              <select value={form.structural} onChange={e => set("structural", e.target.value)} className={s.select}>
                {STRUCTURALS.map(st => <option key={st} value={st}>{st || "— select —"}</option>)}
              </select>
            </div>
          </div>

          <div className={s.field} style={{maxWidth:260}}>
            <label>Your name <span className={s.opt}>(optional)</span></label>
            <input value={form.submitted_by} onChange={e => set("submitted_by", e.target.value)} placeholder="Anonymous" className={s.input} />
          </div>

          {status === "error" && <div className={s.errMsg}>Something went wrong. Please try again.</div>}

          <button type="submit" className={s.submitBtn} disabled={status === "loading" || !form.tarifit.trim()}>
            {status === "loading" ? "Submitting..." : "Submit for review →"}
          </button>
        </form>
      </div>
    </div>
  );
}
