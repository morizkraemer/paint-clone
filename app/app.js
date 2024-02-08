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
  { r: 0, g: 0, b: 0, a: 255 }, // Black
  { r: 128, g: 128, b: 128, a: 255 }, // Gray
  { r: 128, g: 0, b: 0, a: 255 }, // Maroon
  { r: 255, g: 0, b: 0, a: 255 }, // Red
  { r: 128, g: 0, b: 128, a: 255 }, // Purple
  { r: 255, g: 0, b: 255, a: 255 }, // Fuchsia
  { r: 0, g: 128, b: 0, a: 255 }, // Green
  { r: 0, g: 255, b: 0, a: 255 }, // Lime
  { r: 128, g: 128, b: 0, a: 255 }, // Olive
  { r: 255, g: 255, b: 0, a: 255 }, // Yellow
  { r: 0, g: 0, b: 128, a: 255 }, // Navy
  { r: 0, g: 0, b: 255, a: 255 }, // Blue
  { r: 0, g: 128, b: 128, a: 255 }, // Teal
  { r: 0, g: 255, b: 255, a: 255 }, // Aqua
  { r: 255, g: 255, b: 255, a: 255 }, // White
  { r: 192, g: 192, b: 192, a: 255 }, // Silver
  { r: 255, g: 165, b: 0, a: 255 }, // Orange
  { r: 255, g: 192, b: 203, a: 255 }, // Pink
  { r: 255, g: 255, b: 224, a: 255 }, // Light Yellow
  { r: 245, g: 245, b: 220, a: 255 }, // Beige
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

// SECTION: initialization

function initCanvas() {
  canvasEl.style.width = `${el("#drawBoard").clientWidth * 0.8}px`;
  canvasEl.style.height = `${el("#drawBoard").clientHeight * 0.8}px`;
  canvasEl.height = canvasEl.clientHeight;
  canvasEl.width = canvasEl.clientWidth;
  clearCanvas();
}

function initColorPalette() {
  COLORS.forEach((color, index) => {
    let swatch = create("div");
    console.log(convertRGB(color));
    swatch.style.backgroundColor = convertRGB(color);
    swatch.style.border = DEFAULT_BORDER_STYLE;
    swatch.colorCode = index;
    swatch.addEventListener("click", selectColor);
    colorPalletteEL.append(swatch);
  });
  selectColor(0);
}

function initToolPalette() {
  [...toolPaletteEL.children].forEach((tool) => {
    tool.style.border = DEFAULT_BORDER_STYLE;
    tool.addEventListener("click", selectTool);
    selectTool(0);
  });
}

//SECTION: drawing
function draw(e) {
  if (!isDrawing) return;
  ctx.beginPath();
  ctx.moveTo(drawX, drawY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [drawX, drawY] = [e.offsetX, e.offsetY];
}

function useTool(e) {
  switch (selectedTool) {
    case 0: // paintbrush
    case 1: // eraser
      //paintbrush and eraser only differ in color
      ctx.strokeStyle =
        selectedTool === 0
          ? convertRGB(COLORS[selectedColor])
          : backgroundColor;
      ctx.lineWidth = selectedLineWidth;
      ctx.lineCap = "round";
      isDrawing = true;
      [drawX, drawY] = [e.offsetX, e.offsetY];
      break;
    case 2: // paintbucket
      console.log("hi");
      const imageDataPaintBucket = ctx.getImageData(
        0,
        0,
        canvasEl.width,
        canvasEl.height,
      );
      fillArea(imageDataPaintBucket, e.offsetX, e.offsetY, selectedColor);

      break;
    case 3: // colorpicker
      const imageDataColorPicker = ctx.getImageData(e.offsetX, e.offsetY, 1, 1);
      const rgbColor = convertRGB(getPixelColor(imageDataColorPicker));
      const colorIndex = findColorIndex(rgbColor);
      selectColor(colorIndex);
      selectTool(0);
      break;
  }
}

//SECTION: fill tool

function fillArea(imageData, startX, startY, fillColorCode) {
  function colorsMatch(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }
  const targetColor = getPixelColor(imageData, startX, startY);
  const checked = new Set(`${startX}, ${startY}`);
  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const imageDataIndex = (y * imageData.width + x) * 4;

    if (checked.has(`${x}, ${y}`)) {
      continue;
    }
    if (x < 0) {
      continue;
    }
    if (y < 0) {
      continue;
    }
    if (x >= imageData.width) {
      continue;
    }
    if (y >= imageData.height) {
      continue;
    }

    if (!colorsMatch(targetColor, getPixelColor(imageData, x, y))) {
      continue;
    }

    imageData.data[imageDataIndex] = COLORS[fillColorCode].r;
    imageData.data[imageDataIndex + 1] = COLORS[fillColorCode].g;
    imageData.data[imageDataIndex + 2] = COLORS[fillColorCode].b;
    imageData.data[imageDataIndex + 3] = COLORS[fillColorCode].a;
    checked.add(`${x}, ${y}`);

    stack.push([x + 1, y]);
    stack.push([x, y + 1]);
    stack.push([x - 1, y]);
    stack.push([x, y - 1]);
  }
  ctx.putImageData(imageData, 0, 0);
}

// function fillArea(imageData, startX, startY, fillColorCode) {
//   function colorsMatch(a, b) {
//     return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
//   }
//   const targetColor = getPixelColor(imageData, startX, startY);
//   const checked = new Set();
//
//   function fillRecursively(x, y) {
//     const pixel = `${x}, ${y}`;
//     const imageDataIndex = (y * imageData.width + x) * 4;
//     if (checked.has(pixel)) {
//       return;
//     }
//     if (!colorsMatch(targetColor, getPixelColor(imageData, x, y))) {
//       return;
//     }
//
//     checked.add(pixel);
//     imageData.data[imageDataIndex] = COLORS[fillColorCode].r;
//     imageData.data[imageDataIndex + 1] = COLORS[fillColorCode].g;
//     imageData.data[imageDataIndex + 2] = COLORS[fillColorCode].b;
//     imageData.data[imageDataIndex + 3] = COLORS[fillColorCode].a;
//
//     if (x > 0) {
//       fillRecursively(x - 1, y);
//     }
//     if (y > 0) {
//       fillRecursively(x, y - 1);
//     }
//     if (x < imageData.width - 1) {
//       fillRecursively(x + 1, y);
//     }
//     if (y < imageData.height - 1) {
//       fillRecursively(x, y + 1);
//     }
//   }
//   fillRecursively(startX, startY);
//   ctx.putImageData(imageData, 0, 0);
// }

// SECTION: downloadbutton
let downloadButton = document.getElementById("saveCanvas");
downloadButton.addEventListener("click", function () {
  downloadButton.href = canvasEl.toDataURL("image/png");
  downloadButton.download = "MyPicture.png";
});

canvasEl.addEventListener("mousedown", useTool);
canvasEl.addEventListener("mousemove", draw);
canvasEl.addEventListener("mouseup", () => (isDrawing = false));
canvasEl.addEventListener("mouseout", () => (isDrawing = false));
el("#strokeWidth").addEventListener("change", () => {
  selectedLineWidth = this.value;
});
el("#eraseCanvas").addEventListener("click", clearCanvas);
initCanvas();
initColorPalette();
initToolPalette();
