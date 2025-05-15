// src/components/GameControls.js
import React from "react";

function GameControls({
  onReset,
  onUndo,
  canUndo,
  undoButtonText, // New prop for dynamic text
  onNextLevel,
  canGoNext,
  isGameWon,
  allLevelsCompleted,
}) {
  return (
    <div className="game-controls">
      <button onClick={onReset}>Reset Level</button>
      <button onClick={onUndo} disabled={!canUndo}>
        {undoButtonText} {/* Use dynamic text */}
      </button>
      {isGameWon && !allLevelsCompleted && (
        <button onClick={onNextLevel} disabled={!canGoNext}>
          Next Level
        </button>
      )}
    </div>
  );
}

export default GameControls;
