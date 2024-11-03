import React, { useRef, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const Canvas = ({ roomId, socket }: { roomId: string; socket: Socket }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext("2d");
    if (context === null) return;

    // Set canvas size
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    // Set initial canvas properties
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("draw", (data) => {
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const context = canvas.getContext("2d");
      if (context === null) return;

      context.beginPath();
      context.moveTo(data.startX, data.startY);
      context.lineTo(data.endX, data.endY);
      context.strokeStyle = data.color;
      context.lineWidth = data.lineWidth;
      context.stroke();
      context.closePath();
    });

    return () => {
      socket.off("draw");
    };
  }, [socket]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    if (canvas === null) return;
    const context = canvas.getContext("2d");
    if (context === null) return;
    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas === null) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext("2d");
    if (context === null) return;
    context.lineTo(x, y);
    context.stroke();

    // Emit drawing data
    socket.emit("draw", {
      roomId,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color,
      lineWidth,
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4 mb-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="color-picker"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          className="w-32"
        />
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas === null) return;
            const context = canvas.getContext("2d");
            if (context === null) return;
            context.clearRect(0, 0, canvas.width, canvas.height);
            socket.emit("clear", { roomId });
          }}
          className="px-3 py-1 bg-red-600 rounded-lg text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-7"
            viewBox="0 0 32 32"
          >
            <path
              fill="currentColor"
              d="M26 20h-6v-2h6zm4 8h-6v-2h6zm-2-4h-6v-2h6z"
            />
            <path
              fill="currentColor"
              d="M17.003 20a4.895 4.895 0 0 0-2.404-4.173L22 3l-1.73-1l-7.577 13.126a5.699 5.699 0 0 0-5.243 1.503C3.706 20.24 3.996 28.682 4.01 29.04a1 1 0 0 0 1 .96h14.991a1 1 0 0 0 .6-1.8c-3.54-2.656-3.598-8.146-3.598-8.2Zm-5.073-3.003A3.11 3.11 0 0 1 15.004 20c0 .038.002.208.017.469l-5.9-2.624a3.8 3.8 0 0 1 2.809-.848ZM15.45 28A5.2 5.2 0 0 1 14 25h-2a6.5 6.5 0 0 0 .968 3h-2.223A16.617 16.617 0 0 1 10 24H8a17.342 17.342 0 0 0 .665 4H6c.031-1.836.29-5.892 1.803-8.553l7.533 3.35A13.025 13.025 0 0 0 17.596 28Z"
            />
          </svg>
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        className="border border-gray-300 rounded-2xl bg-white"
      />
    </div>
  );
};

export default Canvas;
