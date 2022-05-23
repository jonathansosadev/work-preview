import React from 'react';
import rubbishIcon from '../../../assets/rubbish.svg';
import {LabelWrapper, Icon, Text} from './styled';

type RubbishIconFillingProps = {
  label: string;
};

function RubbishIconFilling({label}: RubbishIconFillingProps) {
  return (
    <LabelWrapper>
      <Icon src={rubbishIcon} alt="Rubbish Icon" width="12" height="16" />
      <Text>{label}</Text>
    </LabelWrapper>
  );
}

export {RubbishIconFilling};
