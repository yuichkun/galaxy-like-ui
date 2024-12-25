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

const CACHE_PREFIX = "github_avatar_";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  url: string;
  timestamp: number;
}

function getCachedAvatar(username: string): CacheEntry | null {
  const cached = localStorage.getItem(CACHE_PREFIX + username);
  return cached ? JSON.parse(cached) : null;
}

function setCachedAvatar(username: string, entry: CacheEntry) {
  localStorage.setItem(CACHE_PREFIX + username, JSON.stringify(entry));
}

async function getGitHubAvatarUrl(username: string): Promise<string> {
  const now = Date.now();
  const cached = getCachedAvatar(username);

  // Check cache
  if (cached && now - cached.timestamp < CACHE_EXPIRY) {
    return cached.url;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    const data = await response.json();

    // Update cache
    setCachedAvatar(username, {
      url: data.avatar_url,
      timestamp: now,
    });

    return data.avatar_url;
  } catch (error) {
    console.error(`Failed to fetch avatar for ${username}:`, error);
    const fallbackUrl = faker.image.avatarGitHub();

    // Cache the fallback URL too to avoid repeated failures
    setCachedAvatar(username, {
      url: fallbackUrl,
      timestamp: now,
    });

    return fallbackUrl;
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
