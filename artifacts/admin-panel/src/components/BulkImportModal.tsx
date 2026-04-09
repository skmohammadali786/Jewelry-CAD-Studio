import { useRef, useState } from "react";
import ExcelJS from "exceljs";
import { api, type Design } from "../lib/api";

interface Props {
  onClose: () => void;
  onImported: (designs: Design[]) => void;
}

type ParsedRow = Omit<Design, "id"> & { _valid: boolean; _errors: string[] };

const COLUMNS = ["code", "name", "category", "material", "style", "description", "image"] as const;
const REQUIRED = ["name"];
const CATEGORIES = ["Ring", "Necklace", "Earrings", "Bracelet", "Pendant", "Other"];

async function downloadTemplate() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Designs");

  ws.columns = COLUMNS.map((col) => ({
    header: col,
    key: col,
    width: col === "description" ? 40 : col === "name" ? 28 : 18,
  }));

  ws.addRow(["AJ-001", "Celestial Solitaire Ring", "Ring", "18K Gold / Platinum", "Contemporary Solitaire", "A beautiful solitaire ring design.", "/assets/images/AJ-001.jpg"]);
  ws.addRow(["AJ-002", "Eternal Bloom Necklace", "Necklace", "18K White Gold", "Floral Elegance", "A statement floral necklace.", "/assets/images/AJ-002.jpg"]);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "designs-template.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCellValue(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "richText" in v) {
    return (v as ExcelJS.CellRichTextValue).richText.map((r) => r.text).join("");
  }
  if (typeof v === "object" && "result" in v) {
    return String((v as ExcelJS.CellFormulaValue).result ?? "");
  }
  return String(v);
}

async function parseExcelFile(buffer: ArrayBuffer): Promise<Record<string, string>[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) return [];

  const headers: string[] = [];
  const rows: Record<string, string>[] = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        headers.push(parseCellValue(cell).toLowerCase().trim());
      });
    } else {
      const obj: Record<string, string> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        const header = headers[colNum - 1];
        if (header) obj[header] = parseCellValue(cell).trim();
      });
      if (Object.values(obj).some((v) => v !== "")) {
        rows.push(obj);
      }
    }
  });

  return rows;
}

function parseCsvFile(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
}

function parseRows(data: Record<string, string>[]): ParsedRow[] {
  return data.map((row) => {
    const errors: string[] = [];
    const get = (col: string) => (row[col] ?? row[col.charAt(0).toUpperCase() + col.slice(1)] ?? "").trim();

    const name = get("name");
    const category = get("category");

    if (!name) errors.push("Name is required");
    if (category && !CATEGORIES.includes(category)) errors.push(`Category must be one of: ${CATEGORIES.join(", ")}`);

    return {
      code: get("code"),
      name,
      category: CATEGORIES.includes(category) ? category : "Ring",
      material: get("material"),
      style: get("style"),
      description: get("description"),
      image: get("image"),
      _valid: errors.length === 0,
      _errors: errors,
    };
  });
}

export default function BulkImportModal({ onClose, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: Array<{ row: number; error: string }> } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRows(parseRows(parseCsvFile(text)));
      };
      reader.readAsText(file);
    } else {
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const data = await parseExcelFile(buffer);
        setRows(parseRows(data));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    const valid = rows.filter((r) => r._valid);
    if (valid.length === 0) return;
    setImporting(true);
    try {
      const res = await api.bulkImportDesigns(
        valid.map(({ _valid: _v, _errors: _e, ...rest }) => rest)
      );
      setResult({ imported: res.imported, errors: res.errors });
      onImported(res.designs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Import failed: ${message}`);
    } finally {
      setImporting(false);
    }
  };

  const validCount = rows.filter((r) => r._valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="bulk-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bulk-modal">
        <div className="bulk-modal-header">
          <div>
            <h2 className="bulk-modal-title">Bulk Import Designs</h2>
            <p className="bulk-modal-sub">Upload an Excel (.xlsx) or CSV file to add multiple designs at once</p>
          </div>
          <button className="bulk-close-btn" onClick={onClose}>✕</button>
        </div>

        {!result ? (
          <>
            <div className="bulk-template-row">
              <span className="bulk-template-label">Need the format?</span>
              <button className="btn-outline-sm" onClick={downloadTemplate}>
                ⬇ Download Template
              </button>
            </div>

            <div
              className={`bulk-dropzone ${dragOver ? "drag-active" : ""} ${rows.length > 0 ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              {rows.length === 0 ? (
                <>
                  <div className="bulk-dropzone-icon">📊</div>
                  <p className="bulk-dropzone-main">Drop your Excel or CSV file here</p>
                  <p className="bulk-dropzone-sub">or click to browse · .xlsx, .xls, .csv supported</p>
                </>
              ) : (
                <>
                  <div className="bulk-dropzone-icon">✅</div>
                  <p className="bulk-dropzone-main">{fileName}</p>
                  <p className="bulk-dropzone-sub">{rows.length} rows found · click to replace</p>
                </>
              )}
            </div>

            <div className="bulk-columns-ref">
              <span className="bulk-col-label">Required columns:</span>
              {COLUMNS.map((col) => (
                <span key={col} className={`bulk-col-tag ${REQUIRED.includes(col) ? "required" : ""}`}>
                  {col}{REQUIRED.includes(col) ? " *" : ""}
                </span>
              ))}
            </div>

            {rows.length > 0 && (
              <>
                <div className="bulk-preview-header">
                  <span className="bulk-preview-count">
                    Preview — <strong>{validCount} valid</strong>
                    {invalidCount > 0 && <span className="bulk-error-count"> · {invalidCount} with errors</span>}
                  </span>
                </div>
                <div className="bulk-table-wrap">
                  <table className="bulk-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        {COLUMNS.map((c) => <th key={c}>{c}</th>)}
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i} className={row._valid ? "" : "row-invalid"}>
                          <td className="bulk-row-num">{i + 1}</td>
                          {COLUMNS.map((col) => (
                            <td key={col} title={String(row[col])}>
                              {String(row[col]).length > 30
                                ? String(row[col]).slice(0, 30) + "…"
                                : String(row[col]) || <span className="bulk-empty">—</span>}
                            </td>
                          ))}
                          <td>
                            {row._valid
                              ? <span className="bulk-status-ok">✓ Ready</span>
                              : <span className="bulk-status-err" title={row._errors.join(", ")}>✗ {row._errors[0]}</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bulk-footer">
                  <button className="btn-outline-sm" onClick={onClose}>Cancel</button>
                  <button
                    className="btn-gold"
                    onClick={handleImport}
                    disabled={importing || validCount === 0}
                  >
                    {importing ? "Importing…" : `Import ${validCount} Design${validCount !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bulk-result">
            <div className={`bulk-result-icon ${result.imported > 0 ? "success" : "fail"}`}>
              {result.imported > 0 ? "🎉" : "⚠️"}
            </div>
            <h3 className="bulk-result-title">
              {result.imported > 0
                ? `${result.imported} design${result.imported !== 1 ? "s" : ""} imported successfully!`
                : "Import completed with issues"}
            </h3>
            {result.errors.length > 0 && (
              <div className="bulk-result-errors">
                <p className="bulk-result-err-label">{result.errors.length} row{result.errors.length !== 1 ? "s" : ""} failed:</p>
                {result.errors.map((e) => (
                  <p key={e.row} className="bulk-result-err-row">Row {e.row}: {e.error}</p>
                ))}
              </div>
            )}
            <div className="bulk-footer" style={{ justifyContent: "center", marginTop: "24px" }}>
              <button className="btn-gold" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
