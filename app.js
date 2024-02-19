//SECTION: help

// SECTION: variable declarations

// constants
const DEFAULT_BORDER_STYLE = "2px #444444 solid";
const SELECTED_BORDER_STYLE = "2px red dashed";
const BACKGROUND_COLOR = "#FFF";
// color object prototype
const colorProto = {
    r: 0,
    g: 0,
    b: 0,
    a: 255,
    get rgbString() {
        //getter that returns the rgba(rrr,ggg,bbb,a.a) of the color
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${(this.a / 255).toFixed(1)})`;
    },
    get hexCode() {
        //getter that returns the hexCode of the color
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
    willReadFrequently: true // appearently good for getImageData
});
const colorPalletteEl = el("#colors");
const toolPaletteEl = el("#tools");
const selectedColorEl = el("#selectedColor");
const hexColorDisplayEl = el("#hexColorInput");

// variables
let selectedColorIndex = 0;
let selectedColor;
let selectedTool = 0;
let selectedLineWidth = 4;
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

// color object constructor?
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

// check if inputted data is a hexCode and then parse it and create a new colorObject from it
function hexToRGB(hexCode) {
    const hexRegEx = /#(?:[A-Fa-f0-9]{3}){1,2}\b/i;
    if (hexRegEx.test(hexCode)) {
        const colorValue = hexCode.substring(1);
        const colorObject = createColor(
            parseInt(colorValue.substring(0, 2), 16),
            parseInt(colorValue.substring(2, 4), 16),
            parseInt(colorValue.substring(4, 6), 16)
        );
        return colorObject;
    }
}
// finds the index in the COLORS array, used for the color palette, because html attribute is only a number
function findColorIndex(rgbColor) {
    const output = COLORS.findIndex((e) => e.rgbString === rgbColor.rgbString);
    return output === -1 ? 0 : output;
}
// get imageData from canvas, with the whole canvas as default
function getCanvasImageData(startX = 0, startY = 0, endX = canvasEl.width, endY = canvasEl.height) {
    return ctx.getImageData(startX, startY, endX, endY);
}

// SECTION: COLORS AND TOOLS

// select color
function selectColor(input) {
    // check if the function is called or used in an eventListener callback
    if (this === window) {
        // check if the input is a color code or a color object
        if (colorProto.isPrototypeOf(input)) {
            selectedColorIndex = findColorIndex(input);
        } else {
            selectedColorIndex = input;
        }
    } else {
        selectedColorIndex = parseInt(this.getAttribute("data-colorcode"));
    }
    // diplay color in slected color element, change color hexcode and change selected color
    selectedColorEl.style.backgroundColor = COLORS[selectedColorIndex].rgbString;
    hexColorDisplayEl.value = COLORS[selectedColorIndex].hexCode;
    selectedColor = COLORS[selectedColorIndex];
}

function selectTool(tool) {
    // reset all borders to normal border
    [...toolPaletteEl.children].forEach((t) => {
        t.style.border = DEFAULT_BORDER_STYLE;
    });
    // check if the function is called or used in a callback
    if (this === window) {
        selectedTool = tool;
        [...toolPaletteEl.children][tool].style.border = SELECTED_BORDER_STYLE;
    } else {
        selectedTool = parseInt(this.getAttribute("data-toolcode"));
        this.style.border = SELECTED_BORDER_STYLE;
    }
}

// SECTION: INITIALIZATION

// initialize canvas
function initCanvas() {
    // set canvas to a fixed aspect ratio and make it not responsive after initial page load
    const drawBoardHeight = el("#drawBoard").clientHeight * 0.8;
    canvasEl.style.width = `${drawBoardHeight * 1.5}px`;
    canvasEl.style.height = `${drawBoardHeight}px`;
    canvasEl.height = canvasEl.clientHeight;
    canvasEl.width = canvasEl.clientWidth;
    clearCanvas();
}

// initialize color palette with all the colors from COLORS array and select black
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

// add eventListener to every tool for selection and select paintbrush
function initToolPalette() {
    [...toolPaletteEl.children].forEach((tool) => {
        tool.style.border = DEFAULT_BORDER_STYLE;
        tool.addEventListener("click", selectTool);
        selectTool(0);
    });
}

//SECTION: DRAWING
// Handles the drawing on the canvas based on mouse events.
function draw(e) {
    // if not drawing, exit the function to prevent drawing without clicking
    if (!isDrawing) {
        return;
    }

    // begin a new path for drawing
    ctx.beginPath();
    // move the drawing cursor to the starting point (drawX, drawY) without creating a line.
    ctx.moveTo(drawX, drawY);
    // draw a line from the starting point to the current mouse position (e.offsetX, e.offsetY).
    ctx.lineTo(e.offsetX, e.offsetY);
    // render the path on the canvas, making the line visible.
    ctx.stroke();
    // update the starting point to the current mouse position to keep drawing.
    [drawX, drawY] = [e.offsetX, e.offsetY];
}

// handles tool usage based on the selected tool.
function useTool(e) {
    // switch statement to handle different tools.
    switch (selectedTool) {
        case 0: // paintbrush
        case 1: // eraser
            //  set the stroke style for paintbrush and eraser
            // use the selected color if the paintbrush is selected (0)
            // use the background color to "erase" if the eraser is selected (1)
            ctx.strokeStyle = selectedTool === 0 ? selectedColor.rgbString : BACKGROUND_COLOR;
            // set the line width based on the selected line width.
            ctx.lineWidth = selectedLineWidth;
            // set the line cap to "round" for smoother lines.
            ctx.lineCap = "round";
            // set the drawing flag to true to enable drawing.
            isDrawing = true;
            // update the starting point for drawing to the current mouse position.
            [drawX, drawY] = [e.offsetX, e.offsetY];
            break;

        case 2: // paintbucket
            // get the current canvas image data to use for the fill operation.
            const imageDataPaintBucket = getCanvasImageData();
            // call the fillArea function to fill an area starting from the click position.
            // use the selected color for filling.
            fillArea(imageDataPaintBucket, e.offsetX, e.offsetY, selectedColor);
            // add the current state to the undo history after filling.
            addUndoStep();
            break;

        case 3: // colorpicker
            // get the image data for the pixel under the cursor.
            const imageDataColorPicker = getCanvasImageData(e.offsetX, e.offsetY, 1, 1);
            // extract the rgb color of the selected pixel.
            const rgbColor = getPixelColor(imageDataColorPicker);
            // Select the color in the palette based on the extracted color.
            selectColor(rgbColor);
            // Automatically switch back to the previously selected tool after picking a color.
            selectTool(0);
            break;
    }
}
// add a step to undo history array
function addUndoStep() {
    if (undoStep + 1 < undoHistory.length) {
        // reset the undo array if you undo something and then paint again. (would need to implement an undo tree in the futur)
        undoHistory.splice(undoStep + 1);
    }
    if (undoHistory.length >= 10) {
        // cap undo history array to ten to keep size small
        undoHistory.shift();
    }
    undoStep++;
    // add the image to the undo history array
    undoHistory.push(getCanvasImageData());
}

function undoStepBack() {
    if (undoStep > 0) {
        undoStep--;
        // put the last imageData from the undo history array back onto the canvas
        ctx.putImageData(undoHistory[undoStep], 0, 0);
    }
}

function undoStepForward() {
    // put the next imageData from the undo history array back onto the canvas
    if (undoStep + 1 < undoHistory.length) undoStep++;
    ctx.putImageData(undoHistory[undoStep], 0, 0);
}

//SECTION: FILL TOOL

// fill an area of connected pixels of the same color with the fill colo
function fillArea(imageData, startX, startY, fillColor) {
    // helper function for comparing colors
    function colorsMatch(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
    }
    // getting the targeted pixels color
    const targetColor = getPixelColor(imageData, startX, startY);
    // implement a set to keep track of already checked pixelss
    const checked = new Set(`${startX}, ${startY}`);
    // implement a stack, because doing this recursively breaks the browsers call stack limit
    const stack = [[startX, startY]];

    // as long as there is pixels in the stack, keep executing
    while (stack.length > 0) {
        // take the last pixel on the stack
        const [x, y] = stack.pop();
        //calculate the index of the pixel in the image data array
        const imageDataIndex = (y * imageData.width + x) * 4;

        // if its found in the checked array, continue with the next pixel
        if (checked.has(`${x}, ${y}`)) {
            continue;
        }
        // check if the pixel is outside of the image
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

        // check if the pixel has the same color as the target color, and if not, still color it in the fillColor
        // this is because of the fuzzy edges of the lines, it helps to make the bucket work a little bit more like its intended
        // its still not perfect tho. i dont know what the solution here is
        if (!colorsMatch(targetColor, getPixelColor(imageData, x, y))) {
            imageData.data[imageDataIndex] = fillColor.r;
            imageData.data[imageDataIndex + 1] = fillColor.g;
            imageData.data[imageDataIndex + 2] = fillColor.b;
            imageData.data[imageDataIndex + 3] = fillColor.a;
            continue;
        }

        // if the pixel passed all the tests, color it in the fill color
        imageData.data[imageDataIndex] = fillColor.r;
        imageData.data[imageDataIndex + 1] = fillColor.g;
        imageData.data[imageDataIndex + 2] = fillColor.b;
        imageData.data[imageDataIndex + 3] = fillColor.a;
        // and add it to the checked array to avoid checking it again
        checked.add(`${x}, ${y}`);

        // add this pictures neighbouring pixels to the stack
        // this would normally be where the function would recursively be called again
        stack.push([x + 1, y]);
        stack.push([x, y + 1]);
        stack.push([x - 1, y]);
        stack.push([x, y - 1]);
    }
    // after all pixels are processed, put the temporary imageDataArray back onto the canvas
    ctx.putImageData(imageData, 0, 0);
}

// set the isdrawing flag back to false
// add an undostep because drawing action is completed and a stroke is done
function stopDrawing() {
    if (isDrawing) {
        addUndoStep();
    }
    isDrawing = false;
}

// simple clear canvas function and reset of undo history
function clearCanvas() {
    undoHistory.length = 0;
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    addUndoStep();
}

// hex code input function
function hexCodeInput() {
    if (this.value.length === 7) {
        selectColor(hexToRGB(this.value));
    }
}

// SECTION: downloadbutton
let downloadButton = document.getElementById("saveCanvas");
downloadButton.addEventListener("click", function () {
    downloadButton.href = canvasEl.toDataURL("image/png");
    downloadButton.download = "My Drawing.png";
});

//SECTION: EVENTlISTENERS
canvasEl.addEventListener("mousedown", useTool);
canvasEl.addEventListener("mousemove", draw);
canvasEl.addEventListener("mouseup", stopDrawing);
canvasEl.addEventListener("mouseout", stopDrawing);
el("#strokeWidth").addEventListener("input", function stroke() {
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
el("#hexColorInput").addEventListener("input", hexCodeInput);

//initialization of the application
initColorPalette();
initToolPalette();
initCanvas();

// extra function to showcase size of undo history array
function estimateArraySizeInMB(array) {
    const jsonString = JSON.stringify(array);
    const bytes = new TextEncoder().encode(jsonString).length;
    const kilobytes = bytes / 1024;
    const megabytes = kilobytes / 1024; // Convert kilobytes to megabytes
    return megabytes;
}
