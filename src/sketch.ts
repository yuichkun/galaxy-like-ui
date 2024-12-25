import p5 from "p5";
import { generateSampleUsers } from "./userFactory";
import { Particle } from "./particle";
import { performPCA } from "./pca";
import { AVATAR_SIZE, distance, transformCoordinate } from "./visualConfig";
import { drawUserNode } from "./drawingUtils";
import { ZoomPanManager } from "./zoomPanManager";
import { updateUserInfo } from "./app";
import { User } from "./types";

// Initial data
let users = generateSampleUsers();
let reducedData = performPCA(users);
let sketchInstance: ReturnType<typeof initSketch> | null = null;

// Weight controls
let currentWeights = {
  skills: 1,
  scores: 1,
  companies: 1,
};

function setupWeightControls() {
  const controls = ["skills", "scores", "companies"] as const;
  controls.forEach((control) => {
    const slider = document.getElementById(
      `${control}-weight`
    ) as HTMLInputElement;
    const valueDisplay = slider.nextElementSibling as HTMLSpanElement;

    slider.addEventListener("input", (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      valueDisplay.textContent = value.toFixed(1);
      currentWeights[control] = value;

      // Recalculate PCA with new weights
      reducedData = performPCA(users, currentWeights);
      sketchInstance?.updatePoints();
    });
  });
}

export function updateData(newUsers: User[]) {
  users = newUsers;
  reducedData = performPCA(users, currentWeights);
  sketchInstance?.updatePoints();
  updateUserInfo(null); // Reset user info panel
}

function initSketch(p: p5) {
  // State
  let points: number[][] = reducedData.to2DArray();
  const particles: Particle[] = [];
  let avatarImages: Record<string, p5.Image> = {};
  let time = 0;
  let hoveredUserIndex: number | null = null;
  let lastShownUserIndex: number | null = null;
  let zoomPanManager: ZoomPanManager;

  // Update points when data changes
  const updatePoints = () => {
    // Clear existing state
    particles.length = 0;
    avatarImages = {};
    hoveredUserIndex = null;
    lastShownUserIndex = null;

    // Update with new data
    points = reducedData.to2DArray();
    zoomPanManager = new ZoomPanManager(p, points);
    loadAvatarImages();
  };

  // Utility functions
  const isMouseOverUser = (x: number, y: number): boolean => {
    const d = distance([p.mouseX, p.mouseY], [x, y]);
    return d < (AVATAR_SIZE / 2) * zoomPanManager.currentZoomLevel;
  };

  const transformX = (x: number) =>
    transformCoordinate(
      x,
      p,
      "width",
      zoomPanManager.currentZoomLevel,
      zoomPanManager.currentPanOffset.x
    );

  const transformY = (y: number) =>
    transformCoordinate(
      y,
      p,
      "height",
      zoomPanManager.currentZoomLevel,
      zoomPanManager.currentPanOffset.y
    );

  // Setup functions
  const loadAvatarImages = () => {
    users.forEach((user) => {
      if (!avatarImages[user.avatar]) {
        avatarImages[user.avatar] = p.loadImage(user.avatar);
      }
    });
  };

  // p5.js lifecycle methods
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    zoomPanManager = new ZoomPanManager(p, points);

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      zoomPanManager.handleWindowResize();
    };
    p.mouseWheel = (e: { deltaY: number }) =>
      zoomPanManager.handleMouseWheel(e as WheelEvent);
    p.mousePressed = () => zoomPanManager.handleMousePressed(hoveredUserIndex);
    p.mouseReleased = () => zoomPanManager.handleMouseReleased();
    p.mouseDragged = () => zoomPanManager.handleMouseDragged();

    p.cursor("grab");
    p.imageMode(p.CENTER);
    loadAvatarImages();
  };

  p.draw = () => {
    p.background(10, 15, 30);
    time += 0.01;
    p.cursor(zoomPanManager.isPanningActive ? "grabbing" : "grab");

    // Draw connections
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

    // Update particles
    points.forEach(([x, y]) => {
      const mappedX = transformX(x);
      const mappedY = transformY(y);
      if (p.frameCount % 6 === 0) {
        particles.push(new Particle(p, mappedX, mappedY));
      }
    });

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    // Track if any user is hovered this frame
    let userHovered = false;

    // Draw users
    points.forEach(([x, y], i) => {
      const mappedX = transformX(x);
      const mappedY = transformY(y);

      if (isMouseOverUser(mappedX, mappedY)) {
        hoveredUserIndex = i;
        userHovered = true;
        p.cursor("pointer");

        // Update user info if hovering over a different user
        if (lastShownUserIndex !== i) {
          lastShownUserIndex = i;
          updateUserInfo(users[i]);
        }
      }

      drawUserNode(
        p,
        mappedX,
        mappedY,
        users[i],
        i,
        time,
        zoomPanManager.currentZoomLevel,
        hoveredUserIndex,
        avatarImages
      );
    });

    // Reset hover state but keep the last shown user info
    hoveredUserIndex = userHovered ? hoveredUserIndex : null;
  };

  return { updatePoints };
}

export const sketch = (p: p5) => {
  sketchInstance = initSketch(p);
  setupWeightControls(); // Setup weight controls when sketch initializes
  return sketchInstance;
};
