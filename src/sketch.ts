import p5 from "p5";
import { generateSampleUsers } from "./userFactory";
import { Particle } from "./particle";
import { performPCA } from "./pca";
import { AVATAR_SIZE, distance, transformCoordinate } from "./visualConfig";
import { drawUserNode } from "./drawingUtils";
import { ZoomPanManager } from "./zoomPanManager";
import { updateUserInfo } from "./app";
import { User } from "./types";
import { DEFAULT_WEIGHTS, DEFAULT_CONNECTION_DISTANCE } from "./config";

// Initial data
let users = generateSampleUsers();
let reducedData = performPCA(users);
let sketchInstance: ReturnType<typeof initSketch> | null = null;

// Weight controls
let currentWeights: typeof DEFAULT_WEIGHTS = { ...DEFAULT_WEIGHTS };
let currentConnectionDistance = DEFAULT_CONNECTION_DISTANCE;

// Animation state
let isAnimating = false;
let animationTime = 0;

// LFO configurations
const LFO_CONFIG = {
  skills: {
    freqHz: 1 / 5,
    offset: 0,
  },
  scores: {
    freqHz: 1 / 7, // Slightly slower
    offset: Math.PI / 3, // 60 degrees offset
  },
  companies: {
    freqHz: 1 / 3, // Slightly faster
    offset: (Math.PI * 2) / 3, // 120 degrees offset
  },
};

function setupControls() {
  // Setup weight controls
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

  // Setup animation control
  const animateCheckbox = document.getElementById(
    "animate-weights"
  ) as HTMLInputElement;

  animateCheckbox.addEventListener("change", (e) => {
    isAnimating = (e.target as HTMLInputElement).checked;
    animationTime = 0; // Reset animation time when toggled
  });

  // Setup connection distance control
  const distanceSlider = document.getElementById(
    "connection-distance"
  ) as HTMLInputElement;
  const distanceDisplay = distanceSlider.nextElementSibling as HTMLSpanElement;

  distanceSlider.addEventListener("input", (e) => {
    const value = parseFloat((e.target as HTMLInputElement).value);
    distanceDisplay.textContent = value.toFixed(2);
    currentConnectionDistance = value;
  });
}

function updateAnimation() {
  if (!isAnimating) return;

  // Update animation time
  animationTime += (Math.PI * 2) / 60; // Base time increment (1 cycle/sec at 60fps)

  // Animate all weights
  const controls = ["skills", "scores", "companies"] as const;
  controls.forEach((control) => {
    const slider = document.getElementById(
      `${control}-weight`
    ) as HTMLInputElement;
    const display = slider.nextElementSibling as HTMLSpanElement;

    // Calculate value using control-specific frequency and offset
    const { freqHz, offset } = LFO_CONFIG[control];
    const newValue = 1 + Math.sin(animationTime * freqHz + offset) * 0.5;

    // Update slider and display
    slider.value = newValue.toString();
    display.textContent = newValue.toFixed(1);
    currentWeights[control] = newValue;
  });

  // Recalculate PCA with new weights
  reducedData = performPCA(users, currentWeights);
  sketchInstance?.updatePoints();
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
    zoomPanManager = new ZoomPanManager();
    loadAvatarImages();
  };

  // Utility functions
  const isMouseOverUser = (x: number, y: number): boolean => {
    const d = distance([p.mouseX, p.mouseY], [x, y]);
    return d < AVATAR_SIZE / 2;
  };

  const transformX = (x: number) => {
    const { scale, offset } = zoomPanManager.getTransform(p.millis());
    return transformCoordinate(x, p, "width", scale, offset.x);
  };

  const transformY = (y: number) => {
    const { scale, offset } = zoomPanManager.getTransform(p.millis());
    return transformCoordinate(y, p, "height", scale, offset.y);
  };

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
    zoomPanManager = new ZoomPanManager();

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
    p.mouseWheel = (event: WheelEvent) => {
      zoomPanManager.handleZoom(event.deltaY, p.mouseX, p.mouseY);
    };
    p.mousePressed = () => {
      if (hoveredUserIndex === null) {
        p.cursor("grabbing");
      } else {
        // Focus on the clicked user
        const point = points[hoveredUserIndex];
        const mappedX = transformX(point[0]);
        const mappedY = transformY(point[1]);
        zoomPanManager.focusOn(mappedX, mappedY, points, hoveredUserIndex);
      }
    };
    p.mouseReleased = () => {
      p.cursor("grab");
    };
    p.mouseDragged = () => {
      if (hoveredUserIndex === null) {
        zoomPanManager.handlePan(p.mouseX - p.pmouseX, p.mouseY - p.pmouseY);
      }
    };

    p.cursor("grab");
    p.imageMode(p.CENTER);
    loadAvatarImages();
  };

  p.draw = () => {
    p.background(255);
    time += 0.01;

    // Update animation if enabled
    updateAnimation();

    // Draw connections
    points.forEach((point1, i) => {
      points.forEach((point2, j) => {
        if (i < j) {
          const dist = distance(point1, point2);
          if (dist < currentConnectionDistance) {
            const x1 = transformX(point1[0]);
            const y1 = transformY(point1[1]);
            const x2 = transformX(point2[0]);
            const y2 = transformY(point2[1]);
            const alpha = p.map(dist, 0, currentConnectionDistance, 200, 100);
            p.stroke(0, 0, 0, alpha);

            // Calculate control points for Bézier curve
            const dx = x2 - x1;
            const dy = y2 - y1;
            const curveControlMidpoint = 0.02;
            const curveControlOffset = 0.02;
            const controlX1 =
              x1 + dx * curveControlMidpoint - dy * curveControlOffset;
            const controlY1 =
              y1 + dy * curveControlMidpoint + dx * curveControlOffset;
            const controlX2 =
              x2 - dx * curveControlMidpoint - dy * curveControlOffset;
            const controlY2 =
              y2 - dy * curveControlMidpoint + dx * curveControlOffset;

            // Draw Bézier curve instead of straight line
            p.noFill();
            p.bezier(
              x1,
              y1,
              controlX1,
              controlY1,
              controlX2,
              controlY2,
              x2,
              y2
            );
          }
        }
      });
    });

    // Update particles with new colors
    points.forEach(([x, y]) => {
      const mappedX = transformX(x);
      const mappedY = transformY(y);
      if (p.frameCount % 12 === 0) {
        // Reduced particle frequency
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

      const { scale } = zoomPanManager.getTransform();
      drawUserNode(
        p,
        mappedX,
        mappedY,
        users[i],
        i,
        time,
        scale,
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
  setupControls();
  return sketchInstance;
};
