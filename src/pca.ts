import { PCA } from "ml-pca";
import { User } from "./types";

const skillKeys = ["typescript", "python", "java"];
const companyKeys = ["Google", "Meta", "Amazon"];

export function generateVectors(users: User[]): number[][] {
  return users.map((user) => {
    const skillVector = skillKeys.map((key) => user.skills[key] || 0);
    const scoreVector = [
      user.scores.e_score,
      user.scores.i_score,
      user.scores.b_score,
    ];
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
