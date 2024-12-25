import { DEFAULT_WEIGHTS } from "./config";

// Set initial values for weight controls
document.addEventListener("DOMContentLoaded", () => {
  // Set weight controls
  Object.entries(DEFAULT_WEIGHTS).forEach(([key, value]) => {
    const slider = document.getElementById(`${key}-weight`) as HTMLInputElement;
    const valueDisplay = slider.nextElementSibling as HTMLSpanElement;

    slider.value = value.toString();
    valueDisplay.textContent = value.toFixed(1);
  });
});
