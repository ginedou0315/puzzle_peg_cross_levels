// src/components/GameInfo.js
import React from "react";

// Remove freeUndosRemaining from props
function GameInfo({ levelName, levelDescription, pegsRemaining, movesCount }) {
  return (
    <div className="game-info">
      <h2>{levelName}</h2>
      {levelDescription && (
        <p>
          <em>{levelDescription}</em>
        </p>
      )}
      <p>
        Pegs Remaining: <strong>{pegsRemaining}</strong>
      </p>
      <p>
        Moves: <strong>{movesCount}</strong>
      </p>
      {/* <p>Free Undos Left: <strong>{freeUndosRemaining}</strong></p> REMOVE THIS LINE */}
    </div>
  );
}

export default GameInfo;
