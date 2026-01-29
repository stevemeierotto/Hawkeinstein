import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BASE_SHAPE_SIZE } from '../types';
import './NumberMatchLevel.css';

interface DraggableNumber {
  id: string;
  number: number;
  position: { x: number; y: number };
  matched: boolean;
}

interface TargetNumber {
  number: number;
  position: { x: number; y: number };
  filledByIds: string[];
}

interface DragState {
  draggedNumberId: string | null;
  offsetX: number;
  offsetY: number;
}

/**
 * Get random position within top area, avoiding UI elements and overlaps
 */
function getRandomPosition(existingNumbers: DraggableNumber[] = []): { x: number; y: number } {
  const topArea = document.querySelector('.number-match-top-area') as HTMLElement | null;
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

    // Check for overlaps with existing numbers
    isValidPosition = !existingNumbers.some((num) => {
      const dx = position.x - num.position.x;
      const dy = position.y - num.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < MIN_DISTANCE_BETWEEN_OBJECTS;
    });
  }

  return position;
}

/**
 * Create new numbers for a given range
 */
function createNumbersForRange(
  startNumber: number,
  endNumber: number,
  timestamp: number
): { draggableNumbers: DraggableNumber[]; targetNumbers: TargetNumber[] } {
  const draggableNumbers: DraggableNumber[] = [];
  const targetNumbers: TargetNumber[] = [];

  for (let number = startNumber; number <= endNumber; number++) {
    for (let i = 0; i < 3; i++) {
      const draggableNumber: DraggableNumber = {
        id: `number-${number}-${i}-${timestamp}-${Math.random()}`,
        number,
        position: getRandomPosition(draggableNumbers),
        matched: false,
      };
      draggableNumbers.push(draggableNumber);
    }
  }

  for (let number = startNumber; number <= endNumber; number++) {
    targetNumbers.push({
      number,
      position: { x: 0, y: 0 },
      filledByIds: [],
    });
  }

  return { draggableNumbers, targetNumbers };
}

/**
 * Initialize game Stage 1: numbers 0-2 (9 draggable, 3 targets)
 */
function initializeLevel(): { draggableNumbers: DraggableNumber[]; targetNumbers: TargetNumber[] } {
  return createNumbersForRange(0, 2, Date.now());
}

/**
 * NumberMatchLevel - Level 3: Match numbers
 */
interface NumberMatchLevelProps {
  onComplete?: () => void;
  onBack?: () => void;
  score: number;
  onScoreChange: (score: number) => void;
}

