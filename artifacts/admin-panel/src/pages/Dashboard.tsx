import { useEffect, useState } from "react";
import { api, type Design } from "../lib/api";

interface Props {
  onNavigate: (page: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Ring: "#C9A84C",
  Necklace: "#a78bfa",
  Earrings: "#34d399",
  Bracelet: "#60a5fa",
  Pendant: "#f87171",
  Other: "#94a3b8",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

export default function Dashboard({ onNavigate }: Props) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    api.getDesigns()
      .then((d) => { setDesigns(d); setApiOnline(true); })
      .catch(() => setApiOnline(false))
      .finally(() => setLoading(false));
  }, []);

  const categoryMap: Record<string, number> = {};
  designs.forEach((d) => {
    categoryMap[d.category] = (categoryMap[d.category] || 0) + 1;
  });
  const sortedCats = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...sortedCats.map(([, c]) => c), 1);
  const recent = [...designs].slice(-5).reverse();

  const stats = [
    {
      label: "Total Designs",
      value: loading ? "—" : designs.length,
      icon: <DiamondIcon />,
      color: "#C9A84C",
      sub: "in portfolio",
    },
    {
      label: "Categories",
      value: loading ? "—" : sortedCats.length,
      icon: <GridIcon />,
      color: "#a78bfa",
      sub: "design types",
    },
    {
      label: "API Status",
      value: apiOnline === null ? "—" : apiOnline ? "Online" : "Offline",
      icon: <PulseIcon active={apiOnline === true} />,
      color: apiOnline === false ? "#f87171" : "#34d399",
      sub: apiOnline === false ? "check connection" : "all systems go",
    },
    {
      label: "Portfolio",
      value: "Live",
      icon: <GlobeIcon />,
      color: "#60a5fa",
      sub: "vercel.app",
    },
  ];

  return (
    <div className="dash-root">

      {/* ── Welcome Banner ─────────────────────── */}
      <div className="dash-banner">
        <div className="dash-banner-glow" />
        <div className="dash-banner-inner">
          <div>
            <p className="dash-greeting">{getGreeting()}, Amirul 👋</p>
            <h1 className="dash-banner-title">CAD Studio Dashboard</h1>
            <p className="dash-banner-date">{formatDate()}</p>
          </div>
          <div className="dash-banner-actions">
            <button className="dash-banner-btn-gold" onClick={() => onNavigate("designs/new")}>
              <PlusIcon /> New Design
            </button>
            <a
              href="https://amirul-jewelery-cad-studio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="dash-banner-btn-outline"
            >
              <ExternalIcon /> View Site
            </a>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────── */}
      <div className="dash-stats">
        {stats.map((s) => (
          <div className="dash-stat" key={s.label} style={{ "--stat-color": s.color } as React.CSSProperties}>
            <div className="dash-stat-icon" style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}33` }}>
              {s.icon}
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-value">{s.value}</span>
              <span className="dash-stat-label">{s.label}</span>
              <span className="dash-stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle Row ─────────────────────────── */}
      <div className="dash-mid">

        {/* Category Breakdown */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <span className="dash-panel-title">Category Breakdown</span>
            <button className="dash-panel-link" onClick={() => onNavigate("designs")}>
              View all →
            </button>
          </div>
          {loading ? (
            <div className="dash-skeleton-wrap">
              {[1, 2, 3, 4].map((i) => <div key={i} className="dash-skeleton" />)}
            </div>
          ) : sortedCats.length === 0 ? (
            <p className="dash-empty">No designs yet. Add your first one.</p>
          ) : (
            <div className="dash-cats">
              {sortedCats.map(([cat, count]) => {
                const color = CATEGORY_COLORS[cat] || "#94a3b8";
                const pct = Math.round((count / maxCat) * 100);
                return (
                  <div className="dash-cat-row" key={cat}>
                    <div className="dash-cat-info">
                      <span className="dash-cat-dot" style={{ background: color }} />
                      <span className="dash-cat-name">{cat}</span>
                      <span className="dash-cat-count">{count}</span>
                    </div>
                    <div className="dash-cat-bar-track">
                      <div
                        className="dash-cat-bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="dash-cat-pct" style={{ color }}>
                      {Math.round((count / designs.length) * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dash-panel">
          <div className="dash-panel-header">
            <span className="dash-panel-title">Quick Actions</span>
          </div>
          <div className="dash-actions-list">
            <button className="dash-action-card dash-action-gold" onClick={() => onNavigate("designs/new")}>
              <div className="dash-action-icon"><PlusIcon /></div>
              <div className="dash-action-text">
                <strong>Add New Design</strong>
                <span>Upload a new CAD design to the portfolio</span>
              </div>
              <ArrowIcon />
            </button>
            <button className="dash-action-card" onClick={() => onNavigate("designs")}>
              <div className="dash-action-icon" style={{ color: "#a78bfa", background: "#a78bfa18", border: "1px solid #a78bfa33" }}><DiamondIcon /></div>
              <div className="dash-action-text">
                <strong>Manage Designs</strong>
                <span>Edit, reorder or delete portfolio entries</span>
              </div>
              <ArrowIcon />
            </button>
            <button className="dash-action-card" onClick={() => onNavigate("content")}>
              <div className="dash-action-icon" style={{ color: "#60a5fa", background: "#60a5fa18", border: "1px solid #60a5fa33" }}><EditIcon /></div>
              <div className="dash-action-text">
                <strong>Edit Site Content</strong>
                <span>Update about, hero text and contact details</span>
              </div>
              <ArrowIcon />
            </button>
            <a
              href="https://amirul-jewelery-cad-studio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="dash-action-card"
            >
              <div className="dash-action-icon" style={{ color: "#34d399", background: "#34d39918", border: "1px solid #34d39933" }}><GlobeIcon /></div>
              <div className="dash-action-text">
                <strong>View Live Website</strong>
                <span>Open the public portfolio in a new tab</span>
              </div>
              <ArrowIcon />
            </a>
          </div>
        </div>
      </div>

      {/* ── Recent Designs ─────────────────────── */}
      <div className="dash-panel dash-recent">
        <div className="dash-panel-header">
          <span className="dash-panel-title">Recent Designs</span>
          <button className="dash-panel-link" onClick={() => onNavigate("designs")}>
            See all {designs.length} →
          </button>
        </div>
        {loading ? (
          <div className="dash-skeleton-wrap">
            {[1, 2, 3].map((i) => <div key={i} className="dash-skeleton dash-skeleton-row" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="dash-empty-state">
            <div className="dash-empty-icon"><DiamondIcon /></div>
            <p className="dash-empty-title">No designs yet</p>
            <p className="dash-empty-sub">Add your first design to get started</p>
            <button className="btn-gold" onClick={() => onNavigate("designs/new")}>+ Add Design</button>
          </div>
        ) : (
          <div className="dash-recent-grid">
            {recent.map((d) => {
              const color = CATEGORY_COLORS[d.category] || "#94a3b8";
              return (
                <div className="dash-recent-card" key={d.id}>
                  <div className="dash-recent-img">
                    {d.image ? (
                      <img src={d.image} alt={d.name} />
                    ) : (
                      <div className="dash-recent-no-img" style={{ color: `${color}66` }}>
                        <DiamondIcon />
                      </div>
                    )}
                    <span className="dash-recent-cat" style={{ color, borderColor: `${color}55`, background: `${color}18` }}>
                      {d.category}
                    </span>
                  </div>
                  <div className="dash-recent-info">
                    <span className="dash-recent-code" style={{ color }}>{d.code}</span>
                    <span className="dash-recent-name">{d.name}</span>
                    <span className="dash-recent-mat">{d.material}</span>
                  </div>
                  <button
                    className="dash-recent-edit"
                    onClick={() => onNavigate(`designs/edit/${d.id}`)}
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

function DiamondIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /></svg>;
}
function EditIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
}
function GridIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function GlobeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function ExternalIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}
function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
}
function PulseIcon({ active }: { active: boolean }) {
  return (
    <span className={`dash-pulse-dot ${active ? "dash-pulse-online" : "dash-pulse-offline"}`} />
  );
}
