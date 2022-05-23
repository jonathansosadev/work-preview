import React from 'react';
import {Link} from 'react-router-dom';
import chekinLogoImage from '../../../assets/chekin-imago-blue.svg';
import {MainLogo} from '../../../styled/onboarding';
import {Wrapper} from './styled';

function LeftAlignedChekinLogoHeader() {
  return (
    <Wrapper>
      <Link to="/login">
        <MainLogo src={chekinLogoImage} alt="Chekin" />
      </Link>
    </Wrapper>
  );
}

export {LeftAlignedChekinLogoHeader};
