export function parseCommitCountFromLinkHeader(
  link: string | null,
): number | null {
  if (!link) return null;

  const lastLink = link
    .split(",")
    .map((part) => part.trim())
    .find((part) => /rel="last"/.test(part));
  if (!lastLink) return null;

  const urlMatch = lastLink.match(/<([^>]+)>/);
  if (!urlMatch) return null;

  let url: URL;
  try {
    url = new URL(urlMatch[1]);
  } catch {
    return null;
  }

  const page = url.searchParams.get("page");
  if (!page) return null;

  const numCommits = Number(page);
  if (!Number.isInteger(numCommits) || numCommits < 0) return null;

  return numCommits;
}

export async function getNumGitHubCommits(
  username: string,
  repo: string,
): Promise<number> {
  const route = `https://api.github.com/repos/${username}/${repo}/commits?per_page=1&page=1`;
  const response = await fetch(route);

  const link = response.headers.get("link");
  const numCommits = parseCommitCountFromLinkHeader(link);

  if (numCommits === null) {
    console.warn(
      `Could not determine commit count for ${username}/${repo}: unparseable GitHub Link header (${link ?? "missing"}). Node size for this project will default to 0.`,
    );
    return 0;
  }

  return numCommits;
}

export async function getNumGitHubCommitsFromURL(url: string): Promise<number> {
  const routeParts = url.split("/");
  return await getNumGitHubCommits(routeParts[3], routeParts[4]);
}
