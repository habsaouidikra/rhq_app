import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import RhqCard from "../components/RhqCard";
import DetailPanel from "../components/DetailPanel";
import s from "./PublicView.module.css";

const FUNCTIONS = ["All","Frustration","Irony","Disappointment","Complaint","Politeness","Confirming","Disagreement","Denial","Suggestion","Luring","Surprise","Warn","Guilt"];
const ACTS = ["All","Interpersonal","Intrapersonal","Interactive","Reactive"];

export default function PublicView() {
  const [rhqs, setRhqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [fnFilter, setFnFilter] = useState("All");
  const [actFilter, setActFilter] = useState("All");
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch("/api/rhq")
      .then(r => r.json())
      .then(d => { setRhqs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = rhqs.filter(r =>
    (fnFilter === "All" || r.function === fnFilter) &&
    (actFilter === "All" || r.act === actFilter)
  );

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <div className={s.page}>
      <Nav />

      <div className={s.banner}>
        <span className={s.betaTag}>Preliminary Version</span>
        <p>This is an early-stage linguistic dataset. Classifications are being reviewed and enriched. ML-based inference coming in a future release.</p>
      </div>

      <header className={s.header}>
        <h1 className={s.title}>Tarifit Rhetorical Questions</h1>
        <p className={s.subtitle}>A structured corpus of RHQs from the Tarifit Berber dialect — exploring pragmatic speech acts, illocutionary force, and emotional expression.</p>
        <Link to="/submit" className={s.ctaBtn}>+ Contribute an RHQ</Link>
      </header>

      <div className={s.filtersWrap}>
        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Function</span>
          <div className={s.filters}>
            {FUNCTIONS.map(f => (
              <button key={f} className={`${s.chip} ${fnFilter === f ? s.chipActive : ""}`} onClick={() => setFnFilter(f)}>
                {f}
                {f !== "All" && <span className={s.chipCount}>{rhqs.filter(r => r.function === f).length}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Act</span>
          <div className={s.filters}>
            {ACTS.map(a => (
              <button key={a} className={`${s.chip} ${actFilter === a ? s.chipActive : ""}`} onClick={() => setActFilter(a)}>
                {a}
                {a !== "All" && <span className={s.chipCount}>{rhqs.filter(r => r.act === a).length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.carouselWrap}>
        <button className={s.arrow} onClick={() => scroll(-1)}>‹</button>
        <div className={s.carousel} ref={scrollRef}>
          {loading ? (
            <div className={s.empty}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className={s.empty}>
              <p>No entries match this filter.</p>
              <Link to="/submit" className={s.ctaBtn} style={{marginTop:"1rem"}}>Add one →</Link>
            </div>
          ) : (
            filtered.map(rhq => (
              <RhqCard key={rhq.id} rhq={rhq} isActive={selected?.id === rhq.id} onClick={setSelected} />
            ))
          )}
        </div>
        <button className={s.arrow} onClick={() => scroll(1)}>›</button>
      </div>

      <div className={s.stats}>
        <span>{rhqs.length} approved entries</span>
        <span>·</span>
        <span>{[...new Set(rhqs.map(r => r.function).filter(Boolean))].length} pragmatic functions</span>
        <span>·</span>
        <span>Tarifit Berber corpus</span>
      </div>

      {selected && <DetailPanel rhq={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
