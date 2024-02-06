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
let selectedLineWidth = 10;
let canvasBounding;
let isDrawing = false;
let drawX = 0;
let drawY = 0;
let backgroundColor = "#FFF";

// SECTION: logic
function clearCanvas() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasEL.width, canvasEL.height);
}

function initCanvas() {
  canvasBounding = canvasEL.getBoundingClientRect();
  canvasEL.height = canvasBounding.height;
  canvasEL.width = canvasBounding.width;
  clearCanvas();
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
    selectedTool = this.getAttribute("toolCode");
  }
}

function draw(e) {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(drawX, drawY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [drawX, drawY] = [e.offsetX, e.offsetY];
}

canvasEL.addEventListener("mousedown", (e) => {
  if (selectedTool == 0) {
    ctx.strokeStyle = COLORS[selectedColor];
  }
  if (selectedTool == 1) {
    ctx.strokeStyle = backgroundColor;
  }
  ctx.lineWidth = selectedLineWidth;
  ctx.lineCap = "round";
  isDrawing = true;
  [drawX, drawY] = [e.offsetX, e.offsetY];
});

canvasEL.addEventListener("mousemove", draw);
canvasEL.addEventListener("mouseup", () => (isDrawing = false));
canvasEL.addEventListener("mouseout", () => (isDrawing = false));

let link = document.getElementById("saveCanvas");
link.addEventListener("click", function () {
  link.href = canvasEL.toDataURL("image/png");
  link.download = "MintyPaper.png";
});

el("#eraseCanvas").addEventListener("click", clearCanvas);
initCanvas();
initColorPalette();
initToolPalette();
