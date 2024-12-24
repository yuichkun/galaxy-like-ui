import p5 from "p5";
import { PCA } from "ml-pca";
import { User } from "./types";
import { generateSampleUsers } from "./userFactory";
import { Particle } from "./particle";

// Generate sample users
const users = generateSampleUsers();

// Prepare skill and company keys
const skillKeys = ["typescript", "python", "java"]; // Extracted skill keys
const companyKeys = ["Google", "Meta", "Amazon"]; // Extracted company keys

// Function to generate user vectors
const generateVectors = (users: User[]) => {
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
};

// Perform PCA
const data = generateVectors(users);
const pca = new PCA(data);
const reducedData = pca.predict(data, { nComponents: 2 }); // Reduce to 2D

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

  const drawUserInfo = (user: User, x: number, y: number) => {
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
