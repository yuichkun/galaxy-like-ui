import p5 from "p5";
import { generateSampleUsers } from "./userFactory";
import { Particle } from "./particle";
import { performPCA } from "./pca";
import { AVATAR_SIZE, distance, transformCoordinate } from "./visualConfig";
import { drawUserNode } from "./drawingUtils";
import { ZoomPanManager } from "./zoomPanManager";

// Generate sample users and prepare data
const users = generateSampleUsers();
const reducedData = performPCA(users);

export const sketch = (p: p5) => {
  // State
  const points: number[][] = reducedData.to2DArray();
  const particles: Particle[] = [];
  const avatarImages: Record<string, p5.Image> = {};
  let time = 0;
  let hoveredUserIndex: number | null = null;
  let zoomPanManager: ZoomPanManager;

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

    // Draw users
    points.forEach(([x, y], i) => {
      const mappedX = transformX(x);
      const mappedY = transformY(y);

      if (isMouseOverUser(mappedX, mappedY)) {
        hoveredUserIndex = i;
        p.cursor("pointer");
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

    hoveredUserIndex = null;
  };
};
