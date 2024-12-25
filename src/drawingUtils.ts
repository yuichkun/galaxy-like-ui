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
  // Draw glow
  const glowSize = (AVATAR_SIZE + Math.sin(time + index) * 5) * zoomLevel;
  p.noStroke();
  for (let size = glowSize; size > 0; size -= 2 * zoomLevel) {
    const alpha = p.map(size, glowSize, 0, 0, 50);
    p.fill(100, 150, 255, alpha);
    p.ellipse(x, y, size, size);
  }

  // Draw avatar
  const img = avatarImages[user.avatar];
  if (img) {
    const size = AVATAR_SIZE * zoomLevel;
    p.image(img, x, y, size, size);
  }

  // Draw username with background
  const userName = user.name;
  const textSize = 12 * zoomLevel;
  p.textSize(textSize);
  const textWidth = p.textWidth(userName);
  const textHeight = textSize;
  const textY = y + (AVATAR_SIZE / 2 + 15) * zoomLevel;
  const padding = 4 * zoomLevel;

  p.fill(10, 15, 30, 230);
  p.noStroke();
  p.rect(
    x - textWidth / 2 - padding,
    textY - textHeight,
    textWidth + padding * 2,
    textHeight + padding,
    4 * zoomLevel
  );

  p.fill(255);
  p.textAlign(p.CENTER);
  p.text(userName, x, textY);

  // Add highlight effect when hovered
  if (hoveredUserIndex === index) {
    p.noFill();
    p.stroke(100, 150, 255);
    p.strokeWeight(2 * zoomLevel);
    p.ellipse(x, y, (AVATAR_SIZE + 10) * zoomLevel);
  }
}
