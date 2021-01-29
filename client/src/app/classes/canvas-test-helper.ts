const WIDTH = 100;
const HEIGHT = 100;

const baseCanvas = document.createElement('canvas');
baseCanvas.width = WIDTH;
baseCanvas.height = HEIGHT;

const previewCanvas = document.createElement('canvas');
previewCanvas.width = WIDTH;
previewCanvas.height = HEIGHT;

const selectionCanvas = document.createElement('canvas');
selectionCanvas.width = WIDTH;
selectionCanvas.height = HEIGHT;

const canvasTestHelper = { baseCanvas, previewCanvas, selectionCanvas };

export { canvasTestHelper };
