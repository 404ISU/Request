import React from 'react';

const BodyInput = ({ value, onChange }) => {
  return (
    <div>
      <label>Body (JSON):</label>
      <textarea value={value} onChange={onChange} rows="5" cols="50"></textarea>
    </div>
  );
};

export default BodyInput;
