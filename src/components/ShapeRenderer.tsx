import React from 'react';
import type { ShapeType } from '../types';
import { BASE_SHAPE_SIZE, SHAPE_COLORS } from '../types';

interface ShapeRendererProps {
  type: ShapeType;
  size?: number;
  color?: string;
  isDragging?: boolean;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
  type,
  size = BASE_SHAPE_SIZE,
  color = SHAPE_COLORS[type],
  isDragging = false,
}) => {
  const opacity = isDragging ? 0.7 : 1;

  if (type === 'circle') {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ opacity, cursor: 'grab', userSelect: 'none' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill={color}
          stroke="#333"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (type === 'square') {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ opacity, cursor: 'grab', userSelect: 'none' }}
      >
        <rect
          x="2"
          y="2"
          width={size - 4}
          height={size - 4}
          fill={color}
          stroke="#333"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (type === 'triangle') {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ opacity, cursor: 'grab', userSelect: 'none' }}
      >
        <polygon
          points={`${size / 2},2 ${size - 2},${size - 2} 2,${size - 2}`}
          fill={color}
          stroke="#333"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return null;
};

interface ShapeContainerProps {
  type: ShapeType;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  isDragging?: boolean;
  children?: React.ReactNode;
}

/**
 * Target shape container with visual border indicator
 */
export const TargetShapeContainer: React.FC<ShapeContainerProps> = ({
  type,
  size = BASE_SHAPE_SIZE * 1.5,
  color,
  style,
  isDragging,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        backgroundColor: isDragging ? 'rgba(200, 200, 200, 0.3)' : 'rgba(255, 255, 255, 0.2)',
        border: '3px dashed rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      <ShapeRenderer type={type} size={size - 20} color={color} />
    </div>
  );
};
