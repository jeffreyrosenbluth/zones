import { useRef } from "react";

export default function useCanvasWindow() {
  const newWindowRef = useRef<Window | null>(null);

  const openCanvasWindow = () => {
    // Open a new window
    newWindowRef.current = window.open("", "Canvas", "width=1080,height=1080");

    if (newWindowRef.current) {
      // Add HTML structure
      const doc = newWindowRef.current.document;
      doc.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Canvas Window</title>
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

      doc.close(); // Close the document after writing the HTML

      // Set up canvas after the new window is fully loaded
      newWindowRef.current.onload = () => {
        const canvas = doc.getElementById("canvas") as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          canvas.width = newWindowRef.current?.innerWidth || 1080;
          canvas.height = newWindowRef.current?.innerHeight || 1080;

          // Example animation: bouncing circle
          let x = 100,
            y = 100,
            dx = 2,
            dy = 2;
          function animate() {
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            ctx?.beginPath();
            ctx?.arc(x, y, 30, 0, Math.PI * 2, false);
            ctx!.fillStyle = "blue";
            ctx?.fill();
            ctx?.stroke();
            x += dx;
            y += dy;
            if (x + 30 > canvas.width || x - 30 < 0) dx = -dx;
            if (y + 30 > canvas.height || y - 30 < 0) dy = -dy;
            requestAnimationFrame(animate);
          }
          animate();
        }
      };
    }
  };

  return { openCanvasWindow };
}
