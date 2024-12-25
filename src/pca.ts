import { PCA } from "ml-pca";
import { User } from "./types";

const MAX_SCORE = 5;

export function generateVectors(users: User[]): number[][] {
  // Get all unique skill names and their max values
  const allSkills = new Set<string>();
  const skillMaxValues: Record<string, number> = {};

  users.forEach((user) => {
    Object.entries(user.skills).forEach(([skill, value]) => {
      allSkills.add(skill);
      skillMaxValues[skill] = Math.max(value, skillMaxValues[skill] || 0);
    });
  });
  const skillKeys = Array.from(allSkills);

  // Get all unique companies
  const allCompanies = new Set<string>();
  users.forEach((user) => {
    user.companies.forEach((company) => allCompanies.add(company));
  });
  const companyKeys = Array.from(allCompanies);

  // Generate vectors
  return users.map((user) => {
    // Skills vector (normalized 0-1)
    const skillVector = skillKeys.map((key) => {
      const value = user.skills[key] || 0;
      const maxValue = skillMaxValues[key];
      return maxValue > 0 ? value / maxValue : 0;
    });

    // Scores vector (normalized 0-1)
    const scoreVector = [
      user.scores.e_score / MAX_SCORE,
      user.scores.i_score / MAX_SCORE,
      user.scores.b_score / MAX_SCORE,
    ];

    // Company vector (binary)
    const companyVector = companyKeys.map((key) =>
      user.companies.includes(key) ? 1 : 0
    );

    return [...skillVector, ...scoreVector, ...companyVector];
  });
}

export function performPCA(users: User[]) {
  const data = generateVectors(users);
  const pca = new PCA(data);
  return pca.predict(data, { nComponents: 2 });
}
