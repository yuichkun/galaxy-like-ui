import p5 from "p5";

let myShader: p5.Shader;
let rotationX = 0;
let rotationY = 0;

const sketch = (p: p5) => {
  p.preload = () => {
    // Load the vertex and fragment shaders
    myShader = p.loadShader('/shader.vert', '/shader.frag');
  };

  p.setup = () => {
    // Create a WebGL canvas
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.noStroke();
  };

  p.draw = () => {
    // Clear background
    p.background(0);

    // Set the active shader
    p.shader(myShader);

    // Pass time uniform to the shader
    myShader.setUniform("u_time", p.millis() / 1000);

    // Rotate the sphere
    // rotationX += 0.01;
    // rotationY += 0.013;
    // p.rotateX(rotationX);
    // p.rotateY(rotationY);

    // Create a sphere
    p.sphere(150, 64, 64);
  };

  p.windowResized = () => {
    // Adjust canvas size when window is resized
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new p5(sketch);
