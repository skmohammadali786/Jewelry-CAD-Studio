const ITEMS = [
  "Precision CAD Design",
  "Ring Design",
  "Necklace Design",
  "Earring Design",
  "Bracelet Design",
  "Stone Setting",
  "3D Modeling",
  "STL Export",
  "Production Ready Files",
  "Lost-Wax Casting",
  "Bespoke Collections",
  "48h Turnaround",
];

export function MarqueeStrip() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-gem">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
