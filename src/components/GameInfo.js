import React from "react";

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
    </div>
  );
}

export default GameInfo;
