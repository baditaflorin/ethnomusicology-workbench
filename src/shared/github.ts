import { z } from "zod";

const latestCommitSchema = z.object({
  sha: z.string(),
  html_url: z.string().url(),
  commit: z.object({
    message: z.string(),
    committer: z.object({
      date: z.string()
    })
  })
});

export type LatestCommit = {
  sha: string;
  shortSha: string;
  url: string;
  date: string;
  message: string;
};

export const fetchLatestCommit = async (): Promise<LatestCommit> => {
  const response = await fetch(
    "https://api.github.com/repos/baditaflorin/ethnomusicology-workbench/commits/main",
    {
      headers: {
        Accept: "application/vnd.github+json"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub commit fetch failed with ${response.status}`);
  }

  const parsed = latestCommitSchema.parse(await response.json());
  return {
    sha: parsed.sha,
    shortSha: parsed.sha.slice(0, 7),
    url: parsed.html_url,
    date: parsed.commit.committer.date,
    message: parsed.commit.message.split("\n")[0] ?? parsed.commit.message
  };
};
