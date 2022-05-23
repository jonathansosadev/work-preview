import React from 'react';
import Loader from '../Loader';
import chekinLogo from '../../../assets/chekin-imago-white.svg';
import {Wrapper, Logo} from './styled';

function FullPageSpinner() {
  return (
    <Wrapper>
      <Loader height={45} width={45} />
      <Logo src={chekinLogo} alt="Loading app" />
    </Wrapper>
  );
}

export {FullPageSpinner};
