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
  let zoomLevel = 1;
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;
  const ZOOM_SENSITIVITY = 0.001;

  // Pan state
  let isPanning = false;
  let panOffset = { x: 0, y: 0 };
  let lastMousePos = { x: 0, y: 0 };

  const distance = ([x1, y1]: number[], [x2, y2]: number[]) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const isMouseOverUser = (x: number, y: number): boolean => {
    const d = distance([p.mouseX, p.mouseY], [x, y]);
    return d < 15 * zoomLevel;
  };

  // Transform coordinates based on zoom and pan
  const transformX = (x: number) => {
    const centerX = p.width / 2;
    const mappedX = p.map(x, -2, 2, 100, p.width - 100);
    return centerX + (mappedX - centerX) * zoomLevel + panOffset.x;
  };

  const transformY = (y: number) => {
    const centerY = p.height / 2;
    const mappedY = p.map(y, -2, 2, 100, p.height - 100);
    return centerY + (mappedY - centerY) * zoomLevel + panOffset.y;
  };

  const handleMouseWheel = (event: WheelEvent) => {
    event.preventDefault();
    const delta = -event.deltaY * ZOOM_SENSITIVITY;
    zoomLevel = p.constrain(zoomLevel + delta, MIN_ZOOM, MAX_ZOOM);
    return false;
  };

  const handleMousePressed = () => {
    if (hoveredUserIndex === null) {
      isPanning = true;
      lastMousePos = { x: p.mouseX, y: p.mouseY };
    }
  };

  const handleMouseReleased = () => {
    isPanning = false;
  };

  const handleMouseDragged = () => {
    if (isPanning) {
      const dx = p.mouseX - lastMousePos.x;
      const dy = p.mouseY - lastMousePos.y;
      panOffset.x += dx;
      panOffset.y += dy;
      lastMousePos = { x: p.mouseX, y: p.mouseY };
    }
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

  const handleWindowResize = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.windowResized = handleWindowResize;
    p.mouseWheel = handleMouseWheel;
    // Add mouse event handlers
    p.mousePressed = handleMousePressed;
    p.mouseReleased = handleMouseReleased;
    p.mouseDragged = handleMouseDragged;
    // Set default cursor
    p.cursor("grab");
  };

  p.draw = () => {
    p.background(10, 15, 30);
    time += 0.01;

    // Reset cursor to default at the start of each frame
    p.cursor(isPanning ? "grabbing" : "grab");

    // Draw connections between points
    points.forEach((point1, i) => {
      points.forEach((point2, j) => {
        if (i < j) {
          const dist = distance(point1, point2);
          if (dist < 2) {
            const x1 = transformX(point1[0]);
            const y1 = transformY(point1[1]);
            const x2 = transformX(point2[0]);
            const y2 = transformY(point2[1]);
            const alpha = p.map(dist, 0, 2, 100, 0);
            p.stroke(100, 150, 255, alpha);
            p.line(x1, y1, x2, y2);
          }
        }
      });
    });

    // Add new particles
    points.forEach(([x, y]) => {
      const mappedX = transformX(x);
      const mappedY = transformY(y);
      if (p.frameCount % 6 === 0) {
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
      const mappedX = transformX(x);
      const mappedY = transformY(y);

      if (isMouseOverUser(mappedX, mappedY)) {
        hoveredUserIndex = i;
        // Change cursor to pointer when hovering over a user
        p.cursor("pointer");
      }

      // Orbital glow
      const glowSize = (30 + Math.sin(time + i) * 5) * zoomLevel;
      p.noStroke();
      for (let size = glowSize; size > 0; size -= 2 * zoomLevel) {
        const alpha = p.map(size, glowSize, 0, 0, 50);
        p.fill(100, 150, 255, alpha);
        p.ellipse(mappedX, mappedY, size, size);
      }

      // Core of the node
      p.fill(200, 220, 255);
      p.ellipse(mappedX, mappedY, 15 * zoomLevel, 15 * zoomLevel);

      // Label
      p.fill(255);
      p.textSize(12 * zoomLevel);
      p.text(`User ${i + 1}`, mappedX + 15 * zoomLevel, mappedY);

      // Draw hover info
      if (hoveredUserIndex === i) {
        drawUserInfo(users[i], mappedX, mappedY);
      }
    });

    // Reset hover state
    hoveredUserIndex = null;
  };
};
