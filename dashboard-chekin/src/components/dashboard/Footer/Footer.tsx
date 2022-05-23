import React from 'react';
import chekinLogo from '../../../assets/chekin-imago-white.svg';
import {Container} from './styled';

function Footer() {
  return (
    <Container>
      <img src={chekinLogo} alt="" height={27} width={135} />
    </Container>
  );
}

export {Footer};
