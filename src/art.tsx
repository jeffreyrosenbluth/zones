import { useRef } from "react";
import { Vec } from "./vec";
import { Region, RegionSettings, direction } from "./core";

export default function useCanvasWindow() {
  const newWindowRef = useRef<Window | null>(null);

  const openCanvasWindow = () => {
    const width = screen.width;
    const height = screen.height;
    const windowFeatures = `width=${
      width / 2
    },height=${height},menubar=no,toolbar=no,location=no,status=no`;
    // Open a new window
    newWindowRef.current = window.open("", "_blank", windowFeatures);

    if (newWindowRef.current) {
      // Add HTML structure
      const doc = newWindowRef.current.document;
      doc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Canvas</title>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                overflow: hidden;
                height: 100%;
                width: 100%;
              }
              canvas {
                display: block;
                width: 100vw;
                height: 100vh;
              }
            </style>
          </head>
          <body>
            <canvas id="canvas"></canvas>
          </body>
        </html>
      `);

      doc.close();

      newWindowRef.current.onload = () => {
        const canvas = doc.getElementById("canvas") as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          canvas.width = newWindowRef.current?.innerWidth || 1080;
          canvas.height = newWindowRef.current?.innerHeight || 1080;
          setup(canvas, ctx!, newWindowRef.current!);
        }
      };
    }
  };

  return { openCanvasWindow, newWindowRef };
}

function setup(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  canvasWindow: Window
) {
  let regions: Region[] = [];
  let id: number;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvasWindow.addEventListener("message", (event) => {
    if (event.data && event.data.type === "updateSettings") {
      const settings: RegionSettings[] = event.data.payload;
      regions = settings.map((s) => region(s, resizeCanvas()));
      if (id) {
        cancelAnimationFrame(id);
      }
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      id = window.requestAnimationFrame(draw);
    }
  });

  function resizeCanvas() {
    const windowWidth = canvasWindow.innerWidth || screen.width;
    const windowHeight = canvasWindow.innerHeight || screen.height;

    canvas.width = Math.floor(windowWidth * window.devicePixelRatio);
    canvas.height = Math.floor(windowHeight * window.devicePixelRatio);

    canvas.style.width = windowWidth + "px";
    canvas.style.height = windowHeight + "px";

    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    return new Vec(windowWidth, windowHeight);
  }

  function draw() {
    ctx.fillStyle = "#00000009";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const r of regions) {
      r.update();
      r.draw(ctx);
    }
    id = window.requestAnimationFrame(draw);
  }
}

function region(r: RegionSettings, canvasSize: Vec): Region {
  if (!r.visible) return Region.emptyRegion();
  const bl = new Vec(r.tlx, r.tly + r.sizeh);
  const tr = new Vec(r.tlx + r.sizew, r.tly);
  const blDomain = r.domain === "free" ? new Vec(0, canvasSize.y) : bl;
  const trDomain = r.domain === "free" ? new Vec(canvasSize.x, 0) : tr;
  return new Region(
    r.radius,
    r.color,
    bl,
    tr,
    blDomain,
    trDomain,
    r.count,
    direction(r.posFn, r.dirx, r.diry)
  );
}
