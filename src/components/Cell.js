import React from "react";

function Cell({ type, hasPeg, isSelected, onClick }) {
  // type: 0 (non-playable), 1 (empty hole), 2 (hole that can have a peg)
  let className = "cell";
  let content = null;

  if (type === 0) {
    className += " non-playable";
  } else {
    // Playable cell (was either 1 or 2 in boardSetup)
    if (hasPeg) {
      className += " has-peg";
      content = <div className="peg"></div>;
    } else {
      className += " empty-hole";
    }
    if (isSelected) {
      className += " selected";
    }
  }

  return (
    <div
      className={className}
      onClick={onClick}
      role="button"
      tabIndex={type !== 0 ? 0 : -1}
      aria-label={
        type === 0
          ? "Non-playable space"
          : hasPeg
          ? isSelected
            ? "Selected peg"
            : "Peg"
          : "Empty hole"
      }
    >
      {content}
    </div>
  );
}

export default Cell;
