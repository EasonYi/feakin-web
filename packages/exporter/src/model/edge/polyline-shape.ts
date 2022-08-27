import { Shape } from "../node";
import { Point } from "../geometry/point";
import { ShapeType } from "../node/base/shape-type";

export class PolylineShape extends Shape {
  private points_: Point[];

  override type = ShapeType.Arrow;

  constructor(points: Point[]) {
    super();
    this.points_ = points;
  }

  override points(): Point[] {
    return this.points_;
  }
}
