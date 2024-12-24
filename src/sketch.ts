import p5 from "p5";
import { setDefault } from "./default";

export const sketch = (p: p5) => {
  setDefault(p);
  p.draw = () => {
    p.background(200);
    p.ellipse(p.width / 2, p.height / 2, 100, 100);
  };
};
