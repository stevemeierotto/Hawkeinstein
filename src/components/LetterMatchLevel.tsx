import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BASE_SHAPE_SIZE } from '../types';
import './LetterMatchLevel.css';

interface DraggableLetter {
  id: string;
  letter: string;
  position: { x: number; y: number };
  matched: boolean;
}

interface TargetLetter {
  letter: string;
  position: { x: number; y: number };
  filledByIds: string[];
}

interface DragState {
  draggedLetterId: string | null;
  offsetX: number;
  offsetY: number;
}

/**
 * Get random position within top area, avoiding UI elements and overlaps
 */
function getRandomPosition(existingLetters: DraggableLetter[] = []): { x: number; y: number } {
  const topArea = document.querySelector('.letter-match-top-area') as HTMLElement | null;
  const PADDING = 20;
  const RESERVED_TOP = 180; // Space for back button and score/timer
  const RESERVED_RIGHT = 280; // Space for score, timer, and stage indicator
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

    // Check for overlaps with existing letters
    isValidPosition = !existingLetters.some((letter) => {
      const dx = position.x - letter.position.x;
      const dy = position.y - letter.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < MIN_DISTANCE_BETWEEN_OBJECTS;
    });
  }

  return position;
}

/**
 * Create new letters for a given range
 */
function createLettersForRange(
  letters: string[],
  timestamp: number
): { draggableLetters: DraggableLetter[]; targetLetters: TargetLetter[] } {
  const draggableLetters: DraggableLetter[] = [];
  const targetLetters: TargetLetter[] = [];

  for (const letter of letters) {
    for (let i = 0; i < 3; i++) {
      const draggableLetter: DraggableLetter = {
        id: `letter-${letter}-${i}-${timestamp}-${Math.random()}`,
        letter,
        position: getRandomPosition(draggableLetters),
        matched: false,
      };
      draggableLetters.push(draggableLetter);
    }
  }

  for (const letter of letters) {
    targetLetters.push({
      letter,
      position: { x: 0, y: 0 },
      filledByIds: [],
    });
  }

  return { draggableLetters, targetLetters };
}

/**
 * Initialize game Stage 1: letters A, B, C (9 draggable, 3 targets)
 */
function initializeLevel(): { draggableLetters: DraggableLetter[]; targetLetters: TargetLetter[] } {
  return createLettersForRange(['A', 'B', 'C'], Date.now());
}

/**
 * LetterMatchLevel - Level 4: Match letters
 */
interface LetterMatchLevelProps {
  onComplete?: () => void;
  onBack?: () => void;
  score: number;
  onScoreChange: (score: number) => void;
}

