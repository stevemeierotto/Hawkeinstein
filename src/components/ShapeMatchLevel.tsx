import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ShapeType,
  GameStage,
  DraggableShape,
  TargetShape,
  LevelState,
} from '../types';
import { BASE_SHAPE_SIZE } from '../types';
import { ShapeRenderer, TargetShapeContainer } from './ShapeRenderer';
import './ShapeMatchLevel.css';

interface DragState {
  draggedShapeId: string | null;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
}

/**
 * Get shape types for current stage
 */
function getShapeTypesForStage(stage: GameStage): ShapeType[] {
  switch (stage) {
    case 'circle':
      return ['circle', 'circle', 'circle'];
    case 'square':
      return ['square', 'square', 'square'];
    case 'triangle':
      return ['triangle', 'triangle', 'triangle'];
    case 'circle-square':
      return ['circle', 'circle', 'square', 'square'];
    case 'all-shapes':
      return ['circle', 'square', 'triangle', 'circle', 'square', 'triangle'];
    default:
      return ['circle', 'circle', 'circle'];
  }
}

/**
 * Get target shapes for current stage
 */
function getTargetShapesForStage(stage: GameStage): TargetShape[] {
  const basePosition = { x: 0, y: 0 };

  switch (stage) {
    case 'circle':
      return [{ type: 'circle', position: basePosition }];
    case 'square':
      return [{ type: 'square', position: basePosition }];
    case 'triangle':
      return [{ type: 'triangle', position: basePosition }];
    case 'circle-square':
      return [
        { type: 'circle', position: { x: -80, y: 0 } },
        { type: 'square', position: { x: 80, y: 0 } },
      ];
    case 'all-shapes':
      return [
        { type: 'circle', position: { x: -120, y: 0 } },
        { type: 'square', position: { x: 0, y: 0 } },
        { type: 'triangle', position: { x: 120, y: 0 } },
      ];
    default:
      return [{ type: 'circle', position: basePosition }];
  }
}

/**
 * Get random position within top area, avoiding UI elements and overlaps
 */
function getRandomPosition(existingShapes: DraggableShape[] = []): { x: number; y: number } {
  const topArea = document.querySelector('.top-area') as HTMLElement | null;
  const PADDING = 20;
  const RESERVED_TOP = 180; // Space for back button and score/timer
  const RESERVED_RIGHT = 200; // Space for score and timer displays
  const MIN_DISTANCE_BETWEEN_OBJECTS = BASE_SHAPE_SIZE + 30; // Minimum gap between objects
  const MAX_ATTEMPTS = 50;

  let position = { x: 0, y: 0 };
  let isValidPosition = false;
  let attempts = 0;

  while (!isValidPosition && attempts < MAX_ATTEMPTS) {
    attempts++;

    if (topArea && topArea.clientWidth > 100 && topArea.clientHeight > 100) {
      // Calculate available space excluding UI elements
      const maxX = Math.max(topArea.clientWidth - BASE_SHAPE_SIZE - PADDING - RESERVED_RIGHT, 0);
      const maxY = Math.max(topArea.clientHeight - BASE_SHAPE_SIZE - PADDING, 0);
      const minY = RESERVED_TOP;

      position = {
        x: Math.random() * maxX + PADDING,
        y: Math.random() * (maxY - minY) + minY,
      };
    } else {
      // Fallback to viewport-based positioning
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight * 0.75;

      const maxX = Math.max(viewportWidth - BASE_SHAPE_SIZE - PADDING - RESERVED_RIGHT, 0);
      const maxY = Math.max(viewportHeight - BASE_SHAPE_SIZE - PADDING, 0);
      const minY = RESERVED_TOP;

      position = {
        x: Math.random() * maxX + PADDING,
        y: Math.random() * (maxY - minY) + minY,
      };
    }

    // Check for overlaps with existing shapes
    isValidPosition = !existingShapes.some((shape) => {
      const dx = position.x - shape.position.x;
      const dy = position.y - shape.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < MIN_DISTANCE_BETWEEN_OBJECTS;
    });
  }

  return position;
}

/**
 * Generate draggable shapes with random positions
 */
function generateDraggableShapes(
  types: ShapeType[]
): DraggableShape[] {
  const shapes: DraggableShape[] = [];
  types.forEach((type, index) => {
    const shape: DraggableShape = {
      id: `shape-${Date.now()}-${index}`,
      type,
      position: getRandomPosition(shapes),
      matched: false,
    };
    shapes.push(shape);
  });
  return shapes;
}

/**
 * Initialize game level with appropriate shapes
 */
