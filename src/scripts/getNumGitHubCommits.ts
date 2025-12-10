import { projects } from "../assets/projects.ts";

async function getNumGitHubCommits(
  username: string,
  repo: string,
): Promise<number> {
  const route = `https://api.github.com/repos/${username}/${repo}/commits?per_page=1&page=1`;
  const response = await fetch(route);

  const link = response.headers.get("link");
  if (!link) return 0;

  const lastPage = link.split(",")[1];
  const urlMatch = lastPage.match(/<([^>]+)>/);
  if (!urlMatch) return 0;

  const url = new URL(urlMatch[1]);
  const numCommits = url.searchParams.get("page");
  if (!numCommits) return 0;

  return parseInt(numCommits);
}

for (const project of projects) {
  const routeParts = project.github.split("/");
  const numCommits = await getNumGitHubCommits(routeParts[3], routeParts[4]);
  console.log(numCommits);
}
