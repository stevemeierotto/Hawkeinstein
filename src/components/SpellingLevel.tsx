import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SpellingLevel.css';

// Sight words organized by length
const TWO_LETTER_WORDS = ['an', 'up', 'go', 'me', 'my', 'is', 'it', 'we', 'no', 'in'];
const THREE_LETTER_WORDS = ['the', 'and', 'you', 'can', 'see', 'cat', 'dog', 'big', 'run', 'yes'];
const FOUR_LETTER_WORDS = ['that', 'this', 'here', 'look', 'like', 'play', 'said', 'make', 'jump', 'help'];

interface DraggableLetter {
  id: string;
  letter: string;
  position: { x: number; y: number };
  matched: boolean;
}

interface TargetLetter {
  letter: string;
  matched: boolean;
}

interface DragState {
  draggedLetterId: string | null;
  offsetX: number;
  offsetY: number;
}

interface SpellingLevelProps {
  onComplete?: () => void;
  onBack?: () => void;
  score: number;
  onScoreChange: (score: number) => void;
}

// Get random position for draggable letters
function getRandomPosition(
  existingLetters: DraggableLetter[],
  topArea: HTMLDivElement | null
): { x: number; y: number } {
  const LETTER_SIZE = 80;
  const PADDING = 20;
  const MIN_DISTANCE = LETTER_SIZE + 40;
  const MAX_ATTEMPTS = 50;

  let position = { x: 0, y: 0 };
  let isValidPosition = false;
  let attempts = 0;

  while (!isValidPosition && attempts < MAX_ATTEMPTS) {
    attempts++;

    if (topArea && topArea.clientWidth > 100 && topArea.clientHeight > 100) {
      const maxX = topArea.clientWidth - LETTER_SIZE - PADDING;
      const maxY = topArea.clientHeight - LETTER_SIZE - PADDING - 100; // Leave space for bottom area

      position = {
        x: Math.random() * maxX + PADDING,
        y: Math.random() * maxY + PADDING,
      };
    } else {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight * 0.75;

      position = {
        x: Math.random() * (viewportWidth - LETTER_SIZE - PADDING * 2) + PADDING,
        y: Math.random() * (viewportHeight - LETTER_SIZE - PADDING - 100) + PADDING,
      };
    }

    isValidPosition = !existingLetters.some((letter) => {
      const dx = position.x - letter.position.x;
      const dy = position.y - letter.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < MIN_DISTANCE;
    });
  }

  return position;
}

