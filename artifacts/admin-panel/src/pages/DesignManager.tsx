import { useEffect, useState } from "react";
import { api, type Design } from "../lib/api";

interface Props {
  onNavigate: (page: string) => void;
}

const CATEGORIES = ["Ring", "Necklace", "Earrings", "Bracelet", "Pendant", "Other"];

export default function DesignManager({ onNavigate }: Props) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const load = () => {
    setLoading(true);
    api.getDesigns().then(setDesigns).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.deleteDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Failed to delete design.");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filter === "All" ? designs : designs.filter((d) => d.category === filter);
  const categories = ["All", ...CATEGORIES];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Designs</h1>
          <p className="page-sub">{designs.length} design{designs.length !== 1 ? "s" : ""} in portfolio</p>
        </div>
        <button className="btn-gold" onClick={() => onNavigate("designs/new")}>
          + Add Design
        </button>
      </div>

      {/* Filter pills */}
      <div className="filter-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">Loading designs…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No designs found. Add your first design!</p>
          <button className="btn-gold" onClick={() => onNavigate("designs/new")}>
            + Add Design
          </button>
        </div>
      ) : (
        <div className="designs-grid">
          {filtered.map((design) => (
            <div key={design.id} className="design-card">
              <div className="design-card-img">
                {design.image ? (
                  <img src={design.image} alt={design.name} loading="lazy" />
                ) : (
                  <div className="design-card-no-img">No Image</div>
                )}
                <span className="design-card-cat">{design.category}</span>
              </div>
              <div className="design-card-body">
                <p className="design-card-code">{design.code}</p>
                <h3 className="design-card-name">{design.name}</h3>
                <p className="design-card-meta">{design.material}</p>
                <div className="design-card-actions">
                  <button
                    className="btn-outline-sm"
                    onClick={() => onNavigate(`designs/edit/${design.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger-sm"
                    disabled={deleting === design.id}
                    onClick={() => handleDelete(design.id, design.name)}
                  >
                    {deleting === design.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
