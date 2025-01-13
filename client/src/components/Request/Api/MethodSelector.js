import React from 'react';

const MethodSelector = ({ value, onChange }) => {
  return (
    <div>
      <label>Method:</label>
      <select value={value} onChange={onChange}>
        <option value="get">GET</option>
        <option value="post">POST</option>
        <option value="put">PUT</option>
        <option value="delete">DELETE</option>
      </select>
    </div>
  );
};

export default MethodSelector;