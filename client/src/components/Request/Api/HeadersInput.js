import React from 'react';

const HeadersInput = ({ value, onChange }) => {
  return (
    <div>
      <label>Headers (JSON):</label>
      <textarea value={value} onChange={onChange}></textarea>
    </div>
  );
};

export default HeadersInput;