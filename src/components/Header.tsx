import { useQuery } from "@tanstack/react-query";
import { Github, Heart, RadioTower } from "lucide-react";
import { buildInfo } from "@/shared/buildInfo";
import { fetchLatestCommit } from "@/shared/github";

export const Header = () => {
  const latestCommit = useQuery({
    queryKey: ["latest-commit"],
    queryFn: fetchLatestCommit
  });

  const commit = latestCommit.data?.shortSha ?? buildInfo.buildCommit;
  const commitUrl =
    latestCommit.data?.url ?? `${buildInfo.repoUrl}/commit/${buildInfo.buildCommit}`;

  return (
    <header className="topbar">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <RadioTower size={24} />
        </div>
        <div>
          <p className="eyebrow">local-first research platform</p>
          <h1>Ethnomusicology Workbench</h1>
        </div>
      </div>
      <nav className="top-actions" aria-label="Project links">
        <a className="meta-pill" href={buildInfo.repoUrl} target="_blank" rel="noreferrer">
          <Github size={16} />
          Star on GitHub
        </a>
        <a
          className="meta-pill support"
          href={buildInfo.paypalUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Heart size={16} />
          Support
        </a>
        <a className="version-pill" href={commitUrl} target="_blank" rel="noreferrer">
          v{buildInfo.version} · {commit}
        </a>
      </nav>
    </header>
  );
};
