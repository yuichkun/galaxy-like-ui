import p5 from "p5";

export function setDefault(p: p5) {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
}
