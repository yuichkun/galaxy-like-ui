import p5 from "p5";
import { PCA } from "ml-pca";

type User = {
  skills: Record<string, number>;
  scores: {
    e_score: number;
    i_score: number;
    b_score: number;
  };
  companies: string[];
};

class UserFactory {
  private static readonly SKILL_LEVELS = [1, 2, 3, 4, 5];
  private static readonly ALL_SKILLS = [
    "typescript",
    "python",
    "java",
    "ruby",
    "go",
    "rust",
    "cpp",
  ];
  private static readonly ALL_COMPANIES = [
    "Google",
    "Meta",
    "Amazon",
    "Apple",
    "Microsoft",
    "Netflix",
    "Twitter",
  ];

  /**
   * Creates a cluster of users with similar characteristics
   * @param count Number of users to generate
   * @param baseTemplate Base characteristics to build variations from
   * @param variance How much the generated users can deviate from the base (0-1)
   */
  static createCluster(
    count: number,
    baseTemplate: Partial<User>,
    variance: number = 0.2
  ): User[] {
    return Array.from({ length: count }, () =>
      this.createVariation(baseTemplate, variance)
    );
  }

  /**
   * Creates multiple clusters with different characteristics
   * @param clustersConfig Array of cluster configurations
   */
  static createClusters(
    clustersConfig: Array<{
      count: number;
      baseTemplate: Partial<User>;
      variance?: number;
    }>
  ): User[] {
    return clustersConfig.flatMap(({ count, baseTemplate, variance }) =>
      this.createCluster(count, baseTemplate, variance)
    );
  }

  private static createVariation(
    baseTemplate: Partial<User>,
    variance: number
  ): User {
    const base = this.createDefaultUser();

    // Vary skills
    if (baseTemplate.skills) {
      const skills = { ...baseTemplate.skills };
      Object.keys(skills).forEach((skill) => {
        if (Math.random() < variance) {
          skills[skill] = this.varySkillLevel(skills[skill], variance);
        }
      });
      // Occasionally add a random skill
      if (Math.random() < variance) {
        const newSkill = this.getRandomSkill();
        if (!skills[newSkill]) {
          skills[newSkill] = this.getRandomSkillLevel();
        }
      }
      base.skills = skills;
    }

    // Vary scores
    if (baseTemplate.scores) {
      const scores = { ...baseTemplate.scores };
      Object.keys(scores).forEach((score) => {
        scores[score as keyof typeof scores] = this.varyScore(
          scores[score as keyof typeof scores],
          variance
        );
      });
      base.scores = scores;
    }

    // Vary companies
    if (baseTemplate.companies) {
      const companies = [...baseTemplate.companies];
      // Occasionally remove a company
      if (Math.random() < variance && companies.length > 1) {
        companies.splice(Math.floor(Math.random() * companies.length), 1);
      }
      // Occasionally add a company
      if (Math.random() < variance) {
        const newCompany = this.getRandomCompany();
        if (!companies.includes(newCompany)) {
          companies.push(newCompany);
        }
      }
      base.companies = companies;
    }

    return base;
  }

  private static createDefaultUser(): User {
    return {
      skills: {},
      scores: {
        e_score: 0.5,
        i_score: 0.5,
        b_score: 0.5,
      },
      companies: [],
    };
  }

  private static varySkillLevel(level: number, variance: number): number {
    const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    return Math.max(
      1,
      Math.min(5, level + variation * Math.ceil(5 * variance))
    );
  }

  private static varyScore(score: number, variance: number): number {
    const variation = (Math.random() - 0.5) * 2 * variance;
    return Math.max(0, Math.min(1, score + variation));
  }

  private static getRandomSkill(): string {
    return this.ALL_SKILLS[Math.floor(Math.random() * this.ALL_SKILLS.length)];
  }

  private static getRandomSkillLevel(): number {
    return this.SKILL_LEVELS[
      Math.floor(Math.random() * this.SKILL_LEVELS.length)
    ];
  }

  private static getRandomCompany(): string {
    return this.ALL_COMPANIES[
      Math.floor(Math.random() * this.ALL_COMPANIES.length)
    ];
  }
}

// Example usage:
const users = UserFactory.createClusters([
  {
    // TypeScript experts cluster
    count: 5,
    baseTemplate: {
      skills: { typescript: 5, javascript: 4 },
      scores: { e_score: 0.8, i_score: 0.7, b_score: 0.6 },
      companies: ["Google", "Microsoft"],
    },
    variance: 0.2,
  },
  {
    // Python data scientists cluster
    count: 5,
    baseTemplate: {
      skills: { python: 5, typescript: 2 },
      scores: { e_score: 0.6, i_score: 0.9, b_score: 0.7 },
      companies: ["Meta", "Amazon"],
    },
    variance: 0.2,
  },
  {
    // Full-stack developers cluster
    count: 5,
    baseTemplate: {
      skills: { typescript: 4, python: 3, java: 3 },
      scores: { e_score: 0.7, i_score: 0.7, b_score: 0.8 },
      companies: ["Netflix", "Twitter"],
    },
    variance: 0.2,
  },
]);

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

