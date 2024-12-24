#version 300 es
precision mediump float;

// Attributes from p5.js
in vec3 aPosition;
in vec3 aNormal;

// Matrices from p5.js
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform float u_time;

// Variables to pass to fragment shader
out vec3 vNormal;
out vec3 vPosition;

void main() {
  // Create wave displacement based on position and time
  float displacement = sin(aPosition.x * 5.0 + u_time) * 
                      sin(aPosition.y * 5.0 + u_time) * 
                      sin(aPosition.z * 5.0 + u_time) * 0.2;
  
  // Apply displacement along the normal
  vec3 newPosition = aPosition + aNormal * displacement;
  
  // Calculate final position with matrices
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(newPosition, 1.0);
  
  // Pass modified values to fragment shader
  vNormal = normalize(mat3(uModelViewMatrix) * aNormal);
  vPosition = newPosition;
}
