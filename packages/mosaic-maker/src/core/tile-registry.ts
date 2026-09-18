export type Shape =
  | { type: "circle"; cx: number; cy: number; r: number; colorIndex: number }
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      colorIndex: number;
    }
  | { type: "path"; d: string; colorIndex: number }
  | { type: "polygon"; points: string; colorIndex: number };

export interface TileDefinition {
  shapes: Shape[];
}

export const TILE_REGISTRY: Record<string, TileDefinition> = {
  Square: {
    shapes: [
      { type: "rect", x: 0, y: 0, width: 50, height: 50, colorIndex: 1 },
      { type: "rect", x: 50, y: 0, width: 50, height: 50, colorIndex: 2 },
      { type: "rect", x: 0, y: 50, width: 50, height: 50, colorIndex: 3 },
      { type: "rect", x: 50, y: 50, width: 50, height: 50, colorIndex: 4 },
    ],
  },
  CornerCircles: {
    shapes: [
      { type: "rect", x: 0, y: 0, width: 100, height: 100, colorIndex: 0 },
      { type: "path", d: "M 0 0 L 50 0 A 50 50 0 0 1 0 50 Z", colorIndex: 1 },
      {
        type: "path",
        d: "M 100 100 L 50 100 A 50 50 0 0 1 100 50 Z",
        colorIndex: 2,
      },
    ],
  },
  OppositeCircles: {
    shapes: [
      { type: "rect", x: 0, y: 0, width: 100, height: 100, colorIndex: 0 },
      { type: "path", d: "M 0 0 A 50 50 0 0 1 0 100 Z", colorIndex: 1 },
      { type: "path", d: "M 100 0 A 50 50 0 0 0 100 100 Z", colorIndex: 2 },
    ],
  },
  MiddleCircle: {
    shapes: [
      { type: "rect", x: 0, y: 0, width: 100, height: 100, colorIndex: 0 },
      { type: "path", d: "M 50 25 A 25 25 0 0 0 50 75 Z", colorIndex: 1 },
      { type: "path", d: "M 50 25 A 25 25 0 0 1 50 75 Z", colorIndex: 2 },
    ],
  },
  Diamond: {
    shapes: [
      { type: "rect", x: 0, y: 0, width: 100, height: 100, colorIndex: 0 },
      { type: "polygon", points: "50,0 100,0 100,50", colorIndex: 1 },
      { type: "polygon", points: "100,50 100,100 50,100", colorIndex: 2 },
      { type: "polygon", points: "50,100 0,100 0,50", colorIndex: 3 },
      { type: "polygon", points: "0,50 0,0 50,0", colorIndex: 4 },
    ],
  },
  Triangles: {
    shapes: [
      { type: "polygon", points: "0,0 100,0 50,50", colorIndex: 1 },
      { type: "polygon", points: "100,0 100,100 50,50", colorIndex: 2 },
      { type: "polygon", points: "100,100 0,100 50,50", colorIndex: 3 },
      { type: "polygon", points: "0,100 0,0 50,50", colorIndex: 4 },
    ],
  },
  Cube: {
    shapes: [
      { type: "rect", x: 0, y: 0, width: 100, height: 100, colorIndex: 0 },
      { type: "polygon", points: "0,0 100,0 50,50", colorIndex: 1 },
      { type: "polygon", points: "0,0 50,50 0,100", colorIndex: 1 },
      { type: "polygon", points: "100,0 100,100 50,50", colorIndex: 2 },
      { type: "polygon", points: "0,100 100,100 50,50", colorIndex: 2 },
      { type: "rect", x: 0, y: 50, width: 50, height: 50, colorIndex: 3 },
    ],
  },
  Rainbow: {
    shapes: [
      { type: "rect", x: 0, y: 0, width: 100, height: 100, colorIndex: 0 },
      {
        type: "path",
        d: "M 0 0 L 100 0 A 100 100 0 0 1 0 100 Z",
        colorIndex: 1,
      },
      { type: "path", d: "M 0 0 L 50 0 A 50 50 0 0 1 0 50 Z", colorIndex: 2 },
    ],
  },
};
