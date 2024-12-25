export class ZoomPanManager {
  private scale: number = 1;
  private offset = { x: 0, y: 0 };
  private readonly minScale = 0.1;
  private readonly maxScale = 200;
  private readonly zoomSensitivity = 0.001;
  private readonly focusZoomLevel = 10; // Comfortable zoom level when focusing

  constructor(initialScale = 1) {
    this.scale = initialScale;
    this.centerView(window.innerWidth, window.innerHeight);
  }

  private centerView(width: number, height: number) {
    this.offset = {
      x: width / 2,
      y: height / 2,
    };
  }

  focusOn(x: number, y: number) {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    // First adjust the zoom level
    const oldScale = this.scale;
    this.scale = this.focusZoomLevel;

    // Calculate the point's new position after zoom
    const zoomFactor = this.scale / oldScale;
    const newX = (x - this.offset.x) * zoomFactor + this.offset.x;
    const newY = (y - this.offset.y) * zoomFactor + this.offset.y;

    // Then center on the point's new position
    const dx = screenCenterX - newX;
    const dy = screenCenterY - newY;
    this.offset.x += dx;
    this.offset.y += dy;
  }

  handleZoom(delta: number, mouseX: number, mouseY: number) {
    const zoomFactor = 1 - delta * this.zoomSensitivity;
    const newScale = Math.max(
      this.minScale,
      Math.min(this.maxScale, this.scale * zoomFactor)
    );

    const dx = (mouseX - this.offset.x) * (1 - newScale / this.scale);
    const dy = (mouseY - this.offset.y) * (1 - newScale / this.scale);

    this.scale = newScale;
    this.offset.x += dx;
    this.offset.y += dy;
  }

  handlePan(deltaX: number, deltaY: number) {
    this.offset.x += deltaX;
    this.offset.y += deltaY;
  }

  getTransform() {
    return {
      scale: this.scale,
      offset: this.offset,
    };
  }
}
