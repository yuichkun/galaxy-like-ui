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

export async function loadCSV(file: File): Promise<ValidatedUser[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const processedData = results.data
            .filter((row) => !isEmptyRow(row))
            .map((row: any) => ({
              id: row.id || faker.string.uuid(),
              name: row.name || faker.internet.userName(),
              skills: processSkills(row),
              scores: processScores(row),
              companies: processCompanies(row.companies),
              avatar: row.avatar || faker.image.avatarGitHub(),
            }));

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
