import { Rectangle } from "../model/shapes/rectangle";
import { SvgShapeDrawing } from "./svg-shape-drawing";

describe('SvgShapeDrawing', () => {
  let svg: SVGElement;

  beforeEach(function () {
    svg = document.createElement('svg') as unknown as SVGElement;
  });

  it('initWrapper', () => {
    let drawing = new SvgShapeDrawing(svg);
    let element = drawing.initSvgWrapper();

    expect(element.tagName).toBe('svg');
    expect(element.innerHTML).toBe('');
  });

  it('rect', () => {
    let drawing = new SvgShapeDrawing(svg as SVGElement);
    drawing.drawRect(new Rectangle(0, 0, 100, 100));

    expect(svg.innerHTML).toBe('<rect x="0" y="0" width="100" height="100"></rect>');
  });

  it('path', () => {
    let drawing = new SvgShapeDrawing(svg as SVGElement);
    drawing.drawPath([{ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 50, y: 100 }, { x: -50, y: 100 }]);

    expect(svg.innerHTML).toBe('<path d="M0,0 L50,50 L50,100 L-50,100" stroke="#000000" stroke-width="1" stroke-opacity="1"></path>');

    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svg);
    expect(str).toBe(`<svg xmlns="http://www.w3.org/1999/xhtml"><path xmlns="&quot;http://www.w3.org/1999/xhtml&quot;" d="M0,0 L50,50 L50,100 L-50,100" stroke="#000000" stroke-width="1" stroke-opacity="1"/></svg>`);
  });
});