export const NumberMatchLevel: React.FC<NumberMatchLevelProps> = ({
  onComplete,
  onBack,
  score,
  onScoreChange,
}) => {
  const topAreaRef = useRef<HTMLDivElement>(null);
  const bottomAreaRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<{
    draggableNumbers: DraggableNumber[];
    targetNumbers: TargetNumber[];
  }>(() => initializeLevel());

  const { draggableNumbers, targetNumbers } = gameState;

  const updateDraggableNumbers = (updater: (prev: DraggableNumber[]) => DraggableNumber[]) => {
    setGameState((prev) => ({
      ...prev,
      draggableNumbers: updater(prev.draggableNumbers),
    }));
  };

  const [dragState, setDragState] = useState<DragState>({
    draggedNumberId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const [draggingOverTarget, setDraggingOverTarget] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const levelStartTimeRef = useRef<number | null>(null);

  const stageConfig = {
    1: { maxNumber: 2, totalMatches: 9 },
    2: { maxNumber: 5, totalMatches: 18 },
    3: { maxNumber: 7, totalMatches: 24 },
    4: { maxNumber: 9, totalMatches: 30 },
  };

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
   * Snap dragged number back to random position
   */
  const snapNumberBack = useCallback((numberId: string) => {
    updateDraggableNumbers((prev) => {
      const otherNumbers = prev.filter((n) => n.id !== numberId);
      return prev.map((num) =>
        num.id === numberId
          ? {
              ...num,
              position: getRandomPosition(otherNumbers),
            }
          : num
      );
    });
  }, []);

  /**
   * Handle number drop - check if it matches target
   */
  const handleNumberDrop = useCallback(
    (numberId: string, clientX: number, clientY: number) => {
      const number = draggableNumbers.find((n) => n.id === numberId);
      if (!number) return;

      const bottomRect = bottomAreaRef.current?.getBoundingClientRect();
      if (!bottomRect) return;

      const targetElements = document.querySelectorAll('.number-target-wrapper');
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
      if (
        matchedTargetIdx !== -1 &&
        minDistance <= MATCH_THRESHOLD &&
        targetNumbers[matchedTargetIdx].number === number.number
      ) {
        setGameState((prev) => ({
          draggableNumbers: prev.draggableNumbers.map((n) =>
            n.id === numberId ? { ...n, matched: true } : n
          ),
          targetNumbers: prev.targetNumbers.map((target, idx) =>
            idx === matchedTargetIdx ? { ...target, filledByIds: [...target.filledByIds, numberId] } : target
          ),
        }));

        setMatchedCount((prev) => prev + 1);
        onScoreChange(score + 1);
        playSuccessAnimation();
      } else {
        snapNumberBack(numberId);
      }
    },
    [draggableNumbers, targetNumbers, playSuccessAnimation, snapNumberBack, score, onScoreChange]
  );

  /**
   * Handle pointer down on draggable number
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, numberId: string) => {
    e.preventDefault();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    setDragState({
      draggedNumberId: numberId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  };

  /**
   * Handle pointer move (dragging)
   */
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.draggedNumberId) return;

      const x = e.clientX - dragState.offsetX;
      const y = e.clientY - dragState.offsetY;

      updateDraggableNumbers((prev) =>
        prev.map((num) =>
          num.id === dragState.draggedNumberId
            ? { ...num, position: { x, y } }
            : num
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
    [dragState.draggedNumberId, dragState.offsetX, dragState.offsetY]
  );

  /**
   * Handle pointer up (drop)
   */
  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragState.draggedNumberId || !bottomAreaRef.current) return;

      const bottomRect = bottomAreaRef.current.getBoundingClientRect();
      const isOverTarget =
        e.clientY >= bottomRect.top &&
        e.clientY <= bottomRect.bottom &&
        e.clientX >= bottomRect.left &&
        e.clientX <= bottomRect.right;

      if (isOverTarget) {
        handleNumberDrop(dragState.draggedNumberId, e.clientX, e.clientY);
      } else {
        snapNumberBack(dragState.draggedNumberId);
      }

      setDragState({
        draggedNumberId: null,
        offsetX: 0,
        offsetY: 0,
      });
      setDraggingOverTarget(false);
    },
    [dragState.draggedNumberId, handleNumberDrop, snapNumberBack]
  );

  // Attach pointer move and up listeners
  useEffect(() => {
    if (dragState.draggedNumberId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragState.draggedNumberId, handlePointerMove, handlePointerUp]);

  // Progress to next stage or complete level
  useEffect(() => {
    const config = stageConfig[currentStage as keyof typeof stageConfig];
    if (!config) return;

    if (matchedCount === config.totalMatches && matchedCount > 0) {
      if (currentStage === 4) {
        // Level complete
        setIsLevelComplete(true);
        const timer = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Move to next stage - add new numbers
        const nextStage = currentStage + 1;
        const nextConfig = stageConfig[nextStage as keyof typeof stageConfig];
        const prevConfig = stageConfig[currentStage as keyof typeof stageConfig];

        const { draggableNumbers: newDraggable, targetNumbers: newTargets } = createNumbersForRange(
          prevConfig.maxNumber + 1,
          nextConfig.maxNumber,
          Date.now()
        );

        setGameState((prev) => ({
          draggableNumbers: [...prev.draggableNumbers, ...newDraggable],
          targetNumbers: newTargets,
        }));

        setCurrentStage(nextStage);
        setElapsedTime(0);
        levelStartTimeRef.current = Date.now();
        onScoreChange(score + 10);
      }
    }
  }, [matchedCount, currentStage]);

  // Initialize timer on mount
  useEffect(() => {
    setElapsedTime(0);
    levelStartTimeRef.current = Date.now();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isLevelComplete) return;

    const timerInterval = setInterval(() => {
      if (levelStartTimeRef.current !== null) {
        const elapsed = Math.floor((Date.now() - levelStartTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }
    }, 100);

    return () => clearInterval(timerInterval);
  }, [isLevelComplete]);

  return (
    <div className="number-match-level">
      {/* Draggable Numbers - Rendered at root level to allow free movement */}
      {draggableNumbers
        .filter((num) => !num.matched)
        .map((num) => (
          <div
            key={num.id}
            className="draggable-number"
            style={{
              left: `${num.position.x}px`,
              top: `${num.position.y}px`,
              opacity: dragState.draggedNumberId === num.id ? 0.9 : 1,
              cursor: dragState.draggedNumberId === num.id ? 'grabbing' : 'grab',
              zIndex: dragState.draggedNumberId === num.id ? 1000 : 10,
              display: 'flex',
            }}
            onPointerDown={(e) => handlePointerDown(e, num.id)}
          >
            <div className="number-display">{num.number}</div>
          </div>
        ))}

      {/* Top Area */}
      <div className="number-match-top-area" ref={topAreaRef} />

      {/* Bottom Area - Target Numbers */}
      <div
        className="number-match-bottom-area"
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

          <div className="number-targets-container">
            {targetNumbers.map((target, idx) => {
              return (
                <div key={idx} className="number-target-wrapper">
                  <div className="target-number">
                    <div className="target-number-display">{target.number}</div>
                  </div>
                  {target.filledByIds.length > 0 && (
                    <div className="placed-numbers-count">✓</div>
                  )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberMatchLevel;
