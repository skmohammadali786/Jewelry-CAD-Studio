import { useState, useEffect, useRef } from "react";
import { api, type Design } from "../lib/api";

interface Props {
  editId?: string;
  onNavigate: (page: string) => void;
}

const EMPTY: Omit<Design, "id"> = {
  code: "",
  name: "",
  category: "Ring",
  material: "",
  style: "",
  description: "",
  image: "",
};

const CATEGORIES = ["Ring", "Necklace", "Earrings", "Bracelet", "Pendant", "Other"];

export default function DesignForm({ editId, onNavigate }: Props) {
  const [form, setForm] = useState<Omit<Design, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editId) return;
    api.getDesigns().then((designs) => {
      const d = designs.find((x) => x.id === editId);
      if (d) {
        const { id, ...rest } = d;
        setForm(rest);
        setImagePreview(rest.image);
      }
    });
  }, [editId]);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (key === "image") setImagePreview(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((prev) => ({ ...prev, image: dataUrl }));
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.updateDesign(editId, form);
      } else {
        await api.createDesign(form);
      }
      onNavigate("designs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{editId ? "Edit Design" : "Add New Design"}</h1>
          <p className="page-sub">Fill in the details for the portfolio entry</p>
        </div>
        <button className="btn-ghost" onClick={() => onNavigate("designs")}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="design-form">
        <div className="form-grid">
          {/* Left column */}
          <div className="form-col">
            <div className="form-section">
              <h2 className="form-section-title">Basic Info</h2>

              <div className="form-group">
                <label className="form-label">Design Code</label>
                <input
                  className="form-input"
                  placeholder="e.g. AJ-008"
                  value={form.code}
                  onChange={set("code")}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Design Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Celestial Solitaire Ring"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={set("category")}>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Style</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Contemporary Solitaire"
                    value={form.style}
                    onChange={set("style")}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Material</label>
                <input
                  className="form-input"
                  placeholder="e.g. 18K Gold / Platinum"
                  value={form.material}
                  onChange={set("material")}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Describe the design..."
                  value={form.description}
                  onChange={set("description")}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="form-col">
            <div className="form-section">
              <h2 className="form-section-title">Design Image</h2>

              <div className="img-mode-tabs">
                <button
                  type="button"
                  className={`img-mode-tab ${imageMode === "url" ? "active" : ""}`}
                  onClick={() => setImageMode("url")}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  className={`img-mode-tab ${imageMode === "upload" ? "active" : ""}`}
                  onClick={() => setImageMode("upload")}
                >
                  Upload File
                </button>
              </div>

              {imageMode === "url" ? (
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    className="form-input"
                    placeholder="https://... or /assets/images/AJ-008.jpg"
                    value={form.image}
                    onChange={set("image")}
                  />
                  <p className="form-hint">
                    Paste a public image URL, or use a path like /assets/images/AJ-008.jpg for uploaded files.
                  </p>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Upload Image</label>
                  <div
                    className="upload-zone"
                    onClick={() => fileRef.current?.click()}
                  >
                    <UploadIcon />
                    <p>Click to choose image</p>
                    <p className="upload-hint">JPG, PNG, WebP — max 5MB</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="img-preview-box">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <div className="img-preview-empty">
                    <span>Image preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-footer">
          <button type="button" className="btn-ghost" onClick={() => onNavigate("designs")}>
            Cancel
          </button>
          <button type="submit" className="btn-gold" disabled={saving}>
            {saving ? "Saving…" : editId ? "Update Design" : "Add Design"}
          </button>
        </div>
      </form>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
