import React from 'react';
import {SectionTagWrapper} from './styled';

export enum SectionTagColors {
  GREEN = '#35e5bc',
  BLUE = '#385CF8',
}

export type SectionTagWrapperProps = {
  color: SectionTagColors;
};

type SectionTagProps = {
  label: string;
  color: SectionTagColors;
};

function SectionTag({label, color}: SectionTagProps) {
  return <SectionTagWrapper color={color}>{label}</SectionTagWrapper>;
}

SectionTag.defaultProps = {
  color: SectionTagColors.GREEN,
};

export {SectionTag};
