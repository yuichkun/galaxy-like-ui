import p5 from "p5";
import { PCA } from "ml-pca";

// Sample user data
const users = [
  {
    skills: { typescript: 3, python: 2 },
    scores: { e_score: 0.8, i_score: 0.6, b_score: 0.4 },
    companies: ["Google", "Meta"],
  },
  {
    skills: { python: 2, typescript: 3 },
    scores: { e_score: 0.8, i_score: 0.6, b_score: 0.4 },
    companies: ["Amazon", "Google", "Meta"],
  },
  {
    skills: { typescript: 4, python: 1, java: 2 },
    scores: { e_score: 0.9, i_score: 0.8, b_score: 0.5 },
    companies: ["Google"],
  },
];

// Prepare skill and company keys
const skillKeys = ["typescript", "python", "java"]; // Extracted skill keys
const companyKeys = ["Google", "Meta", "Amazon"]; // Extracted company keys

// Function to generate user vectors
const generateVectors = (users: any) => {
  return users.map((user: any) => {
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
};

// Perform PCA
const data = generateVectors(users);
const pca = new PCA(data);
const reducedData = pca.predict(data, { nComponents: 2 }); // Reduce to 2D

export const sketch = (p: p5) => {
  const points: number[][] = reducedData.to2DArray();

  const distance = ([x1, y1]: number[], [x2, y2]: number[]) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };
  console.log(
    "Distance between User 1 and User 3:",
    distance(points[0], points[2])
  );
  console.log(
    "Distance between User 1 and User 2:",
    distance(points[0], points[1])
  );
  p.setup = () => {
    p.createCanvas(800, 800);
  };

  p.draw = () => {
    p.background(200);

    // Map points to canvas
    points.forEach(([x, y], i) => {
      const mappedX = p.map(x, -2, 2, 100, p.width - 100);
      const mappedY = p.map(y, -2, 2, 100, p.height - 100);

      // Draw circles for each user
      p.fill(100, 150, 255);
      p.ellipse(mappedX, mappedY, 20, 20);

      // Label the points
      p.fill(0);
      p.textSize(12);
      p.text(`User ${i + 1}`, mappedX + 10, mappedY);
    });
  };
};
