import React from "react";
import Cell from "./Cell";

function Board({ boardState, selectedPeg, onCellClick }) {
  // boardState is a 2D array: 0=non-playable, 1=empty, 2=peg
  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${boardState[0]?.length || 0}, auto)`,
      }}
    >
      {boardState.map((row, rowIndex) => (
        // Using a wrapper div for each row if direct grid child styling is complex for rows
        // This approach is simpler: just map cells directly if board is a flat grid
        <React.Fragment key={rowIndex}>
          {row.map((cellType, colIndex) => {
            const isSelected =
              selectedPeg &&
              selectedPeg.row === rowIndex &&
              selectedPeg.col === colIndex;
            let hasPeg = false;
            let typeForCellComponent = cellType; // 0 for non-playable, 1 for empty, 2 for peg initially

            if (cellType === 2) {
              // Peg
              hasPeg = true;
              typeForCellComponent = 2; // Pass 2 to indicate it's a hole that can hold a peg
            } else if (cellType === 1) {
              // Empty Hole
              hasPeg = false;
              typeForCellComponent = 1; // Pass 1 to indicate it's an empty hole
            } else {
              // Non-playable
              typeForCellComponent = 0;
            }

            return (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                type={typeForCellComponent} // Indicates if it's part of the board shape
                hasPeg={hasPeg}
                isSelected={isSelected}
                onClick={() =>
                  typeForCellComponent !== 0 && onCellClick(rowIndex, colIndex)
                } // Only clickable if not non-playable
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Board;
