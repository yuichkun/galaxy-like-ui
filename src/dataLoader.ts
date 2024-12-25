import Papa from "papaparse";
import { validateUsers, ValidatedUser } from "./schema";
import { faker } from "@faker-js/faker";

function processSkills(row: Record<string, string>): Record<string, number> {
  const skills: Record<string, number> = {};
  Object.entries(row).forEach(([key, value]) => {
    if (key.startsWith("skill_")) {
      const skillName = key.replace("skill_", "");
      skills[skillName] = Number(value);
    }
  });
  return skills;
}

function processScores(row: Record<string, string>) {
  return {
    e_score: Number(row.e_score),
    i_score: Number(row.i_score),
    b_score: Number(row.b_score),
  };
}

function processCompanies(companiesStr: string): string[] {
  return companiesStr
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function isEmptyRow(row: unknown): boolean {
  if (typeof row !== "object" || !row) return true;
  return Object.values(row as Record<string, unknown>).every((value) => !value);
}

async function getGitHubAvatarUrl(username: string): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.avatar_url;
  } catch (error) {
    console.error(`Failed to fetch avatar for ${username}:`, error);
    return faker.image.avatarGitHub(); // Fallback to faker if GitHub API fails
  }
}

export async function loadCSV(file: File): Promise<ValidatedUser[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const rows = results.data.filter((row) => !isEmptyRow(row));

          // Process all GitHub API requests in parallel
          const processedData = await Promise.all(
            rows.map(async (row: any) => {
              const avatarUrl = row.github_identifier
                ? await getGitHubAvatarUrl(row.github_identifier)
                : faker.image.avatarGitHub();

              return {
                id: row.id || faker.string.uuid(),
                name: row.name || faker.internet.userName(),
                skills: processSkills(row),
                scores: processScores(row),
                companies: processCompanies(row.companies),
                avatar: avatarUrl,
              };
            })
          );

          const validatedData = validateUsers(processedData);
          resolve(validatedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
