import p5 from "p5";
import { sketch } from "./sketch";
import { User } from "./types";

// Create p5 instance in canvas container
new p5(sketch, document.getElementById("canvas-container") || undefined);

// Function to update user info sidebar
export function updateUserInfo(user: User | null) {
  const userInfo = document.getElementById("user-info");
  if (!userInfo) return;

  if (!user) {
    userInfo.className = "empty";
    userInfo.innerHTML = "Select a user to view details";
    return;
  }

  userInfo.className = "";
  userInfo.innerHTML = `
    <h2>@${user.name}</h2>
    
    <div class="info-section">
      <h3>Skills</h3>
      <div>
        ${Object.entries(user.skills)
          .map(
            ([skill, level]) =>
              `<span class="skill-item">${skill}: ${level}</span>`
          )
          .join("")}
      </div>
    </div>

    <div class="info-section">
      <h3>Scores</h3>
      <div>
        ${Object.entries(user.scores)
          .map(
            ([key, value]) => `
          <div class="score-item">
            <span>${key}:</span>
            <span>${value.toFixed(2)}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="info-section">
      <h3>Companies</h3>
      <div>
        ${user.companies
          .map((company) => `<span class="company-item">${company}</span>`)
          .join("")}
      </div>
    </div>
  `;
}
