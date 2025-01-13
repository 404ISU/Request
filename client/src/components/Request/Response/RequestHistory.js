import React from 'react';

const RequestHistory = ({ requests }) => {
  return (
    <div>
      <h3>Request History:</h3>
      <ul>
        {requests.map((req, index) => (
          <li key={index}>
            {req.method} - {req.url} - {req.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RequestHistory;