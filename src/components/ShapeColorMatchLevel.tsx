import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ShapeType, ColorType, DraggableShape, TargetShape } from '../types';
import { BASE_SHAPE_SIZE, LEVEL2_COLORS } from '../types';
import { ShapeRenderer, TargetShapeContainer } from './ShapeRenderer';
import './ShapeColorMatchLevel.css';

interface ColoredDraggableShape extends DraggableShape {
  color: ColorType;
}

interface ColoredTargetShape extends TargetShape {
  color: ColorType;
  filledByIds: string[]; // Track all shapes matched to this target
}

interface DragState {
  draggedShapeId: string | null;
  offsetX: number;
  offsetY: number;
}

interface InitialLevelState {
  draggableShapes: ColoredDraggableShape[];
  targetShapes: ColoredTargetShape[];
}

/**
 * Get random position within top area, avoiding UI elements and overlaps
 */
function getRandomPosition(existingShapes: ColoredDraggableShape[] = []): { x: number; y: number } {
  const topArea = document.querySelector('.color-match-top-area') as HTMLElement | null;
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
 * Initialize game stage with shapes based on stage number
 * Stage 1: Squares (3 red, 3 blue, 3 green = 9 total)
 * Stage 2: Circles (3 red, 3 blue, 3 green = 9 total)
 * Stage 3: Triangles (3 red, 3 blue, 3 green = 9 total)
 * Stage 4: Mixed (3 squares, 3 circles, 3 triangles - each in red, blue, green = 9 total)
 */
function initializeStage(stage: number): InitialLevelState {
  const colors: ColorType[] = ['red', 'green', 'blue'];
  let stagesToCreate: ShapeType[] = [];

  if (stage === 1) {
    stagesToCreate = ['square'];
  } else if (stage === 2) {
    stagesToCreate = ['circle'];
  } else if (stage === 3) {
    stagesToCreate = ['triangle'];
  } else if (stage === 4) {
    stagesToCreate = ['square', 'circle', 'triangle'];
  }

  const draggableShapes: ColoredDraggableShape[] = [];
  const targetShapes: ColoredTargetShape[] = [];

  stagesToCreate.forEach((shape) => {
    colors.forEach((color) => {
      // Create 3 pieces of each shape+color combination
      for (let i = 0; i < 3; i++) {
        const coloredShape: ColoredDraggableShape = {
          id: `shape-${shape}-${color}-${Date.now()}-${Math.random()}-${i}`,
          type: shape,
          color,
          position: getRandomPosition(draggableShapes),
          matched: false,
        };
        draggableShapes.push(coloredShape);
      }

      // Only one target per shape+color combination
      targetShapes.push({
        type: shape,
        color,
        position: { x: 0, y: 0 },
        filledByIds: [],
      });
    });
  });

  return { draggableShapes, targetShapes };
}

/**
 * ShapeColorMatchLevel - Level 2: Match shapes with colors
 */
interface ShapeColorMatchLevelProps {
  onComplete?: () => void;
  onBack?: () => void;
  score: number;
  onScoreChange: (score: number) => void;
}

export const ShapeColorMatchLevel: React.FC<ShapeColorMatchLevelProps> = ({
  onComplete,
  onBack,
  score,
  onScoreChange,
}) => {
  const topAreaRef = useRef<HTMLDivElement>(null);
  const bottomAreaRef = useRef<HTMLDivElement>(null);

  const [currentStage, setCurrentStage] = useState(1);
  const [gameState, setGameState] = useState<{
    draggableShapes: ColoredDraggableShape[];
    targetShapes: ColoredTargetShape[];
  }>(() => initializeStage(1));

  const { draggableShapes, targetShapes } = gameState;

  // Debug: log shapes on mount and stage change
  useEffect(() => {
    console.log(`Stage ${currentStage}: ${draggableShapes.length} draggable shapes, ${targetShapes.length} targets`);
  }, [currentStage, draggableShapes.length, targetShapes.length]);

  const updateDraggableShapes = (updater: (prev: ColoredDraggableShape[]) => ColoredDraggableShape[]) => {
    setGameState((prev) => ({
      ...prev,
      draggableShapes: updater(prev.draggableShapes),
    }));
  };

  /**
   * Load a new stage's shapes and reset game state
   */
  const loadStage = useCallback((stageNum: number) => {
    const newState = initializeStage(stageNum);
    setGameState(newState);
  }, []);

  const [dragState, setDragState] = useState<DragState>({
    draggedShapeId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const [draggingOverTarget, setDraggingOverTarget] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const levelStartTimeRef = useRef<number | null>(null);

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
   * Snap dragged shape back to random position
   */
  const snapShapeBack = useCallback((shapeId: string) => {
    updateDraggableShapes((prev) => {
      const otherShapes = prev.filter((s) => s.id !== shapeId);
      return prev.map((shape) =>
        shape.id === shapeId
          ? {
              ...shape,
              position: getRandomPosition(otherShapes),
            }
          : shape
      );
    });
  }, []);

  /**
   * Handle shape drop - check if it matches target
   */
  const handleShapeDrop = useCallback(
    (shapeId: string, clientX: number, clientY: number) => {
      // First, check if this is a valid match WITHOUT updating state
      const checkMatch = () => {
        const shape = draggableShapes.find((s) => s.id === shapeId);
        if (!shape) return null;

        const bottomRect = bottomAreaRef.current?.getBoundingClientRect();
        if (!bottomRect) return null;

        // Get actual target elements from DOM to get real positions
        const targetElements = document.querySelectorAll('.color-target-wrapper');
        let matchedTargetIdx = -1;
        let minDistance = Infinity;

        targetElements.forEach((element, idx) => {
          const targetRect = element.getBoundingClientRect();
          const targetCenterX = targetRect.left + targetRect.width / 2;
          const targetCenterY = targetRect.top + targetRect.height / 2;
          const distance = Math.hypot(clientX - targetCenterX, clientY - targetCenterY);

          if (distance < minDistance) {
            minDistance = distance;
            matchedTargetIdx = idx;
          }
        });

        const MATCH_THRESHOLD = BASE_SHAPE_SIZE * 1.5;
        const targetToMatch = targetShapes[matchedTargetIdx];
        
        // Check if this is a valid match
        const isValidMatch = 
          matchedTargetIdx !== -1 &&
          minDistance <= MATCH_THRESHOLD &&
          targetToMatch?.type === shape.type &&
          (targetToMatch as ColoredTargetShape)?.color === shape.color;
        
        if (isValidMatch) {
          return { matchedTargetIdx, shape };
        }
        
        return null;
      };

      const matchResult = checkMatch();

      if (matchResult) {
        // Valid match - update state
        const { matchedTargetIdx } = matchResult;
        
        setGameState((prev) => ({
          draggableShapes: prev.draggableShapes.map((s) =>
            s.id === shapeId ? { ...s, matched: true } : s
          ),
          targetShapes: prev.targetShapes.map((target, idx) =>
            idx === matchedTargetIdx 
              ? { ...target, filledByIds: [...target.filledByIds, shapeId] } 
              : target
          ),
        }));

        setMatchedCount((prev) => prev + 1);
        onScoreChange(score + 1);
        playSuccessAnimation();
      } else {
        // No match - snap back
        snapShapeBack(shapeId);
      }
    },
    [draggableShapes, targetShapes, playSuccessAnimation, snapShapeBack, score, onScoreChange]
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
    });
  };

  /**
   * Handle pointer move (dragging)
   */
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.draggedShapeId) return;

      const x = e.clientX - dragState.offsetX;
      const y = e.clientY - dragState.offsetY;

      updateDraggableShapes((prev) =>
        prev.map((shape) =>
          shape.id === dragState.draggedShapeId
            ? { ...shape, position: { x, y } }
            : shape
        )
      );

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

  // Progress to next stage or complete when all shapes matched
  useEffect(() => {
    if (matchedCount === 9 && matchedCount > 0) {
      if (currentStage < 4) {
        // Move to next stage after a short delay
        const timer = setTimeout(() => {
          const nextStage = currentStage + 1;
          setCurrentStage(nextStage);
          setMatchedCount(0);
          loadStage(nextStage);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // All 4 stages complete
        setIsLevelComplete(true);
        const timer = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [matchedCount, currentStage, onComplete, loadStage]);

  // Reset timer when stage changes
  useEffect(() => {
    levelStartTimeRef.current = Date.now();
    setElapsedTime(0);
  }, [currentStage]);

  // Timer effect
  useEffect(() => {
    if (isLevelComplete) return;

    // Initialize start time on first render
    if (levelStartTimeRef.current === null) {
      levelStartTimeRef.current = Date.now();
    }

    const timerInterval = setInterval(() => {
      if (levelStartTimeRef.current !== null) {
        const elapsed = Math.floor((Date.now() - levelStartTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [isLevelComplete]);

  return (
    <div className="shape-color-match-level">
      {/* Draggable Shapes - Rendered at root level to allow free movement */}
      {draggableShapes
        .filter((shape) => !shape.matched)
        .map((shape) => (
          <div
            key={shape.id}
            className="draggable-shape"
            style={{
              left: `${shape.position.x}px`,
              top: `${shape.position.y}px`,
              opacity: dragState.draggedShapeId === shape.id ? 0.9 : 1,
              cursor: dragState.draggedShapeId === shape.id ? 'grabbing' : 'grab',
              zIndex: dragState.draggedShapeId === shape.id ? 1000 : 10,
              display: shape.matched ? 'none' : 'flex',
            }}
            onPointerDown={(e) => handlePointerDown(e, shape.id)}
          >
            <ShapeRenderer
              type={shape.type}
              color={LEVEL2_COLORS[shape.color]}
              isDragging={dragState.draggedShapeId === shape.id}
            />
          </div>
        ))}

      {/* Top Area */}
      <div className="color-match-top-area" ref={topAreaRef} />

      {/* Bottom Area - Target Shapes */}
      <div
        className="color-match-bottom-area"
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

          <div className="color-targets-container">
            {targetShapes.map((target, idx) => {
              return (
                <div key={idx} className="color-target-wrapper">
                  <TargetShapeContainer
                    type={target.type}
                    color={LEVEL2_COLORS[target.color]}
                    isDragging={draggingOverTarget}
                  />
                </div>
              );
            })}
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

            {/* Stage Display */}
            <div className="stage-display">
              <div className="stage-label">Stage</div>
              <div className="stage-value">{currentStage}/4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeColorMatchLevel;
