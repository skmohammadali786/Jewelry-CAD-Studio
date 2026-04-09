import { useEffect, useState } from "react";
import { api, type Design } from "../lib/api";

interface Props {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDesigns().then(setDesigns).finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(designs.map((d) => d.category)));

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Welcome back to Amirul CAD Studio Admin</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{loading ? "—" : designs.length}</span>
          <span className="stat-label">Total Designs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{loading ? "—" : categories.length}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">Live</span>
          <span className="stat-label">Site Status</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">v2</span>
          <span className="stat-label">Admin Version</span>
        </div>
      </div>

      <div className="dash-actions">
        <div className="dash-card" onClick={() => onNavigate("designs")}>
          <div className="dash-card-icon">
            <DiamondIcon />
          </div>
          <div>
            <h3>Manage Designs</h3>
            <p>Add, edit or delete portfolio entries</p>
          </div>
          <span className="dash-arrow">›</span>
        </div>
        <div className="dash-card" onClick={() => onNavigate("content")}>
          <div className="dash-card-icon">
            <EditIcon />
          </div>
          <div>
            <h3>Edit Content</h3>
            <p>Update about section, contact details, hero text</p>
          </div>
          <span className="dash-arrow">›</span>
        </div>
      </div>

      <div className="recent-section">
        <h2 className="section-heading">Recent Designs</h2>
        <div className="design-list">
          {loading ? (
            <p className="loading-text">Loading designs…</p>
          ) : designs.slice(-4).reverse().map((d) => (
            <div key={d.id} className="design-row">
              <div className="design-row-img">
                {d.image ? (
                  <img src={d.image} alt={d.name} />
                ) : (
                  <div className="design-row-placeholder">
                    <DiamondIcon />
                  </div>
                )}
              </div>
              <div className="design-row-info">
                <span className="design-row-name">{d.name}</span>
                <span className="design-row-meta">{d.code} · {d.category}</span>
              </div>
              <button
                className="btn-ghost-sm"
                onClick={() => onNavigate(`designs/edit/${d.id}`)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiamondIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3h12l4 6-10 13L2 9z" />
      <path d="M2 9h20" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
