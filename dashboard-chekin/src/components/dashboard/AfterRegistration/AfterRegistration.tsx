import React from 'react';
import {useHistory} from 'react-router-dom';
import {sendConversion} from '../../../analytics/googleAdword';
import FullPageSpinner from '../../common/FullPageSpinner';

const REDIRECT_TIMEOUT_S = 1;
const REDIRECT_URL = '/properties';
const GOOGLE_CONVERSION = 'AW-481274774/fFP3CPDDl_IBEJbXvuUB';

function AfterRegistration() {
  const history = useHistory();

  React.useEffect(() => {
    sendConversion(GOOGLE_CONVERSION);
  }, []);

  React.useEffect(
    function redirectAfterTimeout() {
      const timeout = setTimeout(() => {
        history.push(REDIRECT_URL);
      }, REDIRECT_TIMEOUT_S * 1000);

      return () => {
        clearTimeout(timeout);
      };
    },
    [history],
  );

  return <FullPageSpinner />;
}

export {AfterRegistration};
