import s from "./RhqCard.module.css";

const FN_COLORS = {
  Frustration:"#C4623A", Irony:"#8E44AD", Disappointment:"#2980B9",
  Complaint:"#D35400", Politeness:"#27AE60", Confirming:"#F39C12",
  Disagreement:"#C0392B", Denial:"#7F8C8D", Suggestion:"#1ABC9C",
  Luring:"#E74C3C", Surprise:"#E67E22", Warn:"#C0392B", Guilt:"#8E44AD",
};

function CardImage({ src, fn }) {
  const color = FN_COLORS[fn] || "#95A5A6";
  if (!src) {
    return (
      <div className={s.placeholder} style={{ background: `${color}15` }}>
        <div className={s.placeholderDot} style={{ background: color }} />
        <span style={{ color }}>Illustration pending</span>
      </div>
    );
  }
  return <img src={src} alt={fn} className={s.cardImg} />;
}

export default function RhqCard({ rhq, onClick, isActive }) {
  const color = FN_COLORS[rhq.function] || "#95A5A6";
  return (
    <div
      className={`${s.card} ${isActive ? s.active : ""}`}
      onClick={() => onClick(rhq)}
      style={{ "--accent": color }}
    >
      <div className={s.imgWrap}>
        <CardImage src={rhq.illustration} fn={rhq.function} />
      </div>
      <div className={s.body}>
        <span className={s.idTag}>#{rhq.rhq_id || rhq.id}</span>
        <p className={s.tarifit}>{rhq.tarifit}</p>
        {rhq.locutionary && <p className={s.loc}>"{rhq.locutionary}"</p>}
        <div className={s.tags}>
          <span className={s.fnTag} style={{ background: `${color}18`, color }}>{rhq.function}</span>
          {rhq.act && <span className={s.grayTag}>{rhq.act}</span>}
          {rhq.structural && <span className={s.grayTag}>{rhq.structural}</span>}
        </div>
      </div>
    </div>
  );
}
