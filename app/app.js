//SECTION: helpers

// SECTION: variable declarations

// constants
const DEFAULT_BORDER_STYLE = "2px #444444 solid";
const SELECTED_BORDER_STYLE = "2px red dashed";
const BACKGROUND_COLOR = "#FFF";
const colorProto = {
    // color object prototype
    r: 0,
    g: 0,
    b: 0,
    a: 255,
    get rgbString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${(this.a / 255).toFixed(1)})`;
    },
    get hexCode() {
        function toHex(c) {
            const hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`.toUpperCase();
    }
};

let COLOR_DEFINITIONS = [
    "#000000",
    "#464646",
    "#ffffff",
    "#990030",
    "#9c5a3c",
    "#ed1c24",
    "#ffa3b1",
    "#ff7e00",
    "#e5aa7a",
    "#ffc20e",
    "#fff200",
    "#a8e61d",
    "#22b14c",
    "#9dbb61",
    "#00b7ef",
    "#99d9ea",
    "#4d6df3",
    "#709ad1",
    "#2f3699",
    "#546d8e",
    "#6f3198",
    "#b5a5d5"
];

// initialize array of objects containig the color objects
const COLORS = COLOR_DEFINITIONS.map((color) => {
    return hexToRGB(color);
});

// elements
const canvasEl = el("#canvas");
const ctx = canvasEl.getContext("2d", {
    willReadFrequently: true
});
const colorPalletteEl = el("#colors");
const toolPaletteEl = el("#tools");
const selectedColorEl = el("#selectedColor");
const hexColorDisplayEl = el("#hexColorInput");

// variables
let selectedColor = 0;
let selectedTool = 0;
let selectedLineWidth = 10;
let isDrawing = false;
let drawX = 0;
let drawY = 0;
let undoHistory = [];
let undoStep = -1; //starting at -1 to make sure to be at index 0 of the array when adding the first undoStep

// SECTION: HELPERS

function el(css) {
    return document.querySelector(css);
}

function create(html) {
    return document.createElement(html);
}

function createColor(r, g, b, a = 255) {
    const obj = Object.create(colorProto);
    obj.r = r;
    obj.g = g;
    obj.b = b;
    obj.a = a;
    return obj;
}

//return color object with color of selected pixel
function getPixelColor(imageData, x = 0, y = 0) {
    const { width, data } = imageData;
    const index = (y * width + x) * 4;
    const colorObject = createColor(data[index], data[index + 1], data[index + 2], data[index + 3]);
    return colorObject;
}

function findColorIndex(rgbColor) {
    const output = COLORS.findIndex((e) => e.rgbString === rgbColor.rgbString);
    return output === -1 ? 0 : output;
}

function getCanvasImageData(startX = 0, startY = 0, endX = canvasEl.width, endY = canvasEl.height) {
    return ctx.getImageData(startX, startY, endX, endY);
}

function hexToRGB(hexCode) {
    const colorValue = hexCode.substring(1);
    const colorObject = createColor(
        parseInt(colorValue.substring(0, 2), 16),
        parseInt(colorValue.substring(2, 4), 16),
        parseInt(colorValue.substring(4, 6), 16)
    );
    return colorObject;
}

// SECTION: COLORS AND TOOLS
function selectColor(color) {
    if (this === window) {
        selectedColorEl.style.backgroundColor = COLORS[color].rgbString;
        hexColorDisplayEl.value = COLORS[color].hexCode;
        selectedColor = color;
    } else {
        selectedColor = parseInt(this.getAttribute("data-colorcode"));
        hexColorDisplayEl.value = COLORS[selectedColor].hexCode;
        selectedColorEl.style.backgroundColor = COLORS[selectedColor].rgbString;
    }
}

function selectTool(tool) {
    [...toolPaletteEl.children].forEach((t) => {
        t.style.border = DEFAULT_BORDER_STYLE;
    });
    if (this === window) {
        toolPaletteEl.children[tool].style.border = SELECTED_BORDER_STYLE;
        selectedTool = tool;
    } else {
        this.style.border = SELECTED_BORDER_STYLE;
        selectedTool = parseInt(this.getAttribute("data-toolcode"));
    }
}

