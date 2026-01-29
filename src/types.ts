/**
 * Shape type definitions for the early learning game
 */

export type ShapeType = 'circle' | 'square' | 'triangle';
export type ColorType = 'red' | 'green' | 'blue';

export interface Position {
  x: number;
  y: number;
}

export interface DraggableShape {
  id: string;
  type: ShapeType;
  color?: ColorType;
  position: Position;
  matched: boolean;
}

export type GameStage = 
  | 'circle'
  | 'square'
  | 'triangle'
  | 'circle-square'
  | 'all-shapes';

export interface TargetShape {
  type: ShapeType;
  color?: ColorType;
  position: Position;
}

export interface LevelState {
  stage: GameStage;
  draggableShapes: DraggableShape[];
  targetShapes: TargetShape[];
  matchedCount: number;
  totalToMatch: number;
}

// Shape colors for visual variety
export const SHAPE_COLORS = {
  circle: '#FF6B6B',    // Bright red
  square: '#4ECDC4',    // Cyan
  triangle: '#FFE66D',  // Yellow
} as const;

// Level 2 colors
export const LEVEL2_COLORS = {
  red: '#FF4444',
  green: '#44DD44',
  blue: '#4444FF',
} as const;

export const BASE_SHAPE_SIZE = 60; // Base size in pixels for shapes