export const SpellingLevel: React.FC<SpellingLevelProps> = ({
  onComplete,
  onBack,
  score,
  onScoreChange,
}) => {
  const topAreaRef = useRef<HTMLDivElement>(null);
  const bottomAreaRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [draggableLetters, setDraggableLetters] = useState<DraggableLetter[]>([]);
  const [targetLetters, setTargetLetters] = useState<TargetLetter[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    draggedLetterId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const [matchedCount, setMatchedCount] = useState(0);
  const [wordsCompletedInStage, setWordsCompletedInStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const levelStartTimeRef = useRef<number>(0);

  // Initialize level start time on mount
  useEffect(() => {
    levelStartTimeRef.current = Date.now();
    setElapsedTime(0);
  }, []);

  // Get current word
  const getCurrentWord = useCallback((): string => {
    let words: string[];
    switch (stage) {
      case 1:
        words = TWO_LETTER_WORDS.slice(0, 3);
        break;
      case 2:
        words = THREE_LETTER_WORDS.slice(0, 3);
        break;
      case 3:
        words = FOUR_LETTER_WORDS.slice(0, 3);
        break;
    }
    return words[currentWordIndex] || '';
  }, [stage, currentWordIndex]);

  // Initialize word
  const initializeWord = useCallback(() => {
    const word = getCurrentWord().toUpperCase();
    const wordLetters = word.split('');
    
    // Reset matched count FIRST
    setMatchedCount(0);
    
    // Set target letters (home row)
    setTargetLetters(wordLetters.map(letter => ({ letter, matched: false })));
    
    // Create draggable letters
    const letters: DraggableLetter[] = [];
    const topArea = topAreaRef.current;
    
    // Add correct letters
    wordLetters.forEach((letter, i) => {
      letters.push({
        id: `letter-${Date.now()}-${i}`,
        letter,
        position: getRandomPosition(letters, topArea),
        matched: false,
      });
    });
    
    // Add distractor letters (8-12 extra)
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numDistractors = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < numDistractors; i++) {
      let randomLetter;
      let attempts = 0;
      do {
        randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
        attempts++;
      } while (wordLetters.includes(randomLetter) && attempts < 10);
      
      letters.push({
        id: `distractor-${Date.now()}-${i}`,
        letter: randomLetter,
        position: getRandomPosition(letters, topArea),
        matched: false,
      });
    }
    
    setDraggableLetters(letters);
  }, [stage, currentWordIndex, getCurrentWord]);

  // Initialize on mount and when word changes
  useEffect(() => {
    initializeWord();
  }, [initializeWord]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - levelStartTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Play success sound
  const playSuccessSound = useCallback(() => {
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

  // Handle pointer down
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, letterId: string) => {
    e.preventDefault();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    setDragState({
      draggedLetterId: letterId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  }, []);

  // Handle pointer move
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (dragState.draggedLetterId === null) return;

    const x = e.clientX - dragState.offsetX;
    const y = e.clientY - dragState.offsetY;

    setDraggableLetters((prev) =>
      prev.map((l) =>
        l.id === dragState.draggedLetterId
          ? { ...l, position: { x, y } }
          : l
      )
    );
  }, [dragState]);

  // Handle pointer up (drop)
  const handlePointerUp = useCallback(() => {
    if (dragState.draggedLetterId === null) return;

    const letter = draggableLetters.find((l) => l.id === dragState.draggedLetterId);
    if (!letter || !bottomAreaRef.current) {
      setDragState({ draggedLetterId: null, offsetX: 0, offsetY: 0 });
      return;
    }

    const bottomRect = bottomAreaRef.current.getBoundingClientRect();
    const draggedLetterEl = document.querySelector(`[data-letter-id="${dragState.draggedLetterId}"]`);
    
    if (!draggedLetterEl) {
      setDragState({ draggedLetterId: null, offsetX: 0, offsetY: 0 });
      return;
    }

    const draggedRect = draggedLetterEl.getBoundingClientRect();
    const letterCenterX = draggedRect.left + draggedRect.width / 2;
    const letterCenterY = draggedRect.top + draggedRect.height / 2;

    const isOverBottom =
      letterCenterY >= bottomRect.top &&
      letterCenterY <= bottomRect.bottom &&
      letterCenterX >= bottomRect.left &&
      letterCenterX <= bottomRect.right;

    if (isOverBottom) {
      // Find which target letter it's over using overlap detection
      const targetElements = document.querySelectorAll('.target-letter');
      let matchedTargetIndex = -1;
      let bestOverlap = 0;

      targetElements.forEach((targetEl, index) => {
        const targetRect = targetEl.getBoundingClientRect();
        
        // Calculate overlap area between dragged letter and target
        const overlapLeft = Math.max(draggedRect.left, targetRect.left);
        const overlapRight = Math.min(draggedRect.right, targetRect.right);
        const overlapTop = Math.max(draggedRect.top, targetRect.top);
        const overlapBottom = Math.min(draggedRect.bottom, targetRect.bottom);
        
        const overlapWidth = Math.max(0, overlapRight - overlapLeft);
        const overlapHeight = Math.max(0, overlapBottom - overlapTop);
        const overlapArea = overlapWidth * overlapHeight;
        
        // If there's any overlap and it's the best so far, this is our match
        if (overlapArea > bestOverlap) {
          bestOverlap = overlapArea;
          matchedTargetIndex = index;
        }
      });

      // Check if letter matches the target
      if (matchedTargetIndex >= 0 && letter.letter === targetLetters[matchedTargetIndex].letter) {
        const newMatchedCount = matchedCount + 1;
        const currentWord = getCurrentWord();
        
        // Play success sound
        playSuccessSound();
        
        setDraggableLetters((prev) =>
          prev.map((l) =>
            l.id === letter.id ? { ...l, matched: true } : l
          )
        );
        setTargetLetters((prev) =>
          prev.map((t, i) =>
            i === matchedTargetIndex ? { ...t, matched: true } : t
          )
        );
        setMatchedCount(newMatchedCount);
        onScoreChange(score + 10);
        
        // Check if word is complete
        if (newMatchedCount === currentWord.length && !isTransitioning) {
          setIsTransitioning(true);
          const newWordsCompleted = wordsCompletedInStage + 1;
          
          setTimeout(() => {
            if (newWordsCompleted >= 3) {
              if (stage < 3) {
                setStage((s) => (s + 1) as 1 | 2 | 3);
                setCurrentWordIndex(0);
                setWordsCompletedInStage(0);
                setIsTransitioning(false);
              } else {
                setIsLevelComplete(true);
                if (onComplete) {
                  const points = Math.max(0, 500 - elapsedTime * 2);
                  onScoreChange(score + points);
                  setTimeout(() => onComplete(), 2000);
                }
              }
            } else {
              setWordsCompletedInStage(newWordsCompleted);
              setCurrentWordIndex((i) => i + 1);
              setIsTransitioning(false);
            }
          }, 800);
        }
      } else {
        // No match - return letter to a random position in the top area
        setDraggableLetters((prev) =>
          prev.map((l) =>
            l.id === letter.id ? { ...l, position: getRandomPosition(prev.filter(p => p.id !== l.id), topAreaRef.current) } : l
          )
        );
      }
    } else {
      // Letter dropped outside bottom area - return to random position
      setDraggableLetters((prev) =>
        prev.map((l) =>
          l.id === letter.id ? { ...l, position: getRandomPosition(prev.filter(p => p.id !== l.id), topAreaRef.current) } : l
        )
      );
    }

    setDragState({ draggedLetterId: null, offsetX: 0, offsetY: 0 });
  }, [dragState, draggableLetters, targetLetters, score, onScoreChange, matchedCount, getCurrentWord, isTransitioning, wordsCompletedInStage, stage, onComplete, elapsedTime, playSuccessSound]);

  // Add event listeners
  useEffect(() => {
    if (dragState.draggedLetterId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);

      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragState.draggedLetterId, handlePointerMove, handlePointerUp]);

  return (
    <div className="spelling-level">
      {/* Top Area - Draggable Letters */}
      <div className="spelling-top-area" ref={topAreaRef}>
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
            onPointerDown={(e) => handlePointerDown(e, letter.id)}
          >
            {letter.letter}
          </div>
        ))}
      </div>

      {/* Bottom Area - Target Letters (Home Row) */}
      <div className="spelling-bottom-area" ref={bottomAreaRef}>
        <div className="home-row">
          {/* Back Button */}
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>

          <div className="target-letters-group">
            {targetLetters.map((target, index) => (
              <div
                key={`target-${index}`}
                className={`target-letter ${target.matched ? 'matched' : ''}`}
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
            <h2>🎉 Level 6 Complete!</h2>
            <p>You spelled all the words!</p>
            <p className="final-score">Points: {Math.max(0, 500 - elapsedTime * 2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellingLevel;
