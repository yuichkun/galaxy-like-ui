export class ZoomPanManager {
  private scale: number = 100;
  private offset = { x: 0, y: 0 };
  private readonly minScale = 0;
  private readonly maxScale = 2000; // Increased max scale for more zoom range
  private readonly zoomSensitivity = 0.001;

  constructor(initialScale = 100) {
    this.scale = initialScale;
    this.centerView(window.innerWidth, window.innerHeight);
  }

  private centerView(width: number, height: number) {
    this.offset = {
      x: width / 2,
      y: height / 2,
    };
  }

  handleZoom(delta: number, mouseX: number, mouseY: number) {
    const oldScale = this.scale;
    this.scale = Math.max(
      this.minScale,
      Math.min(this.maxScale, this.scale * (1 - delta * this.zoomSensitivity))
    );

    // Adjust offset to zoom towards mouse position
    const scaleFactor = this.scale / oldScale;
    this.offset.x = mouseX - (mouseX - this.offset.x) * scaleFactor;
    this.offset.y = mouseY - (mouseY - this.offset.y) * scaleFactor;
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
