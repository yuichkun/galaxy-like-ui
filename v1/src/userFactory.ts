import { User } from "./types";
import { faker } from "@faker-js/faker";

export class UserFactory {
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

  private static generateAvatar(): string {
    return faker.image.avatarGitHub();
  }

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
    const id = faker.string.uuid();
    const base = this.createDefaultUser(id);

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

  private static createDefaultUser(id: string): User {
    return {
      id,
      name: faker.internet.username(),
      skills: {},
      scores: {
        e_score: 0.5,
        i_score: 0.5,
        b_score: 0.5,
      },
      companies: [],
      avatar: this.generateAvatar(),
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

// Example data generation
export const generateSampleUsers = () =>
  UserFactory.createClusters([
    {
      // TypeScript experts cluster
      count: 10,
      baseTemplate: {
        skills: { typescript: 5, javascript: 4 },
        scores: { e_score: 0.8, i_score: 0.7, b_score: 0.6 },
        companies: ["Google", "Microsoft"],
      },
      variance: 0.9,
    },
    {
      // Python data scientists cluster
      count: 10,
      baseTemplate: {
        skills: { python: 5 },
        scores: { e_score: 0.6, i_score: 0.9, b_score: 0.7 },
        companies: ["Meta", "Amazon"],
      },
      variance: 0.9,
    },
    {
      // Full-stack developers cluster
      count: 10,
      baseTemplate: {
        skills: { typescript: 4, python: 3, java: 3 },
        scores: { e_score: 0.7, i_score: 0.7, b_score: 0.8 },
        companies: ["Netflix", "Twitter"],
      },
      variance: 0.9,
    },
    {
      // Java enterprise developers cluster
      count: 8,
      baseTemplate: {
        skills: { java: 5, python: 2 },
        scores: { e_score: 0.5, i_score: 0.8, b_score: 0.9 },
        companies: ["Oracle", "IBM"],
      },
      variance: 0.8,
    },
    {
      // Mobile developers cluster
      count: 8,
      baseTemplate: {
        skills: { typescript: 4, java: 4 },
        scores: { e_score: 0.7, i_score: 0.6, b_score: 0.7 },
        companies: ["Apple", "Meta"],
      },
      variance: 0.85,
    },
    {
      // DevOps engineers cluster
      count: 7,
      baseTemplate: {
        skills: { python: 4, typescript: 3 },
        scores: { e_score: 0.6, i_score: 0.8, b_score: 0.9 },
        companies: ["Amazon", "Microsoft"],
      },
      variance: 0.8,
    },
  ]);
