import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ShapeType } from '../types';
import { ShapeRenderer } from './ShapeRenderer';
import './MemoryGameLevel.css';

interface MemoryCard {
  id: string;
  shapeType: ShapeType;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameLevelProps {
  onComplete?: () => void;
  onBack?: () => void;
  score: number;
  onScoreChange: (score: number) => void;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Initialize game with shuffled cards
 */
function initializeGame(): MemoryCard[] {
  const shapes: ShapeType[] = ['circle', 'square', 'triangle'];
  const cardPairs: ShapeType[] = [];

  // Create 8 pairs (16 cards total) - 4x4 grid
  // 2x each shape, repeated multiple times to get enough pairs
  for (let i = 0; i < 8; i++) {
    cardPairs.push(shapes[i % 3]);
    cardPairs.push(shapes[i % 3]);
  }

  const shuffled = shuffleArray(cardPairs);

  return shuffled.map((shapeType, index) => ({
    id: `card-${index}-${Date.now()}`,
    shapeType,
    isFlipped: false,
    isMatched: false,
  }));
}

/**
 * Play success sound
 */
function playSuccessSound() {
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
}

/**
 * Play match sound (higher pitch)
 */
function playMatchSound() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {
    console.log('Audio context not available');
  }
}

export const MemoryGameLevel: React.FC<MemoryGameLevelProps> = ({
  onComplete,
  onBack,
  score,
  onScoreChange,
}) => {
  const [cards, setCards] = useState<MemoryCard[]>(initializeGame);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const levelStartTimeRef = useRef<number>(0);
  const canFlipRef = useRef(true);

  // Initialize timer ref on mount
  useEffect(() => {
    setElapsedTime(0);
    levelStartTimeRef.current = Date.now();
  }, []);

  /**
   * Handle card click
   */
  const handleCardClick = useCallback(
    (cardId: string) => {
      if (!canFlipRef.current) return;
      if (isGameComplete) return;

      // Card is already matched
      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isMatched) return;

      // Card is already flipped
      if (flippedCards.includes(cardId)) return;

      // Already have 2 cards flipped
      if (flippedCards.length >= 2) return;

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      playSuccessSound();

      // Check for match when 2 cards are flipped
      if (newFlippedCards.length === 2) {
        canFlipRef.current = false;

        const card1 = cards.find((c) => c.id === newFlippedCards[0]);
        const card2 = cards.find((c) => c.id === newFlippedCards[1]);

        if (card1 && card2 && card1.shapeType === card2.shapeType) {
          // Match found!
          setTimeout(() => {
            setCards((prevCards) =>
              prevCards.map((c) =>
                c.id === newFlippedCards[0] || c.id === newFlippedCards[1]
                  ? { ...c, isMatched: true }
                  : c
              )
            );
            setFlippedCards([]);
            setMatchedCount((prev) => prev + 1);
            onScoreChange(score + 2); // Award 2 points per match
            playMatchSound();
            canFlipRef.current = true;
          }, 600);
        } else {
          // No match - flip cards back
          setTimeout(() => {
            setFlippedCards([]);
            canFlipRef.current = true;
          }, 1200);
        }
      }
    },
    [cards, flippedCards, isGameComplete, score, onScoreChange]
  );

  // Check if game is complete
  useEffect(() => {
    if (matchedCount === 8 && matchedCount > 0) {
      const timer = setTimeout(() => {
        setIsGameComplete(true);
        playMatchSound();
        const completeTimer = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1500);
        return () => clearTimeout(completeTimer);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [matchedCount, onComplete]);

  // Timer effect
  useEffect(() => {
    if (isGameComplete) return;

    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - levelStartTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 100);

    return () => clearInterval(timerInterval);
  }, [isGameComplete]);

  return (
    <div className="memory-game-level">
      {/* Back Button */}
      {onBack && (
        <button className="back-button" onClick={onBack} title="Back to map">
          ← Back
        </button>
      )}

      {/* Score Display */}
      <div className="score-display">
        <div className="score-label">Score</div>
        <div className="score-value">{score}</div>
      </div>

      {/* Timer Display */}
      <div className={`timer-display ${elapsedTime > 60 ? 'overtime' : ''}`}>
        <div className="timer-value">{elapsedTime}s</div>
      </div>

      {/* Game Title */}
      <div className="memory-game-title">Memory Game</div>

      {/* Cards Grid */}
      <div className="memory-cards-grid">
        {cards.map((card) => (
          <div key={card.id} className="memory-card-slot">
            {!card.isMatched ? (
              <div
                className={`memory-card ${
                  flippedCards.includes(card.id) ? 'flipped' : ''
                }`}
                onClick={() => handleCardClick(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(card.id);
                  }
                }}
              >
                <div className="memory-card-inner">
                  <div className="memory-card-back">?</div>
                  <div className="memory-card-front">
                    {flippedCards.includes(card.id) && (
                      <ShapeRenderer type={card.shapeType} />
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Completion message */}
      {isGameComplete && (
        <div className="game-complete-message">
          <div className="message-text">Great Job! 🎉</div>
        </div>
      )}
    </div>
  );
};

export default MemoryGameLevel;
