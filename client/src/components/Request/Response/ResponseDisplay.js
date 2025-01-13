import React from 'react';

const ResponseDisplay = ({ response }) => {
  return (
    <div>
      <h3>Response:</h3>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};

export default ResponseDisplay;