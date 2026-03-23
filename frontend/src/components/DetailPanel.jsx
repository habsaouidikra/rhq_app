import s from "./DetailPanel.module.css";

const FN_COLORS = {
  Frustration:"#C4623A", Irony:"#8E44AD", Disappointment:"#2980B9",
  Complaint:"#D35400", Politeness:"#27AE60", Confirming:"#F39C12",
  Disagreement:"#C0392B", Denial:"#7F8C8D", Suggestion:"#1ABC9C",
  Luring:"#E74C3C", Surprise:"#E67E22", Warn:"#C0392B", Guilt:"#8E44AD",
};

export default function DetailPanel({ rhq, onClose }) {
  if (!rhq) return null;
  const color = FN_COLORS[rhq.function] || "#95A5A6";
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={e => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>✕</button>
        <div className={s.imgWrap}>
          {rhq.illustration
            ? <img src={rhq.illustration} alt={rhq.function} className={s.img} />
            : <div className={s.noImg} style={{ background: `${color}12` }}>
                <span style={{ color }}>No illustration yet</span>
              </div>
          }
        </div>
        <div className={s.content}>
          <div className={s.topRow}>
            <span className={s.id} style={{ color }}>RHQ #{rhq.rhq_id || rhq.id}</span>
            <span className={s.fnBadge} style={{ background: `${color}18`, color }}>{rhq.function}</span>
          </div>
          <h2 className={s.tarifit}>{rhq.tarifit}</h2>
          <div className={s.fields}>
            {rhq.locutionary && <Field label="Locutionary" value={rhq.locutionary} />}
            {rhq.illocutionary && <Field label="Illocutionary" value={rhq.illocutionary} highlight color={color} />}
            {rhq.act && <Field label="Speech Act" value={rhq.act} />}
            {rhq.structural && <Field label="Structure" value={rhq.structural} />}
          </div>
          <div className={s.meta}>
            <span>by {rhq.submitted_by || "anonymous"}</span>
            {rhq.approved_at && <span>{new Date(rhq.approved_at).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, highlight, color }) {
  return (
    <div className={s.field} style={highlight ? { borderLeft: `3px solid ${color}`, background: `${color}08` } : {}}>
      <span className={s.fieldLabel}>{label}</span>
      <span className={s.fieldVal}>{value}</span>
    </div>
  );
}
