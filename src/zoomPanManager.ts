export class ZoomPanManager {
  private scale: number = 1;
  private offset = { x: 0, y: 0 };
  private readonly minScale = 0.1;
  private readonly maxScale = 50;
  private readonly zoomSensitivity = 0.001;

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
