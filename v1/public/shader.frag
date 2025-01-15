#version 300 es
precision mediump float;

uniform float u_time;

in vec3 vNormal;
in vec3 vPosition;
out vec4 fragColor;

void main() {
  // Create a shifting color based on normal direction and position
  vec3 color = vec3(0.5) + 0.5 * normalize(vNormal);
  
  // Add iridescent effect
  float iridescence = sin(dot(normalize(vNormal), normalize(vPosition)) * 5.0 + u_time);
  vec3 iridColor = vec3(
    0.5 + 0.5 * sin(u_time + iridescence),
    0.5 + 0.5 * sin(u_time + iridescence + 2.0),
    0.5 + 0.5 * sin(u_time + iridescence + 4.0)
  );
  
  // Mix normal-based color with iridescence
  vec3 finalColor = mix(color, iridColor, 0.5);
  
  fragColor = vec4(finalColor, 1.0);
}
