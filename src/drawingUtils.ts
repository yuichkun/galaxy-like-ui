import p5 from "p5";
import { User } from "./types";
import { AVATAR_SIZE } from "./visualConfig";

export function drawUserNode(
  p: p5,
  x: number,
  y: number,
  user: User,
  index: number,
  time: number,
  zoomLevel: number,
  hoveredUserIndex: number | null,
  avatarImages: Record<string, p5.Image>
) {
  // Scale down only padding and stroke weight
  const scaleFactor = 1 / Math.sqrt(zoomLevel);
  const currentPadding = 4 * scaleFactor;
  const currentStrokeWeight = 2 * scaleFactor;

  // Draw subtle glow
  const glowSize = AVATAR_SIZE + Math.sin(time + index) * 3;
  p.noStroke();
  for (let size = glowSize; size > 0; size -= 2) {
    const alpha = p.map(size, glowSize, 0, 0, 20);
    p.fill(33, 150, 243, alpha);
    p.ellipse(x, y, size, size);
  }

  // Draw avatar (constant size)
  const img = avatarImages[user.avatar];
  if (img) {
    p.image(img, x, y, AVATAR_SIZE, AVATAR_SIZE);
  }

  // Draw username with background (constant text size)
  const userName = user.name;
  p.textSize(12); // Keep text size constant
  const textWidth = p.textWidth(userName);
  const textHeight = 12;
  const textY = y + (AVATAR_SIZE / 2 + 15 * scaleFactor);

  // Semi-transparent white background for text
  p.fill(255, 250);
  p.noStroke();
  p.rect(
    x - textWidth / 2 - currentPadding,
    textY - textHeight,
    textWidth + currentPadding * 2,
    textHeight + currentPadding,
    4 * scaleFactor
  );

  // Dark gray text for better readability
  p.fill(51);
  p.textAlign(p.CENTER);
  p.text(userName, x, textY);

  // Add highlight effect when hovered
  if (hoveredUserIndex === index) {
    p.noFill();
    p.stroke(33, 150, 243);
    p.strokeWeight(currentStrokeWeight);
    p.ellipse(x, y, AVATAR_SIZE + 10);
  }
}
