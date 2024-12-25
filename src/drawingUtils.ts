import p5 from "p5";
import { User } from "./types";
import { AVATAR_SIZE } from "./visualConfig";

export function drawUserInfo(
  p: p5,
  user: User,
  x: number,
  y: number,
  zoomLevel: number
) {
  p.push();
  const boxWidth = 200;
  const boxHeight = 80;
  const margin = 10;

  // Calculate available space
  const spaceLeft = x - margin;
  const spaceRight = p.width - (x + margin);
  const spaceTop = y - margin;
  const spaceBottom = p.height - (y + margin);

  // Position box
  let boxX =
    spaceRight >= boxWidth
      ? x + margin
      : spaceLeft >= boxWidth
      ? x - margin - boxWidth
      : p.width - boxWidth - margin;

  const usernameHeight = (AVATAR_SIZE / 2 + 25) * zoomLevel;
  let boxY =
    spaceTop >= boxHeight
      ? y - margin - boxHeight
      : spaceBottom >= boxHeight + usernameHeight
      ? y + margin + usernameHeight
      : margin;

  // Draw box
  p.fill(255, 250);
  p.stroke(100, 150, 255);
  p.strokeWeight(1);
  p.rect(boxX, boxY, boxWidth, boxHeight, 5);

  // Draw content
  p.noStroke();
  p.fill(0);
  p.textSize(12);
  p.textAlign(p.LEFT);

  const skills = Object.entries(user.skills)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
  p.text(`Skills: ${skills}`, boxX + 10, boxY + 20);

  const scores = Object.entries(user.scores)
    .map(([key, value]) => `${key}: ${value.toFixed(2)}`)
    .join(", ");
  p.text(`Scores: ${scores}`, boxX + 10, boxY + 40);

  p.text(`Companies: ${user.companies.join(", ")}`, boxX + 10, boxY + 60);
  p.pop();
}

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

  if (hoveredUserIndex === index) {
    drawUserInfo(p, user, x, y, zoomLevel);
  }
}