// Particle class for star effects
class Particle {
  private pos: p5.Vector;
  private vel: p5.Vector;
  private acc: p5.Vector;
  private alpha: number;
  private size: number;

  constructor(private p: p5, x: number, y: number) {
    this.pos = p.createVector(x, y);
    this.vel = p5.Vector.random2D().mult(p.random(0.2, 1));
    this.acc = p.createVector(0, 0);
    this.alpha = p.random(100, 200);
    this.size = p.random(1, 3);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.alpha -= 1;
  }

  isDead() {
    return this.alpha < 0;
  }

  draw() {
    this.p.noStroke();
    this.p.fill(255, 255, 255, this.alpha);
    this.p.ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

export const sketch = (p: p5) => {
  const points: number[][] = reducedData.to2DArray();
  const particles: Particle[] = [];
  let time = 0;
  let hoveredUserIndex: number | null = null;

  const distance = ([x1, y1]: number[], [x2, y2]: number[]) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const isMouseOverUser = (x: number, y: number): boolean => {
    const d = distance([p.mouseX, p.mouseY], [x, y]);
    return d < 15;
  };

  const drawUserInfo = (user: (typeof users)[0], x: number, y: number) => {
    p.push();

    // Calculate box dimensions
    const boxWidth = 200;
    const boxHeight = 80;

    // Adjust position to keep box within canvas bounds
    let boxX = x + 20;
    let boxY = y - boxHeight;

    // Keep box within horizontal bounds
    if (boxX + boxWidth > p.width) {
      boxX = x - boxWidth - 20;
    }

    // Keep box within vertical bounds
    if (boxY < 0) {
      boxY = y + 20;
    }

    p.fill(255);
    p.stroke(100, 150, 255);
    p.strokeWeight(1);
    p.rect(boxX, boxY, boxWidth, boxHeight);

    p.noStroke();
    p.fill(0);
    p.textSize(12);
    p.textAlign(p.LEFT);

    // Skills
    const skills = Object.entries(user.skills)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    p.text(`Skills: ${skills}`, boxX + 10, boxY + 20);

    // Scores
    const scores = Object.entries(user.scores)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    p.text(`Scores: ${scores}`, boxX + 10, boxY + 40);

    // Companies
    p.text(`Companies: ${user.companies.join(", ")}`, boxX + 10, boxY + 60);
    p.pop();
  };

  p.setup = () => {
    p.createCanvas(800, 800);
  };

  p.draw = () => {
    p.background(10, 15, 30);
    time += 0.01;

    // Draw connections between points
    points.forEach((point1, i) => {
      points.forEach((point2, j) => {
        if (i < j) {
          const dist = distance(point1, point2);
          if (dist < 2) {
            const x1 = p.map(point1[0], -2, 2, 100, p.width - 100);
            const y1 = p.map(point1[1], -2, 2, 100, p.height - 100);
            const x2 = p.map(point2[0], -2, 2, 100, p.width - 100);
            const y2 = p.map(point2[1], -2, 2, 100, p.height - 100);
            const alpha = p.map(dist, 0, 2, 100, 0);
            p.stroke(100, 150, 255, alpha);
            p.line(x1, y1, x2, y2);
          }
        }
      });
    });

    // Add new particles
    points.forEach(([x, y]) => {
      const mappedX = p.map(x, -2, 2, 100, p.width - 100);
      const mappedY = p.map(y, -2, 2, 100, p.height - 100);
      if (p.frameCount % 2 === 0) {
        particles.push(new Particle(p, mappedX, mappedY));
      }
    });

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    // Draw user nodes with orbital effect
    points.forEach(([x, y], i) => {
      const mappedX = p.map(x, -2, 2, 100, p.width - 100);
      const mappedY = p.map(y, -2, 2, 100, p.height - 100);

      if (isMouseOverUser(mappedX, mappedY)) {
        hoveredUserIndex = i;
      }

      // Orbital glow
      const glowSize = 30 + Math.sin(time + i) * 5;
      p.noStroke();
      for (let size = glowSize; size > 0; size -= 2) {
        const alpha = p.map(size, glowSize, 0, 0, 50);
        p.fill(100, 150, 255, alpha);
        p.ellipse(mappedX, mappedY, size, size);
      }

      // Core of the node
      p.fill(200, 220, 255);
      p.ellipse(mappedX, mappedY, 15, 15);

      // Label
      p.fill(255);
      p.textSize(12);
      p.text(`User ${i + 1}`, mappedX + 15, mappedY);

      // Draw hover info
      if (hoveredUserIndex === i) {
        drawUserInfo(users[i], mappedX, mappedY);
      }
    });

    // Reset hover state
    hoveredUserIndex = null;
  };
};
