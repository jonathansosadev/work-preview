import React from 'react';
import {useReservation} from '../../context/reservation';
import {getHousingPicture} from '../../utils/reservation';
import {Wrapper, HousingLogo} from './styled';

type HousingPicture = {
  className?: string;
};

const defaultProps: HousingPicture = {
  className: '',
};

function HousingPicture({className}: HousingPicture) {
  const {data} = useReservation();
  const housingPicture = getHousingPicture(data);

  if (!housingPicture) {
    return null;
  }

  return (
    <Wrapper className={className}>
      <HousingLogo src={housingPicture} alt="House" />
    </Wrapper>
  );
}

HousingPicture.defaultProps = defaultProps;
export {HousingPicture};
