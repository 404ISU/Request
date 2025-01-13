import React from 'react';

const ApiInput = ({ value, onChange }) => {
  return (
    <div>
      <label>API URL:</label>
      <input type="text" value={value} onChange={onChange} />
    </div>
  );
};

export default ApiInput;