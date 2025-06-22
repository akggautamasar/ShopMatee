
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface SignaturePadProps {
  width?: number;
  height?: number;
  className?: string;
}

export interface SignaturePadHandle {
  clear: () => void;
  getImageData: () => Promise<Blob | null>;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ width = 300, height = 150, className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      },
      getImageData: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/png');
        });
      },
    }));

    const handleMouseDown = (e: React.MouseEvent) => {
      drawing.current = true;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(
          e.nativeEvent.offsetX,
          e.nativeEvent.offsetY
        );
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.lineTo(
          e.nativeEvent.offsetX,
          e.nativeEvent.offsetY
        );
        ctx.stroke();
      }
    };

    const handleMouseUp = (_e: React.MouseEvent) => {
      drawing.current = false;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      drawing.current = true;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(
          touch.clientX - rect.left,
          touch.clientY - rect.top
        );
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(
          touch.clientX - rect.left,
          touch.clientY - rect.top
        );
        ctx.stroke();
      }
      e.preventDefault();
    };

    const handleTouchEnd = (_e: React.TouchEvent) => {
      drawing.current = false;
    };

    return (
      <div className={`bg-white rounded border p-2 shadow ${className}`}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border rounded cursor-crosshair touch-none bg-white"
          style={{ touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
    );
  }
);

export default SignaturePad;
