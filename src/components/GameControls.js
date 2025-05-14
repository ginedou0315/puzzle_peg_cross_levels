import React from "react";

function GameControls({
  onReset,
  onNextLevel,
  canGoNext,
  isGameWon,
  allLevelsCompleted,
}) {
  return (
    <div className="game-controls">
      <button onClick={onReset}>Reset Level</button>
      {isGameWon && !allLevelsCompleted && (
        <button onClick={onNextLevel} disabled={!canGoNext}>
          Next Level
        </button>
      )}
    </div>
  );
}

export default GameControls;
