import p5 from "p5";
import { sketch, updateData } from "./sketch";
import { User } from "./types";
import { loadCSV } from "./dataLoader";

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
          .map(([key, value]) => {
            const label =
              {
                e_score: "技術力",
                b_score: "ビジネス力",
                i_score: "影響力",
              }[key] || key;
            return `
          <div class="score-item">
            <span>${label}:</span>
            <span class="score-value" ${
              value >= 3.5 ? 'style="color: rgb(255, 0, 0)"' : ""
            }>${value.toFixed(2)}</span>
          </div>
        `;
          })
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

// Create hidden file input
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".csv";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

// Handle file selection
async function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const loadDataBtn = document.getElementById("load-data-btn");
    if (loadDataBtn) {
      loadDataBtn.textContent = "Loading...";
      loadDataBtn.setAttribute("disabled", "true");
    }

    const data = await loadCSV(file);
    updateData(data);

    if (loadDataBtn) {
      loadDataBtn.textContent = "Load Data";
      loadDataBtn.removeAttribute("disabled");
    }
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Error loading data. Please check the console for details.");

    const loadDataBtn = document.getElementById("load-data-btn");
    if (loadDataBtn) {
      loadDataBtn.textContent = "Load Data";
      loadDataBtn.removeAttribute("disabled");
    }
  } finally {
    // Reset the file input so the same file can be selected again
    fileInput.value = "";
  }
}

fileInput.addEventListener("change", handleFileSelect);

// Initialize load data button
const loadDataBtn = document.getElementById("load-data-btn");
if (loadDataBtn) {
  loadDataBtn.addEventListener("click", () => {
    fileInput.click();
  });
}
