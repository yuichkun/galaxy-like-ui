import { PCA } from "ml-pca";
import { User } from "./types";

const MAX_SCORE = 5;

type FeatureWeights = {
  skills: number;
  scores: number;
  companies: number;
};

const DEFAULT_WEIGHTS: FeatureWeights = {
  skills: 1,
  scores: 1,
  companies: 1,
};

export function generateVectors(
  users: User[],
  weights: Partial<FeatureWeights> = {}
): number[][] {
  // Merge with default weights
  const finalWeights = { ...DEFAULT_WEIGHTS, ...weights };

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
      return maxValue > 0 ? (value / maxValue) * finalWeights.skills : 0;
    });

    // Scores vector (normalized 0-1)
    const scoreVector = [
      (user.scores.e_score / MAX_SCORE) * finalWeights.scores,
      (user.scores.i_score / MAX_SCORE) * finalWeights.scores,
      (user.scores.b_score / MAX_SCORE) * finalWeights.scores,
    ];

    // Company vector (binary)
    const companyVector = companyKeys.map((key) =>
      user.companies.includes(key) ? 1 * finalWeights.companies : 0
    );

    return [...skillVector, ...scoreVector, ...companyVector];
  });
}

export function performPCA(users: User[], weights?: Partial<FeatureWeights>) {
  const data = generateVectors(users, weights);
  const pca = new PCA(data);
  return pca.predict(data, { nComponents: 2 });
}
