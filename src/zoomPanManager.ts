import p5 from "p5";
import { ZOOM_SENSITIVITY, MAX_ZOOM, AVATAR_SIZE } from "./visualConfig";

export class ZoomPanManager {
  private zoomLevel = 1;
  private MIN_ZOOM = 0.1;
  private isPanning = false;
  private panOffset = { x: 0, y: 0 };
  private lastMousePos = { x: 0, y: 0 };

  constructor(private p: p5, private points: number[][]) {
    this.calculateMinZoom();
    this.calculateCenter();
    this.zoomLevel = this.MIN_ZOOM;
  }

  private calculateMinZoom() {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    this.points.forEach(([x, y]) => {
      const mappedX = this.p.map(x, -2, 2, 100, this.p.width - 100);
      const mappedY = this.p.map(y, -2, 2, 100, this.p.height - 100);
      minX = Math.min(minX, mappedX);
      maxX = Math.max(maxX, mappedX);
      minY = Math.min(minY, mappedY);
      maxY = Math.max(maxY, mappedY);
    });

    const padding = AVATAR_SIZE * 2;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const xScale = this.p.width / contentWidth;
    const yScale = this.p.height / contentHeight;
    this.MIN_ZOOM = Math.min(xScale, yScale) * 0.6;
  }

  private calculateCenter() {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    this.points.forEach(([x, y]) => {
      const mappedX = this.p.map(x, -2, 2, 100, this.p.width - 100);
      const mappedY = this.p.map(y, -2, 2, 100, this.p.height - 100);
      minX = Math.min(minX, mappedX);
      maxX = Math.max(maxX, mappedX);
      minY = Math.min(minY, mappedY);
      maxY = Math.max(maxY, mappedY);
    });

    const padding = AVATAR_SIZE * 2;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.panOffset.x = this.p.width / 2 - centerX;
    this.panOffset.y = this.p.height / 2 - centerY;
  }

  handleMouseWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = -event.deltaY * ZOOM_SENSITIVITY;
    this.zoomLevel = this.p.constrain(
      this.zoomLevel + delta,
      this.MIN_ZOOM,
      MAX_ZOOM
    );
    return false;
  }

  handleMousePressed(hoveredUserIndex: number | null) {
    if (hoveredUserIndex === null) {
      this.isPanning = true;
      this.lastMousePos = { x: this.p.mouseX, y: this.p.mouseY };
    }
  }

  handleMouseReleased() {
    this.isPanning = false;
  }

  handleMouseDragged() {
    if (this.isPanning) {
      const dx = this.p.mouseX - this.lastMousePos.x;
      const dy = this.p.mouseY - this.lastMousePos.y;
      this.panOffset.x += dx;
      this.panOffset.y += dy;
      this.lastMousePos = { x: this.p.mouseX, y: this.p.mouseY };
    }
  }

  handleWindowResize() {
    this.calculateMinZoom();
    this.calculateCenter();
    this.zoomLevel = Math.max(this.zoomLevel, this.MIN_ZOOM);
  }

  get isPanningActive() {
    return this.isPanning;
  }

  get currentZoomLevel() {
    return this.zoomLevel;
  }

  get currentPanOffset() {
    return this.panOffset;
  }
}
