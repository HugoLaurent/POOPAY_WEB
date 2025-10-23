import { useState, useMemo, useEffect, useRef } from "react";
import categories from "../assets/data/category.json";
import departments from "../assets/data/departement.json";

const mapDepartments = (raw) => {
  const arr = Array.isArray(raw) ? raw : raw?.items || [];
  return arr.map((d) => ({
    key: String(d.code ?? d.id ?? d.value ?? ""),
    label: `${d.nom ?? d.name ?? d.label ?? d.code}`,
  }));
};

const mapCategories = (raw) => {
  const arr = Array.isArray(raw) ? raw : raw?.items || [];
  return arr.map((c) => ({
    key: String(c.id ?? c.code ?? c.value ?? ""),
    label: c.name ?? c.label ?? c.title ?? String(c.id),
  }));
};

export default function ChipsFilter({
  initialMode = "region",
  initialSelected = "",
  defaultKeys = { region: "", category: "" },
  onChange,
}) {
  const [mode, setMode] = useState(initialMode);
  const [selectedByMode, setSelectedByMode] = useState(() => ({
    region:
      initialMode === "region"
        ? initialSelected || defaultKeys.region || ""
        : defaultKeys.region || "",
    category:
      initialMode === "category"
        ? initialSelected || defaultKeys.category || ""
        : defaultKeys.category || "",
  }));
  const selected = selectedByMode[mode];

  // Si defaults arrivent plus tard
  useEffect(() => {
    setSelectedByMode((prev) => ({
      region: prev.region || defaultKeys.region || "",
      category: prev.category || defaultKeys.category || "",
    }));
  }, [defaultKeys.region, defaultKeys.category]);

  const chipsByMode = useMemo(
    () => ({
      region: [...mapDepartments(departments), { key: "", label: "Toutes" }],
      category: [...mapCategories(categories), { key: "", label: "Toutes" }],
    }),
    []
  );

  // Émission stable au parent
  useEffect(() => {
    onChange?.(mode, selected);
  }, [mode, selected, onChange]);

  const containerRef = useRef(null);
  const selectedRef = useRef(null);

  // Auto-scroll vers la chip active (ne change pas l’ordre)
  useEffect(() => {
    if (selectedRef.current && containerRef.current) {
      try {
        selectedRef.current.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      } catch {}
    }
  }, [mode, selected]);

  const chips = chipsByMode[mode] || [];

  return (
    <div className="px-4 mt-3">
      {/* Sélecteur de mode */}
      <div className="flex justify-center gap-3">
        {[
          { value: "region", label: "Par région" },
          { value: "category", label: "Par catégorie" },
        ].map((opt) => {
          const active = mode === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold transition border",
                active
                  ? "bg-[#8B4513] text-white border-[#8B4513]"
                  : "bg-[rgba(139,69,19,0.06)] text-[rgb(90,62,40)] border-[rgba(139,69,19,0.15)] hover:bg-[rgba(139,69,19,0.12)]",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Liste des chips */}
      <div
        ref={containerRef}
        className="mt-3 flex overflow-x-auto gap-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {chips.map((c) => {
          const active = selected === c.key;
          return (
            <button
              key={`${mode}-${c.key}-${c.label}`}
              ref={active ? selectedRef : null}
              onClick={() =>
                setSelectedByMode((prev) => ({
                  ...prev,
                  [mode]: prev[mode] === c.key ? "" : c.key,
                }))
              }
              className={[
                "shrink-0 px-3 py-2 rounded-2xl text-sm border transition",
                active
                  ? "bg-poopay-card border-[rgba(139,69,19,0.22)] font-semibold"
                  : "bg-transparent border-[rgba(139,69,19,0.10)]",
              ].join(" ")}
              title={c.label}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
