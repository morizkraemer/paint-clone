//SECTION: helpers
function el(css) {
  return document.querySelector(css);
}

function create(html) {
  return document.createElement(html);
}

// SECTION: variable declarations

// constants
const DEFAULT_BORDER_STYLE = "#444444 solid";
const SELECTED_BORDER_STYLE = "red dashed";
let COLORS = [
  "#000000", // Black
  "#808080", // Gray
  "#800000", // Maroon
  "#FF0000", // Red
  "#800080", // Purple
  "#FF00FF", // Fuchsia
  "#008000", // Green
  "#00FF00", // Lime
  "#808000", // Olive
  "#FFFF00", // Yellow
  "#000080", // Navy
  "#0000FF", // Blue
  "#008080", // Teal
  "#00FFFF", // Aqua
  "#FFFFFF", // White
  "#C0C0C0", // Silver
  "#FFA500", // Orange
  "#FFC0CB", // Pink
  "#FFFFE0", // Light Yellow
  "#F5F5DC", // Beige
];

// elements
const canvasEL = el("#canvas");
const ctx = canvasEL.getContext("2d");
const colorPalletteEL = el("#colors");
const toolPaletteEL = el("#tools");

// variables
let selectedColor = 0;
let selectedTool = 0;
let selectedLineWeight = 10;
let canvasBounding;
let isDrawing = false;
let drawX = 0;
let drawY = 0;

// SECTION: logic

function drawCanvasBorder() {
  ctx.strokeStyle = "black"; // Outline color
  ctx.lineWidth = 3; // Outline width
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasEL.width, canvasEL.height);
  ctx.strokeRect(0, 0, canvasEL.width, canvasEL.height);
}

function initCanvas() {
  canvasEL.style.width = "80%";
  canvasEL.style.height = "80%";
  canvasBounding = canvasEL.getBoundingClientRect();
  canvasEL.height = canvasBounding.height;
  canvasEL.width = canvasBounding.width;
  drawCanvasBorder();
}

function selectColor(color) {
  if (this === window) {
    colorPalletteEL.children[color].style.border = SELECTED_BORDER_STYLE;
    selectedColor = color;
  } else {
    [...colorPalletteEL.children].forEach((c) => {
      c.style.border = DEFAULT_BORDER_STYLE;
    });
    this.style.border = SELECTED_BORDER_STYLE;
    selectedColor = this.colorCode;
  }
}

function initColorPalette() {
  COLORS.forEach((color, index) => {
    let swatch = create("div");
    swatch.style.backgroundColor = color;
    swatch.style.border = DEFAULT_BORDER_STYLE;
    swatch.colorCode = index;
    swatch.addEventListener("click", selectColor);
    colorPalletteEL.append(swatch);
  });
  selectColor(0);
}

function initToolPalette() {
  [...toolPaletteEL.children].forEach((tool) => {
    tool.addEventListener("click", selectTool);
    selectTool(0);
  });
}
function selectTool(tool) {
  if (this === window) {
    toolPaletteEL.children[tool].style.border = SELECTED_BORDER_STYLE;
    selectedTool = tool;
  } else {
    [...toolPaletteEL.children].forEach((t) => {
      t.style.border = DEFAULT_BORDER_STYLE;
    });
    this.style.border = SELECTED_BORDER_STYLE;
    selectedTool = this.toolCode;
  }
}

function draw(e) {
  if (!isDrawing) return;

  ctx.lineJoin = "miter";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

canvasEL.addEventListener("mousedown", (e) => {
  ctx.strokeStyle = COLORS[selectedColor];
  ctx.lineWidth = selectedLineWeight;
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvasEL.addEventListener("mousemove", draw);
canvasEL.addEventListener("mouseup", () => (isDrawing = false));
canvasEL.addEventListener("mouseout", () => (isDrawing = false));

initCanvas();
initColorPalette();
initToolPalette();