// SECTION: INITIALIZATION

function initCanvas() {
    const drawBoardHeight = el("#drawBoard").clientHeight * 0.8;
    canvasEl.style.width = `${drawBoardHeight * 1.5}px`;
    canvasEl.style.height = `${drawBoardHeight}px`;
    canvasEl.height = canvasEl.clientHeight;
    canvasEl.width = canvasEl.clientWidth;
    clearCanvas();
}

function initColorPalette() {
    COLORS.forEach((color, index) => {
        let swatch = create("div");
        swatch.style.backgroundColor = color.rgbString;
        swatch.setAttribute("data-colorcode", index);
        swatch.addEventListener("click", selectColor);
        colorPalletteEl.append(swatch);
    });
    selectColor(0);
}

function initToolPalette() {
    [...toolPaletteEl.children].forEach((tool) => {
        tool.style.border = DEFAULT_BORDER_STYLE;
        tool.addEventListener("click", selectTool);
        selectTool(0);
    });
}

//SECTION: DRAWING
function draw(e) {
    if (!isDrawing) {
        return;
    }
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
                selectedTool === 0 ? COLORS[selectedColor].rgbString : BACKGROUND_COLOR;
            ctx.lineWidth = selectedLineWidth;
            ctx.lineCap = "round";
            isDrawing = true;
            [drawX, drawY] = [e.offsetX, e.offsetY];
            break;
        case 2: // paintbucket
            const imageDataPaintBucket = getCanvasImageData();
            fillArea(imageDataPaintBucket, e.offsetX, e.offsetY, selectedColor);
            addUndoStep();

            break;
        case 3: // colorpicker
            const imageDataColorPicker = getCanvasImageData(e.offsetX, e.offsetY, 1, 1);
            const rgbColor = getPixelColor(imageDataColorPicker);
            const colorIndex = findColorIndex(rgbColor);
            selectColor(colorIndex);
            selectTool(0);
            break;
    }
}

function addUndoStep() {
    if (undoStep + 1 < undoHistory.length) {
        undoHistory.splice(undoStep + 1);
    }
    if (undoHistory.length >= 10) {
        // cap undo history array to ten to keep size small
        undoHistory.shift();
    }
    undoStep++;
    undoHistory.push(getCanvasImageData());
}

function undoStepBack() {
    if (undoStep > 0) {
        undoStep--;
        ctx.putImageData(undoHistory[undoStep], 0, 0);
    }
}

function undoStepForward() {
    if (undoStep + 1 < undoHistory.length) undoStep++;
    ctx.putImageData(undoHistory[undoStep], 0, 0);
}

//SECTION: FILL TOOL

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
            imageData.data[imageDataIndex] = COLORS[fillColorCode].r;
            imageData.data[imageDataIndex + 1] = COLORS[fillColorCode].g;
            imageData.data[imageDataIndex + 2] = COLORS[fillColorCode].b;
            imageData.data[imageDataIndex + 3] = COLORS[fillColorCode].a;
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

function stopDrawing() {
    if (isDrawing) {
        addUndoStep();
    }
    isDrawing = false;
}

function clearCanvas() {
    undoHistory.length = 0;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    addUndoStep();
}

// SECTION: downloadbutton
let downloadButton = document.getElementById("saveCanvas");
downloadButton.addEventListener("click", function () {
    downloadButton.href = canvasEl.toDataURL("image/png");
    downloadButton.download = "MyPicture.png";
});

//SECTION: EVENTlISTENERS
canvasEl.addEventListener("mousedown", useTool);
canvasEl.addEventListener("mousemove", draw);
canvasEl.addEventListener("mouseup", stopDrawing);
canvasEl.addEventListener("mouseout", stopDrawing);
el("#strokeWidth").addEventListener("change", function stroke() {
    el("#strokeWidthDisplay").innerText = `${this.value}px`;
    selectedLineWidth = this.value;
});
el("#eraseCanvas").addEventListener("click", () => {
    if (confirm("Do you really want to delete your drawing?")) {
        clearCanvas();
    }
});
el("#forward").addEventListener("click", undoStepForward);
el("#backward").addEventListener("click", undoStepBack);

initColorPalette();
initToolPalette();
initCanvas();
