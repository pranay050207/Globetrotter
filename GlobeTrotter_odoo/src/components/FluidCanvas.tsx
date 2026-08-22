import React, { useRef, useEffect } from 'react';
import { fluidSimulation } from '../utils/fluidSimulation';

interface FluidCanvasProps {
  className?: string;
}

const FluidCanvas: React.FC<FluidCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroy: (() => void) | undefined;

    try {
      destroy = fluidSimulation(canvas);
    } catch (e) {
      console.warn('WebGL fluid simulation failed to initialize:', e);
    }

    return () => {
      if (destroy) destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full z-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default FluidCanvas;