function initializeLevel(
  stage: GameStage
): LevelState {
  const shapeTypes = getShapeTypesForStage(stage);
  const targetShapes = getTargetShapesForStage(stage);
  const draggableShapes = generateDraggableShapes(shapeTypes);

  return {
    stage,
    draggableShapes,
    targetShapes,
    matchedCount: 0,
    totalToMatch: draggableShapes.length,
  };
}

/**
 * ShapeMatchLevel - Main game component for Shape Recognition Level 1
 */
interface ShapeMatchLevelProps {
  levelNumber?: number;
  onComplete?: () => void;
  onBack?: () => void;
  score: number;
  onScoreChange: (score: number) => void;
}

export const ShapeMatchLevel: React.FC<ShapeMatchLevelProps> = ({
  onComplete,
  onBack,
  score,
  onScoreChange,
}) => {
  const topAreaRef = useRef<HTMLDivElement>(null);
  const bottomAreaRef = useRef<HTMLDivElement>(null);

  const [levelState, setLevelState] = useState<LevelState>(() =>
    initializeLevel('circle')
  );
  const [dragState, setDragState] = useState<DragState>({
    draggedShapeId: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  });
  const [draggingOverTarget, setDraggingOverTarget] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const levelStartTimeRef = useRef<number>(Date.now());

  /**
   * Play success animation/sound
   */
  const playSuccessAnimation = useCallback(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch {
      console.log('Audio context not available');
    }
  }, []);

  /**
   * Progress to the next stage
   */
  const progressToNextStage = useCallback(() => {
    const stageProgression: GameStage[] = [
      'circle',
      'square',
      'triangle',
      'circle-square',
      'all-shapes',
    ];
    const currentIndex = stageProgression.indexOf(levelState.stage);
    const isLastStage = currentIndex === stageProgression.length - 1;

    if (isLastStage) {
      // Level complete - call onComplete callback
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } else {
      const nextStage = stageProgression[currentIndex + 1];
      setLevelState(initializeLevel(nextStage));
    }
  }, [levelState.stage, onComplete]);

  /**
   * Snap dragged shape back to original position
   */
  const snapShapeBack = useCallback((shapeId: string) => {
    setLevelState((prev) => {
      const otherShapes = prev.draggableShapes.filter((s) => s.id !== shapeId);
      return {
        ...prev,
        draggableShapes: prev.draggableShapes.map((shape) =>
          shape.id === shapeId
            ? {
                ...shape,
                position: getRandomPosition(otherShapes),
              }
            : shape
        ),
      };
    });
  }, []);

  /**
   * Handle shape drop - check if it matches target
   */
  const handleShapeDrop = useCallback(
    (shapeId: string, clientX: number, clientY: number) => {
      const shape = levelState.draggableShapes.find((s) => s.id === shapeId);
      if (!shape) return;

      const bottomRect = bottomAreaRef.current?.getBoundingClientRect();
      if (!bottomRect) return;

      let matchedTarget: TargetShape | null = null;
      let minDistance = Infinity;

      levelState.targetShapes.forEach((target) => {
        const targetCenterX = bottomRect.left + target.position.x + bottomRect.width / 2;
        const targetCenterY = bottomRect.top + target.position.y + bottomRect.height / 2;
        const distance = Math.hypot(clientX - targetCenterX, clientY - targetCenterY);

        if (distance < minDistance) {
          minDistance = distance;
          matchedTarget = target;
        }
      });

      const MATCH_THRESHOLD = BASE_SHAPE_SIZE * 1.5;
      if (
        matchedTarget &&
        minDistance <= MATCH_THRESHOLD &&
        (matchedTarget as TargetShape).type === shape.type
      ) {
        setLevelState((prev) => ({
          ...prev,
          draggableShapes: prev.draggableShapes.map((s) =>
            s.id === shapeId ? { ...s, matched: true } : s
          ),
          matchedCount: prev.matchedCount + 1,
        }));
        onScoreChange(score + 1);
        playSuccessAnimation();
      } else {
        snapShapeBack(shapeId);
      }
    },
    [levelState.draggableShapes, levelState.targetShapes, snapShapeBack, playSuccessAnimation, score, onScoreChange]
  );

  /**
   * Handle pointer down on draggable shape
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, shapeId: string) => {
    e.preventDefault();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    setDragState({
      draggedShapeId: shapeId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: rect.left,
      startY: rect.top,
    });
  };

  /**
   * Handle pointer move (dragging)
   */
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.draggedShapeId) return;

      // Calculate position relative to viewport
      const x = e.clientX - dragState.offsetX;
      const y = e.clientY - dragState.offsetY;

      setLevelState((prev) => ({
        ...prev,
        draggableShapes: prev.draggableShapes.map((shape) =>
          shape.id === dragState.draggedShapeId
            ? { ...shape, position: { x, y } }
            : shape
        ),
      }));

      if (bottomAreaRef.current) {
        const bottomRect = bottomAreaRef.current.getBoundingClientRect();
        const isOverBottom =
          e.clientY >= bottomRect.top &&
          e.clientY <= bottomRect.bottom &&
          e.clientX >= bottomRect.left &&
          e.clientX <= bottomRect.right;
        setDraggingOverTarget(isOverBottom);
      }
    },
    [dragState.draggedShapeId, dragState.offsetX, dragState.offsetY]
  );

  /**
   * Handle pointer up (drop)
   */
  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragState.draggedShapeId || !bottomAreaRef.current) return;

      const bottomRect = bottomAreaRef.current.getBoundingClientRect();
      const isOverTarget =
        e.clientY >= bottomRect.top &&
        e.clientY <= bottomRect.bottom &&
        e.clientX >= bottomRect.left &&
        e.clientX <= bottomRect.right;

      if (isOverTarget) {
        handleShapeDrop(dragState.draggedShapeId, e.clientX, e.clientY);
      } else {
        snapShapeBack(dragState.draggedShapeId);
      }

      setDragState({
        draggedShapeId: null,
        offsetX: 0,
        offsetY: 0,
        startX: 0,
        startY: 0,
      });
      setDraggingOverTarget(false);
    },
    [dragState.draggedShapeId, handleShapeDrop, snapShapeBack]
  );

  // Attach pointer move and up listeners
  useEffect(() => {
    if (dragState.draggedShapeId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragState.draggedShapeId, handlePointerMove, handlePointerUp]);

  // Progress to next stage when all shapes matched
  useEffect(() => {
    if (levelState.matchedCount === levelState.totalToMatch && levelState.totalToMatch > 0) {
      setIsLevelComplete(true);
      playSuccessAnimation();
      const timer = setTimeout(() => {
        progressToNextStage();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [levelState.matchedCount, levelState.totalToMatch, playSuccessAnimation, progressToNextStage]);

  // Timer effect
  useEffect(() => {
    if (isLevelComplete) return;

    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - levelStartTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 100);

    return () => clearInterval(timerInterval);
  }, [isLevelComplete]);

  // Reset timer when stage changes
  useEffect(() => {
    setElapsedTime(0);
    levelStartTimeRef.current = Date.now();
    setIsLevelComplete(false);
  }, [levelState.stage]);

  return (
    <div className="shape-match-level">
      {/* Draggable Shapes - Rendered at root level to allow free movement */}
      {levelState.draggableShapes
        .filter((shape) => !shape.matched)
        .map((shape) => (
          <div
            key={shape.id}
            className="draggable-shape"
            style={{
              left: `${shape.position.x}px`,
              top: `${shape.position.y}px`,
              opacity: dragState.draggedShapeId === shape.id ? 0.9 : 1,
              cursor: 'grab',
              zIndex: dragState.draggedShapeId === shape.id ? 1000 : 10,
            }}
            onPointerDown={(e) => handlePointerDown(e, shape.id)}
          >
            <ShapeRenderer
              type={shape.type}
              isDragging={dragState.draggedShapeId === shape.id}
            />
          </div>
        ))}

      {/* Top Area */}
      <div className="top-area" ref={topAreaRef} />

      {/* Bottom Area - Target Shapes */}
      <div
        className="bottom-area"
        ref={bottomAreaRef}
        style={{
          backgroundColor: draggingOverTarget ? 'rgba(200, 200, 255, 0.1)' : 'transparent',
        }}
      >
        <div className="home-row">
          {/* Back Button */}
          {onBack && (
            <button className="back-button" onClick={onBack} title="Back to map">
              ← Back
            </button>
          )}

          <div className="targets-container">
            {levelState.targetShapes.map((target, idx) => (
              <div key={idx} className="target-wrapper">
                <TargetShapeContainer
                  type={target.type}
                  isDragging={draggingOverTarget}
                />
              </div>
            ))}
          </div>

          <div className="home-row-right">
            {/* Score Display */}
            <div className="score-display">
              <div className="score-label">Score</div>
              <div className="score-value">{score}</div>
            </div>

            {/* Timer Display */}
            <div className={`timer-display ${elapsedTime > 60 ? 'overtime' : ''}`}>
              <div className="timer-value">{elapsedTime}s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeMatchLevel;
