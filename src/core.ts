import { Vec } from "./vec";
import { StudentTDistribution } from "./studentt";
import { createNoise2D } from "./simplex";
import { PerlinNoise } from "./perlin";

export type RegionSettings = {
  visible: boolean;
  tlx: number;
  tly: number;
  sizew: number;
  sizeh: number;
  radius: number;
  count: number;
  posFn: string;
  dirx: number;
  diry: number;
  color: string;
  tail: number;
};

// Particle position functions -------------------------------------------------
const simplePosFn = (p: Vec) =>
  p.add(new Vec(3 * (0.5 - Math.random()), 3 * (0.5 - Math.random())));

const stillPosFn = (p: Vec) => p;

const cosPosFnY = (p: Vec) => p.add(new Vec(1, Math.cos(p.x / 100)));
const cosPosFnX = (p: Vec) => p.add(new Vec(Math.cos(p.y / 100), 1));
const cosPosFnXY = (p: Vec) =>
  p.add(new Vec(Math.cos(p.y / 100), Math.cos(p.x / 100)));

const tDist = new StudentTDistribution(1.25);
const studenttPosFn = (p: Vec) =>
  p.add(new Vec(tDist.sample(), tDist.sample()));

function dirPosFn(x: number, y: number) {
  const dir = new Vec(x, y);
  return (p: Vec) => p.add(dir);
}

const noise = createNoise2D({ random_dec: Math.random });

const simplexPosFn = (p: Vec) => {
  const scale = 0.02;
  const mag = 1.5;
  const j = Math.random();
  const jumpx = j < 0.1 ? 40 * (Math.random() - 0.5) : 0;
  const jumpy = j < 0.1 ? 40 * (Math.random() - 0.5) : 0;
  const noiseValX = jumpx + mag * noise(scale * p.x, scale * p.y);
  const noiseValY =
    jumpy + mag * noise(scale * p.x + 3.117, scale * p.y + 2.713);
  return p.add(new Vec(noiseValX, noiseValY));
};

const perlin = new PerlinNoise();

function flowFieldPosFn(p: Vec, c?: number) {
  const scale = 0.02;
  const t = (c || 0) / 49.37;
  const theta =
    Math.PI * perlin.noise(scale * p.x, scale * p.y, t + Math.random());
  return p.add(new Vec(Math.cos(theta), Math.sin(theta)));
}

export const movement = (posFn: string, x: number, y: number) => {
  switch (posFn) {
    case "still":
      return stillPosFn;
    case "simple":
      return simplePosFn;
    case "studentt":
      return studenttPosFn;
    case "cosY":
      return cosPosFnY;
    case "cosX":
      return cosPosFnX;
    case "cosXY":
      return cosPosFnXY;
    case "direction":
      return dirPosFn(x, y);
    case "simplex":
      return simplexPosFn;
    case "flowfield":
      return flowFieldPosFn;
    default:
      return stillPosFn;
  }
};

export class Region {
  public radius: number;
  public color: string;
  public bottomLeft: Vec;
  public topRight: Vec;
  public width: number;
  public height: number;
  public count: number;
  public tail: number = 245;
  public positions: Vec[];
  public frameCount: number = 0;
  public posFn: (p: Vec, c?: number) => Vec;

  constructor(
    radius: number,
    color: string,
    bottomLeft: Vec,
    topRight: Vec,
    count: number,
    tail: number,
    posFn: (p: Vec, c?: number) => Vec
  ) {
    this.radius = radius;
    this.color = color;
    this.bottomLeft = bottomLeft;
    this.topRight = topRight;
    this.width = topRight.x - bottomLeft.x;
    this.height = -topRight.y + bottomLeft.y;
    this.count = count;
    this.tail = tail;
    this.positions = Array.from(
      { length: count },
      () =>
        new Vec(
          bottomLeft.x + this.width * Math.random(),
          topRight.y + this.height * Math.random()
        )
    );
    this.posFn = posFn;
    this.frameCount = 0;
  }

  static emptyRegion(): Region {
    return new Region(
      0,
      "black",
      new Vec(0, 0),
      new Vec(0, 0),
      0,
      0,
      simplePosFn
    );
  }

  update() {
    this.frameCount += 1;
    this.positions.forEach((pos, index) => {
      this.positions[index] = this.posFn(pos, this.frameCount);

      if (this.positions[index].x < this.bottomLeft.x + this.radius) {
        this.positions[index].x = this.topRight.x - this.radius;
      }
      if (this.positions[index].x > this.topRight.x - this.radius) {
        this.positions[index].x = this.bottomLeft.x + this.radius;
      }
      if (this.positions[index].y > this.bottomLeft.y - this.radius) {
        this.positions[index].y = this.topRight.y + this.radius;
      }
      if (this.positions[index].y < this.topRight.y + this.radius) {
        this.positions[index].y = this.bottomLeft.y - this.radius;
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = Math.exp(-this.tail / 20);
    ctx.fillRect(
      this.bottomLeft.x,
      this.bottomLeft.y - this.height,
      this.width,
      this.height
    );
    ctx.globalAlpha = 1;
    for (const pos of this.positions) {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.ellipse(pos.x, pos.y, this.radius, this.radius, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
