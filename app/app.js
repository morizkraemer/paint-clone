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

canvasEL.style.width = "80%";
canvasEL.style.height = "80%";
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
function initCanvas() {
  ctx.strokeStyle = "black"; // Outline color
  ctx.lineWidth = 3; // Outline width
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasEL.width, canvasEL.height);
  ctx.strokeRect(0, 0, canvasEL.width, canvasEL.height);
}

function selectColor(color) {
  if (this === window) {
    colorPalletteEL.children[color].style.borderColor = "red";
    selectedColor = color;
  } else {
    [...colorPalletteEL.children].forEach((c) => {
      c.style.borderColor = DEFAULT_BORDER_COLOR;
    });
    this.style.borderColor = "red";
    selectedColor = this.colorCode;
  }
}

function initColorPalette() {
  colors.forEach((color, index) => {
    let swatch = create("div");
    swatch.style.backgroundColor = color;
    swatch.style.borderColor = DEFAULT_BORDER_COLOR;
    swatch.colorCode = index;
    swatch.addEventListener("click", selectColor);
    colorPalletteEL.append(swatch);
  });
  selectColor(0);
}

initCanvas();
initColorPalette();
