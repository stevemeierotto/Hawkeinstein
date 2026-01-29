import React from 'react';
import './GameMap.css';

interface GameMapProps {
  onPlayLevel: (levelNumber: number) => void;
  completedLevels: number[];
  score: number;
}

export const GameMap: React.FC<GameMapProps> = ({ onPlayLevel, completedLevels, score }) => {
  const isLevel1Completed = completedLevels.includes(1);
  const isLevel2Completed = completedLevels.includes(2);
  const isLevel3Completed = completedLevels.includes(3);
  const isLevel4Completed = completedLevels.includes(4);
  const isLevel5Completed = completedLevels.includes(5);
  const isLevel6Completed = completedLevels.includes(6);
  const isLevel2Available = isLevel1Completed;
  const isLevel3Available = isLevel2Completed;
  const isLevel4Available = isLevel3Completed;
  const isLevel5Available = isLevel4Completed;
  const isLevel6Available = isLevel5Completed;
  const isLevel7Available = isLevel6Completed;

  return (
    <div className="game-map">
      {/* Score Display */}
      <div className="score-display">
        <div className="score-label">Score</div>
        <div className="score-value">{score}</div>
      </div>
      <div className="map-container">
        {/* Level 1 - Top (0°) - Always available */}
        <div className="level-node level-1-node">
          <button
            className={`level-button level-1 ${isLevel1Completed ? 'completed' : ''}`}
            onClick={() => onPlayLevel(1)}
          >
            <div className="level-number">1</div>
            <div className="level-label">Shapes</div>
            {isLevel1Completed && <div className="star">⭐</div>}
          </button>
        </div>

        {/* Level 2 - 51° clockwise */}
        <div className={`level-node level-2-node ${isLevel2Available ? 'available' : 'locked'}`}>
          <button
            className={`level-button level-2 ${isLevel2Available ? '' : 'disabled'}`}
            onClick={() => isLevel2Available && onPlayLevel(2)}
            disabled={!isLevel2Available}
          >
            <div className="level-number">2</div>
            <div className="level-label">Colors</div>
            {isLevel2Completed && <div className="star">⭐</div>}
            {!isLevel2Available && <div className="lock">🔒</div>}
          </button>
        </div>

        {/* Level 3 - 103° clockwise */}
        <div className={`level-node level-3-node ${isLevel3Available ? 'available' : 'locked'}`}>
          <button
            className={`level-button level-3 ${isLevel3Available ? '' : 'disabled'}`}
            onClick={() => isLevel3Available && onPlayLevel(3)}
            disabled={!isLevel3Available}
          >
            <div className="level-number">3</div>
            <div className="level-label">Numbers</div>
            {completedLevels.includes(3) && <div className="star">⭐</div>}
            {!isLevel3Available && <div className="lock">🔒</div>}
          </button>
        </div>

        {/* Level 4 - 154° clockwise */}
        <div className={`level-node level-4-node ${isLevel4Available ? 'available' : 'locked'}`}>
          <button
            className={`level-button level-4 ${isLevel4Available ? '' : 'disabled'}`}
            onClick={() => isLevel4Available && onPlayLevel(4)}
            disabled={!isLevel4Available}
          >
            <div className="level-number">4</div>
            <div className="level-label">Letters</div>
            {completedLevels.includes(4) && <div className="star">⭐</div>}
            {!isLevel4Available && <div className="lock">🔒</div>}
          </button>
        </div>

        {/* Level 5 - 206° clockwise */}
        <div className={`level-node level-5-node ${isLevel5Available ? 'available' : 'locked'}`}>
          <button
            className={`level-button level-5 ${isLevel5Available ? '' : 'disabled'}`}
            onClick={() => isLevel5Available && onPlayLevel(5)}
            disabled={!isLevel5Available}
          >
            <div className="level-number">5</div>
            <div className="level-label">Memory</div>
            {completedLevels.includes(5) && <div className="star">⭐</div>}
            {!isLevel5Available && <div className="lock">🔒</div>}
          </button>
        </div>

        {/* Level 6 - 257° clockwise */}
        <div className={`level-node level-6-node ${isLevel6Available ? 'available' : 'locked'}`}>
          <button
            className={`level-button level-6 ${isLevel6Available ? '' : 'disabled'}`}
            onClick={() => isLevel6Available && onPlayLevel(6)}
            disabled={!isLevel6Available}
          >
            <div className="level-number">6</div>
            <div className="level-label">Spelling</div>
            {completedLevels.includes(6) && <div className="star">⭐</div>}
            {!isLevel6Available && <div className="lock">🔒</div>}
          </button>
        </div>

        {/* Level 7 - 309° clockwise */}
        <div className={`level-node level-7-node ${isLevel7Available ? 'available' : 'locked'}`}>
          <button
            className={`level-button level-7 ${isLevel7Available ? '' : 'disabled'}`}
            onClick={() => isLevel7Available && onPlayLevel(7)}
            disabled={!isLevel7Available}
          >
            <div className="level-number">7</div>
            <div className="level-label">Math</div>
            {completedLevels.includes(7) && <div className="star">⭐</div>}
            {!isLevel7Available && <div className="lock">🔒</div>}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="background-shapes">
          <div className="shape-circle" />
          <div className="shape-square" />
          <div className="shape-triangle" />
        </div>
      </div>
    </div>
  );
};

export default GameMap;
