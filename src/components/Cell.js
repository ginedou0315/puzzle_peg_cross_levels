import React from "react";

/**
 * Represents a single cell on the game board.
 *
 * Props:
 *  - type (number): Determines if the cell is part of the playable board shape.
 *      0: Non-playable area (outside the shape).
 *      1: Playable empty hole (was initially an empty hole in boardSetup).
 *      2: Playable hole that initially had a peg (or currently has one).
 *  - hasPeg (boolean): True if the cell currently contains a peg.
 *  - isSelected (boolean): True if this cell's peg is currently selected by the player.
 *  - onClick (function): Callback function executed when the cell is clicked.
 *  - isHammerModeActive (boolean): True if the hammer power-up is currently active.
 */
function Cell({ type, hasPeg, isSelected, onClick, isHammerModeActive }) {
  let className = "cell";
  let content = null;
  let ariaLabel = "";

  if (type === 0) {
    className += " non-playable";
    ariaLabel = "Non-playable space";
  } else {
    // Playable cell (was originally type 1 or 2 in boardSetup)
    if (hasPeg) {
      className += " has-peg";
      if (isHammerModeActive) {
        // This class can be used to style pegs that are targets for the hammer
        className += " hammer-targetable";
        ariaLabel = "Peg, targetable by hammer";
      } else {
        ariaLabel = "Peg";
      }

      if (isSelected) {
        className += " selected";
        ariaLabel = "Selected peg";
      }
      content = <div className="peg"></div>;
    } else {
      // Empty hole
      className += " empty-hole";
      ariaLabel = "Empty hole";
      if (isSelected && !isHammerModeActive) {
        // Typically selection implies a peg, but if logic allows selecting empty hole as target
        className += " target-hole"; // Optional: if you want to style target empty holes
        ariaLabel = "Selected empty hole (target for jump)";
      }
    }
  }

  // Only make playable cells focusable and announce their role as a button
  const tabIndex = type !== 0 ? 0 : -1;
  const role = type !== 0 ? "button" : undefined;

  return (
    <div
      className={className}
      onClick={type !== 0 ? onClick : undefined} // Only allow clicks on playable cells
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        // Allow activation with Enter/Space for accessibility
        if (type !== 0 && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      {content}
    </div>
  );
}

export default Cell;
