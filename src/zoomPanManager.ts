export class ZoomPanManager {
  private scale: number = 1;
  private offset = { x: 0, y: 0 };
  private readonly minScale = 0.1;
  private readonly maxScale = 200;
  private readonly zoomSensitivity = 0.001;
  private readonly animationDuration = 400; // ms

  // Animation state
  private isAnimating = false;
  private animationStartTime = 0;
  private startScale = 1;
  private targetScale = 1;
  private startOffset = { x: 0, y: 0 };
  private targetOffset = { x: 0, y: 0 };

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

  focusOn(x: number, y: number, points: number[][], focusIndex: number) {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    // Find distance to nearest neighbor
    let minDistance = Infinity;
    const focusPoint = points[focusIndex];
    points.forEach((point, i) => {
      if (i !== focusIndex) {
        const dx = point[0] - focusPoint[0];
        const dy = point[1] - focusPoint[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        minDistance = Math.min(minDistance, dist);
      }
    });

    // Calculate zoom level that would put the nearest neighbor at the edge
    // We want the nearest neighbor to be visible at about 80% of the screen radius
    const screenRadius = Math.min(window.innerWidth, window.innerHeight) / 2;
    const targetScale =
      (screenRadius * 0.8) / ((minDistance * screenRadius) / 2);

    // Calculate target scale and offset
    this.startScale = this.scale;
    this.targetScale = Math.min(this.maxScale, targetScale);

    // Calculate the point's new position after zoom
    const zoomFactor = this.targetScale / this.startScale;
    const newX = (x - this.offset.x) * zoomFactor + this.offset.x;
    const newY = (y - this.offset.y) * zoomFactor + this.offset.y;

    // Calculate target offset to center on the point
    const dx = screenCenterX - newX;
    const dy = screenCenterY - newY;

    this.startOffset = { ...this.offset };
    this.targetOffset = {
      x: this.offset.x + dx,
      y: this.offset.y + dy,
    };

    // Start animation
    this.isAnimating = true;
    this.animationStartTime = performance.now();
  }

  private updateAnimation(currentTime: number) {
    if (!this.isAnimating) return;

    const elapsed = currentTime - this.animationStartTime;
    const progress = Math.min(elapsed / this.animationDuration, 1);

    // Ease-out function: 1 - (1 - progress)^2
    const eased = 1 - Math.pow(1 - progress, 2);

    // Interpolate with ease-out
    this.scale = this.startScale + (this.targetScale - this.startScale) * eased;
    this.offset = {
      x:
        this.startOffset.x + (this.targetOffset.x - this.startOffset.x) * eased,
      y:
        this.startOffset.y + (this.targetOffset.y - this.startOffset.y) * eased,
    };

    // End animation
    if (progress === 1) {
      this.isAnimating = false;
    }
  }

  handleZoom(delta: number, mouseX: number, mouseY: number) {
    if (this.isAnimating) return; // Ignore zoom while animating

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
    if (this.isAnimating) return; // Ignore pan while animating

    this.offset.x += deltaX;
    this.offset.y += deltaY;
  }

  getTransform(currentTime?: number) {
    if (this.isAnimating && currentTime !== undefined) {
      this.updateAnimation(currentTime);
    }

    return {
      scale: this.scale,
      offset: this.offset,
    };
  }
}
