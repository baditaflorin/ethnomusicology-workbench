import { BarChart3, FileMusic, ListMusic, Network, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

export type WorkbenchTab = "timeline" | "map" | "score" | "stats" | "engines";

const tabs: Array<{ id: WorkbenchTab; label: string; icon: ReactNode }> = [
  { id: "timeline", label: "Timeline", icon: <ListMusic size={17} /> },
  { id: "map", label: "Map", icon: <Network size={17} /> },
  { id: "score", label: "Score", icon: <FileMusic size={17} /> },
  { id: "stats", label: "Stats", icon: <BarChart3 size={17} /> },
  { id: "engines", label: "Engines", icon: <SlidersHorizontal size={17} /> }
];

export const TabNav = ({
  activeTab,
  onChange
}: {
  activeTab: WorkbenchTab;
  onChange: (tab: WorkbenchTab) => void;
}) => (
  <div className="tab-nav" role="tablist" aria-label="Workbench views">
    {tabs.map((tab) => (
      <button
        aria-selected={activeTab === tab.id}
        className={activeTab === tab.id ? "active" : ""}
        key={tab.id}
        onClick={() => onChange(tab.id)}
        role="tab"
        type="button"
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);
