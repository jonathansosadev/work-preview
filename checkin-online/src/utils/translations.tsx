import React from 'react';

function breakIntoLines(text = '') {
  return text.split('\n').map((t, index) => {
    return (
      <React.Fragment key={index}>
        {t}
        <br />
      </React.Fragment>
    );
  });
}

export {breakIntoLines};
