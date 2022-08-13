import * as fs from "fs";
import { CanvasShapeDrawing } from './canvas-shape-drawing';
import { Rectangle } from "../model/shape/rectangle";
import { dataURLtoFileData } from "./utils/data-url";
import { CircleShape } from "../model/shape/circle-shape";
import { HexagonShape } from "../model/shape/hexagon-shape";

describe('CanvasShapeDrawing', () => {
  let canvas: any, ctx: any;
  beforeEach(function () {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    if (!fs.existsSync("test")) {
      fs.mkdirSync('test');
    }
  });

  it('rect', () => {
    let drawing = new CanvasShapeDrawing(ctx);
    drawing.drawRect(new Rectangle(0, 0, 100, 100));
    let canvasElement = drawing.ctx.canvas;

    let image = canvasElement.toDataURL();
    let fileData = dataURLtoFileData(image);

    fs.writeFileSync('./test/rect.png', fileData.data);
  });

  it('path', () => {
    let drawing = new CanvasShapeDrawing(ctx);
    drawing.drawPath([{ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 50, y: 100 }, { x: -50, y: 100 }]);

    let canvasElement = drawing.ctx.canvas;

    let image = canvasElement.toDataURL();
    let fileData = dataURLtoFileData(image);

    fs.writeFileSync('./test/path.png', fileData.data);
  });

  it('circle', () => {
    let drawing = new CanvasShapeDrawing(ctx);
    drawing.drawCircle(new CircleShape(60, 60, 50));

    let canvasElement = drawing.ctx.canvas;

    let image = canvasElement.toDataURL();
    let fileData = dataURLtoFileData(image);

    fs.writeFileSync('./test/circle.png', fileData.data);
  });

  it('hexagon', () => {
    let drawing = new CanvasShapeDrawing(ctx);
    drawing.drawHexagon(new HexagonShape(1, 1, 60, 60));

    let canvasElement = drawing.ctx.canvas;

    let image = canvasElement.toDataURL();
    let fileData = dataURLtoFileData(image);

    fs.writeFileSync('./test/hexagon.png', fileData.data);
  });
});
