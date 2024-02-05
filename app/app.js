//SECTION: helpers
function el(css) {
  return document.querySelector(css);
}

function create(html) {
  return document.createElement(html);
}
// SECTION: variables
const canvasEL = el("#canvas");
const ctx = canvasEL.getContext("2d");
canvasEL.style.width = "80%";
canvasEL.style.height = "80%";

function initCanvas() {
  ctx.strokeStyle = "black"; // Outline color
  ctx.lineWidth = 3; // Outline width
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasEL.width, canvasEL.height);
  ctx.strokeRect(0, 0, canvasEL.width, canvasEL.height);
}
initCanvas();
