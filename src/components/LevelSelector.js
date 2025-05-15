import React from "react";

function LevelSelector({ levels, currentLevelIndex, onSelectLevel }) {
  if (!levels || levels.length === 0) {
    return null;
  }

  const handleChange = (event) => {
    onSelectLevel(parseInt(event.target.value, 10));
  };

  return (
    <div className="level-selector">
      <label htmlFor="level-select">Go to Level: </label>
      <select
        id="level-select"
        value={currentLevelIndex}
        onChange={handleChange}
      >
        {levels.map((level, index) => (
          <option key={level.id} value={index}>
            Level {level.id}: {level.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LevelSelector;
