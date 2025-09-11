// meanings.js

let meaningsData = {};

async function loadMeanings() {
  try {
    const response = await fetch("meanings_fixed_v2.json"); // الملف بجوار HTML
    meaningsData = await response.json();
    attachMeanings();
  } catch (error) {
    console.error("Error loading meanings:", error);
  }
}

function attachMeanings() {
  const spans = document.querySelectorAll(".word_mean");
  spans.forEach(span => {
    const id = span.id;
    if (meaningsData[id]) {
      // fallback عادي
      span.setAttribute("title", meaningsData[id]);

      // tooltip مخصص
      span.addEventListener("mouseenter", () => {
        showTooltip(span, meaningsData[id]);
      });
      span.addEventListener("mouseleave", hideTooltip);
    }
  });
}

let tooltipDiv;
function showTooltip(element, text) {
  if (!tooltipDiv) {
    tooltipDiv = document.createElement("div");
    tooltipDiv.style.position = "absolute";
    tooltipDiv.style.background = "#333";
    tooltipDiv.style.color = "#fff";
    tooltipDiv.style.padding = "5px 8px";
    tooltipDiv.style.borderRadius = "5px";
    tooltipDiv.style.fontSize = "14px";
    tooltipDiv.style.zIndex = "1000";
    document.body.appendChild(tooltipDiv);
  }
  tooltipDiv.textContent = text;
  const rect = element.getBoundingClientRect();
  tooltipDiv.style.top = (rect.top + window.scrollY - 35) + "px";
  tooltipDiv.style.left = (rect.left + window.scrollX) + "px";
  tooltipDiv.style.display = "block";
}
function hideTooltip() {
  if (tooltipDiv) tooltipDiv.style.display = "none";
}

document.addEventListener("DOMContentLoaded", loadMeanings);