export const LetterMatchLevel: React.FC<LetterMatchLevelProps> = ({
  onComplete,
  onBack,
  score,
  onScoreChange,
}) => {
  const topAreaRef = useRef<HTMLDivElement>(null);
  const bottomAreaRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<{
    draggableLetters: DraggableLetter[];
    targetLetters: TargetLetter[];
  }>(() => initializeLevel());

  const { draggableLetters, targetLetters } = gameState;

  const updateDraggableLetters = (updater: (prev: DraggableLetter[]) => DraggableLetter[]) => {
    setGameState((prev) => ({
      ...prev,
      draggableLetters: updater(prev.draggableLetters),
    }));
  };

  const [dragState, setDragState] = useState<DragState>({
    draggedLetterId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const [matchedCount, setMatchedCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const levelStartTimeRef = useRef<number | null>(null);

  type StageConfigType = Record<number, { letters: string[]; totalMatches: number }>;

  const stageConfig: StageConfigType = {
    1: { letters: ['A', 'B', 'C'], totalMatches: 9 },
    2: { letters: ['D', 'E', 'F'], totalMatches: 9 },
    3: { letters: ['G', 'H', 'I'], totalMatches: 9 },
    4: { letters: ['J', 'K', 'L'], totalMatches: 9 },
    5: { letters: ['M', 'N', 'O'], totalMatches: 9 },
    6: { letters: ['P', 'Q', 'R'], totalMatches: 9 },
    7: { letters: ['S', 'T', 'U'], totalMatches: 9 },
    8: { letters: ['V', 'W', 'X'], totalMatches: 9 },
    9: { letters: ['Y', 'Z'], totalMatches: 6 },
  };

  /**
   * Play success animation/sound
   */
  const playSuccessAnimation = useCallback(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);

      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio context not available, continue silently
    }
  }, []);

  /**
   * Get current stage configuration
   */
  const currentStageConfig = stageConfig[currentStage];

  /**
   * Initialize new stage
   */
  const initializeStage = useCallback((stage: number) => {
    const stageLetters = stageConfig[stage]?.letters || ['A', 'B', 'C'];
    setGameState(createLettersForRange(stageLetters, Date.now()));
    setMatchedCount(0);
    levelStartTimeRef.current = Date.now();
  }, []);

  /**
   * Timer effect
   */
  useEffect(() => {
    if (isLevelComplete) return;

    const timer = setInterval(() => {
      if (levelStartTimeRef.current) {
        setElapsedTime(Math.floor((Date.now() - levelStartTimeRef.current) / 1000));
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isLevelComplete]);

  /**
   * Check if stage is complete
   */
  useEffect(() => {
    if (!currentStageConfig) return;
    
    if (matchedCount === currentStageConfig.totalMatches && matchedCount > 0) {
      if (currentStage === 9) {
        // Final stage complete
        setIsLevelComplete(true);
        playSuccessAnimation();
        if (onComplete) {
          const points = Math.max(0, 1000 - elapsedTime * 5);
          onScoreChange(score + points);
          setTimeout(onComplete, 800);
        }
      } else {
        // Move to next stage
        playSuccessAnimation();
        setTimeout(() => {
          setCurrentStage(currentStage + 1);
          initializeStage(currentStage + 1);
        }, 600);
      }
    }
  }, [matchedCount, currentStage, currentStageConfig.totalMatches, onComplete, score, elapsedTime, playSuccessAnimation, onScoreChange, initializeStage]);

  /**
   * Handle mouse down on draggable letter
   */
  const handleMouseDownLetter = useCallback((e: React.PointerEvent<HTMLDivElement>, letterId: string) => {
    e.preventDefault();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    setDragState({
      draggedLetterId: letterId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  }, []);

  /**
   * Handle mouse move (drag)
   */
  const handleMouseMove = useCallback((e: PointerEvent) => {
    if (dragState.draggedLetterId === null) return;

    const x = e.clientX - dragState.offsetX;
    const y = e.clientY - dragState.offsetY;

    updateDraggableLetters((prev) =>
      prev.map((l) =>
        l.id === dragState.draggedLetterId
          ? { ...l, position: { x, y } }
          : l
      )
    );

    if (bottomAreaRef.current) {
      const bottomRect = bottomAreaRef.current.getBoundingClientRect();
      const isOverBottom =
        e.clientY >= bottomRect.top &&
        e.clientY <= bottomRect.bottom &&
        e.clientX >= bottomRect.left &&
        e.clientX <= bottomRect.right;
      // Update visual feedback if needed
      void isOverBottom;
    }
  }, [dragState.draggedLetterId, dragState.offsetX, dragState.offsetY]);

  /**
   * Handle mouse up (drop)
   */
  const handleMouseUp = useCallback(() => {
    if (dragState.draggedLetterId === null) return;

    const letter = draggableLetters.find((l) => l.id === dragState.draggedLetterId);
    if (!letter || !bottomAreaRef.current) {
      setDragState({ draggedLetterId: null, offsetX: 0, offsetY: 0 });
      return;
    }

    const bottomRect = bottomAreaRef.current.getBoundingClientRect();
    const draggedLetterRect = document.querySelector(`[data-letter-id="${dragState.draggedLetterId}"]`)?.getBoundingClientRect();
    
    if (!draggedLetterRect) {
      setDragState({ draggedLetterId: null, offsetX: 0, offsetY: 0 });
      return;
    }

    const letterCenterX = draggedLetterRect.left + draggedLetterRect.width / 2;
    const letterCenterY = draggedLetterRect.top + draggedLetterRect.height / 2;

    const isOverBottom =
      letterCenterY >= bottomRect.top &&
      letterCenterY <= bottomRect.bottom &&
      letterCenterX >= bottomRect.left &&
      letterCenterX <= bottomRect.right;

    if (isOverBottom) {
      // Find closest target
      let closestTarget: TargetLetter | null = null;
      let minDistance = Infinity;

      for (let i = 0; i < targetLetters.length; i++) {
        const target = targetLetters[i];
        const targetRect = document.getElementById(`target-letter-${target.letter}`) as HTMLElement | null;
        if (targetRect) {
          const targetCenterX = targetRect.getBoundingClientRect().left + targetRect.clientWidth / 2;
          const targetCenterY = targetRect.getBoundingClientRect().top + targetRect.clientHeight / 2;
          const distance = Math.hypot(letterCenterX - targetCenterX, letterCenterY - targetCenterY);

          if (distance < minDistance && distance < 150) {
            minDistance = distance;
            closestTarget = target;
          }
        }
      }

      if (closestTarget && closestTarget.letter === letter.letter) {
        // Match found
        const draggedId = dragState.draggedLetterId;
        const matchedLetter = closestTarget.letter;

        setGameState({
          draggableLetters: draggableLetters.map((l) => (l.id === draggedId ? { ...l, matched: true } : l)),
          targetLetters: targetLetters.map((t) =>
            t.letter === matchedLetter ? { ...t, filledByIds: [...t.filledByIds, draggedId] } : t
          ),
        });

        playSuccessAnimation();
        setMatchedCount((prev) => prev + 1);
      } else {
        // No match or wrong letter - reset position
        updateDraggableLetters((prev) => {
          const otherLetters = prev.filter((l) => l.id !== dragState.draggedLetterId);
          return prev.map((l) =>
            l.id === dragState.draggedLetterId ? { ...l, position: getRandomPosition(otherLetters) } : l
          );
        });
      }
    } else {
      // Reset position
      updateDraggableLetters((prev) => {
        const otherLetters = prev.filter((l) => l.id !== dragState.draggedLetterId);
        return prev.map((l) =>
          l.id === dragState.draggedLetterId ? { ...l, position: getRandomPosition(otherLetters) } : l
        );
      });
    }

    setDragState({ draggedLetterId: null, offsetX: 0, offsetY: 0 });
  }, [dragState.draggedLetterId, draggableLetters, targetLetters, updateDraggableLetters, playSuccessAnimation]);

  /**
   * Initialize level on mount
   */
  useEffect(() => {
    setElapsedTime(0);
    levelStartTimeRef.current = Date.now();
    initializeStage(1);
  }, [initializeStage]);

  /**
   * Set up event listeners - only when dragging
   */
  useEffect(() => {
    if (dragState.draggedLetterId) {
      window.addEventListener('pointermove', handleMouseMove);
      window.addEventListener('pointerup', handleMouseUp);

      return () => {
        window.removeEventListener('pointermove', handleMouseMove);
        window.removeEventListener('pointerup', handleMouseUp);
      };
    }
  }, [dragState.draggedLetterId, handleMouseMove, handleMouseUp]);

  return (
    <div className="letter-match-level">
      {/* Top Area - Draggable Letters */}
      <div className="letter-match-top-area" ref={topAreaRef}>
        {draggableLetters.map((letter) => (
          <div
            key={letter.id}
            data-letter-id={letter.id}
            className={`draggable-letter ${letter.matched ? 'matched' : ''}`}
            style={{
              left: `${letter.position.x}px`,
              top: `${letter.position.y}px`,
              opacity: dragState.draggedLetterId === letter.id ? 0.9 : 1,
              cursor: dragState.draggedLetterId === letter.id ? 'grabbing' : 'grab',
              zIndex: dragState.draggedLetterId === letter.id ? 1000 : 10,
            }}
            onPointerDown={(e) => handleMouseDownLetter(e, letter.id)}
          >
            {letter.letter}
          </div>
        ))}
      </div>

      {/* Bottom Area - Target Letters (Home Row) */}
      <div className="letter-match-bottom-area" ref={bottomAreaRef}>
        <div className="home-row">
          {/* Back Button */}
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>

          <div className="target-letters-group">
            {targetLetters.map((target) => (
              <div
                key={`target-${target.letter}`}
                id={`target-letter-${target.letter}`}
                className="target-letter"
              >
                {target.letter}
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
            <div className="timer-display">
              <div className="timer-label">Time</div>
              <div className="timer-value">{elapsedTime}s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Complete Modal */}
      {isLevelComplete && (
        <div className="completion-modal">
          <div className="completion-content">
            <h2>🎉 Level 4 Complete!</h2>
            <p>You matched all letters!</p>
            <p className="final-score">Points: {Math.max(0, 1000 - elapsedTime * 5)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterMatchLevel;
