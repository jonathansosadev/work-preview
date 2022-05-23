import React from 'react';
import floppyDiskIcon from '../../../assets/floppy-disk.svg';
import {LabelContainer, LabelIcon, LabelText, IconSize} from './styled';

type FloppyIconFillingProps = {
  label: string;
  iconSize?: IconSize;
};

function FloppyIconFilling({label, iconSize}: FloppyIconFillingProps) {
  return (
    <LabelContainer>
      <LabelIcon size={iconSize} src={floppyDiskIcon} alt="Plus" />
      <LabelText>{label}</LabelText>
    </LabelContainer>
  );
}

export {FloppyIconFilling};
