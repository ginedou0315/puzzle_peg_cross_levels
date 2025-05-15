import React from "react";

function GameControls({
  onReset,
  onUndo, // New prop
  canUndo, // New prop
  onNextLevel,
  canGoNext,
  isGameWon,
  allLevelsCompleted,
}) {
  return (
    <div className="game-controls">
      <button onClick={onReset}>Reset Level</button>
      <button onClick={onUndo} disabled={!canUndo}>
        {" "}
        {/* Add Undo Button */}
        Undo Move
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
