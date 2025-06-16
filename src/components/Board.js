// src/components/Board.js
import React from "react";
import Cell from "./Cell"; // Ensure Cell.js is in the same directory or path is correct

/**
 * Renders the game board dynamically based on the boardState.
 *
 * Props:
 *  - boardState (array): A 2D array representing the current state of the board.
 *      Each cell value can be:
 *          0: Non-playable area (Cell component will render it as such).
 *          1: An empty, playable hole.
 *          2: A playable hole currently occupied by a peg.
 *  - selectedPeg (object | null): An object {row, col} indicating the currently
 *      selected peg, or null if no peg is selected.
 *  - onCellClick (function): A callback function that is invoked when a playable
 *      cell is clicked, passing the cell's (rowIndex, colIndex).
 *  - isHammerModeActive (boolean): A boolean indicating if the hammer power-up
 *      is currently active in the game. This is passed down to individual Cells.
 */
function Board({ boardState, selectedPeg, onCellClick, isHammerModeActive }) {
  // Handle cases where boardState might not be ready (e.g., initial load)
  if (
    !boardState ||
    boardState.length === 0 ||
    !boardState[0] ||
    boardState[0].length === 0
  ) {
    // You could return null, a loading message, or an empty fragment
    return (
      <div className="board-loading">
        <p>Loading board...</p>
      </div>
    );
  }

  return (
    <div
      className="board"
      // Dynamically set grid columns based on the width of the board
      style={{ gridTemplateColumns: `repeat(${boardState[0].length}, auto)` }}
    >
      {boardState.map((rowCells, rowIndex) => (
        // Using React.Fragment for key because we are rendering a list of Cell components per row directly into the grid
        <React.Fragment key={`row-${rowIndex}`}>
          {rowCells.map((cellCurrentValue, colIndex) => {
            const isCurrentlySelected =
              selectedPeg &&
              selectedPeg.row === rowIndex &&
              selectedPeg.col === colIndex;

            // Determine props for the Cell component based on the cell's current value
            let cellTypeForDisplay; // This tells Cell.js its fundamental nature (playable, non-playable)
            let hasPegInCell = false;

            if (cellCurrentValue === 2) {
              // Contains a peg
              hasPegInCell = true;
              cellTypeForDisplay = 2; // Type 2 for Cell means it's a peg spot
            } else if (cellCurrentValue === 1) {
              // Is an empty hole
              hasPegInCell = false;
              cellTypeForDisplay = 1; // Type 1 for Cell means it's an empty hole
            } else {
              // cellCurrentValue === 0, or any other value not 1 or 2
              hasPegInCell = false;
              cellTypeForDisplay = 0; // Type 0 for Cell means it's non-playable
            }

            return (
              <Cell
                key={`cell-${rowIndex}-${colIndex}`}
                type={cellTypeForDisplay}
                hasPeg={hasPegInCell}
                isSelected={isCurrentlySelected}
                onClick={() => {
                  // Only trigger onCellClick if the cell is part of the playable board
                  if (cellTypeForDisplay !== 0) {
                    onCellClick(rowIndex, colIndex);
                  }
                }}
                isHammerModeActive={isHammerModeActive} // Pass the prop down
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Board;
