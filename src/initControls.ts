import { DEFAULT_WEIGHTS, DEFAULT_CONNECTION_DISTANCE } from "./config";

export function initControls() {
  // Initialize weight controls
  Object.entries(DEFAULT_WEIGHTS).forEach(([key, value]) => {
    const slider = document.getElementById(`${key}-weight`) as HTMLInputElement;
    const valueDisplay = slider.nextElementSibling as HTMLSpanElement;
    slider.value = value.toString();
    valueDisplay.textContent = value.toFixed(1);
  });

  // Initialize connection distance control
  const distanceSlider = document.getElementById(
    "connection-distance"
  ) as HTMLInputElement;
  const distanceDisplay = distanceSlider.nextElementSibling as HTMLSpanElement;
  distanceSlider.value = DEFAULT_CONNECTION_DISTANCE.toString();
  distanceDisplay.textContent = DEFAULT_CONNECTION_DISTANCE.toFixed(2);
}

// Initialize controls when DOM is loaded
document.addEventListener("DOMContentLoaded", initControls);
