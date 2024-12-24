import p5 from "p5";

export class Particle {
  private pos: p5.Vector;
  private vel: p5.Vector;
  private acc: p5.Vector;
  private alpha: number;
  private size: number;

  constructor(private p: p5, x: number, y: number) {
    this.pos = p.createVector(x, y);
    this.vel = p5.Vector.random2D().mult(p.random(0.1, 0.5));
    this.acc = p.createVector(0, 0);
    this.alpha = p.random(50, 100);
    this.size = p.random(0.5, 1.5);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.alpha -= 0.5;
  }

  isDead() {
    return this.alpha < 0;
  }

  draw() {
    this.p.noStroke();
    this.p.fill(255, 255, 255, this.alpha);
    this.p.ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}
