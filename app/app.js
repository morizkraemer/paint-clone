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
  "rgba(0, 0, 0, 1.0)", // Black
  "rgba(128, 128, 128, 1.0)", // Gray
  "rgba(128, 0, 0, 1.0)", // Maroon
  "rgba(255, 0, 0, 1.0)", // Red
  "rgba(128, 0, 128, 1.0)", // Purple
  "rgba(255, 0, 255, 1.0)", // Fuchsia
  "rgba(0, 128, 0, 1.0)", // Green
  "rgba(0, 255, 0, 1.0)", // Lime
  "rgba(128, 128, 0, 1.0)", // Olive
  "rgba(255, 255, 0, 1.0)", // Yellow
  "rgba(0, 0, 128, 1.0)", // Navy
  "rgba(0, 0, 255, 1.0)", // Blue
  "rgba(0, 128, 128, 1.0)", // Teal
  "rgba(0, 255, 255, 1.0)", // Aqua
  "rgba(255, 255, 255, 1.0)", // White
  "rgba(192, 192, 192, 1.0)", // Silver
  "rgba(255, 165, 0, 1.0)", // Orange
  "rgba(255, 192, 203, 1.0)", // Pink
  "rgba(255, 255, 224, 1.0)", // Light Yellow
  "rgba(245, 245, 220, 1.0)", // Beige
];

// elements
const canvasEl = el("#canvas");
const ctx = canvasEl.getContext("2d", {
  willReadFrequently: true,
});
const colorPalletteEL = el("#colors");
const toolPaletteEL = el("#tools");

// variables
let selectedColor = 0;
let selectedTool = 0;
let selectedLineWidth = 10;
let isDrawing = false;
let drawX = 0;
let drawY = 0;
let backgroundColor = "#FFF";

// SECTION: logic
// SECTION: logic helpers
function convertRGB(color) {
  const { r, g, b, a } = color;
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(1)})`;
}

function getPixelColor(imageData, x = 0, y = 0) {
  const { width, data } = imageData;
  const index = (y * width + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3],
  };
}

function findColorIndex(rgbColor) {
  const output = COLORS.findIndex((e) => e === rgbColor);
  return output !== -1 ? output : 0;
}

function colorsMatch(a, b) {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function clearCanvas() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
}

// SECTION: selecting tools and colors
function selectColor(color) {
  [...colorPalletteEL.children].forEach((c) => {
    c.style.border = DEFAULT_BORDER_STYLE;
  });
  if (this === window) {
    colorPalletteEL.children[color].style.border = SELECTED_BORDER_STYLE;
    selectedColor = color;
  } else {
    this.style.border = SELECTED_BORDER_STYLE;
    selectedColor = this.colorCode;
  }
}

function selectTool(tool) {
  [...toolPaletteEL.children].forEach((t) => {
    t.style.border = DEFAULT_BORDER_STYLE;
  });
  if (this === window) {
    toolPaletteEL.children[tool].style.border = SELECTED_BORDER_STYLE;
    selectedTool = tool;
  } else {
    this.style.border = SELECTED_BORDER_STYLE;
    selectedTool = parseInt(this.getAttribute("toolCode"));
  }
}

function initCanvas() {
  canvasEl.height = canvasEl.clientHeight;
  canvasEl.width = canvasEl.clientWidth;
  clearCanvas();
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
