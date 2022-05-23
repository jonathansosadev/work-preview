import React from 'react';
import {withKnobs, number, text} from '@storybook/addon-knobs';
import {ProgressCircle} from './ProgressCircle';

export default {
  title: 'Base|Progress Circle',
  component: ProgressCircle,
  decorators: [withKnobs],
};

export const main = () => (
  <ProgressCircle
    progress={number('Percentages', 80)}
    label={text('Label', 'Matching')}
    errorText={text('Error text', '')}
  />
);

export const error = () => (
  <ProgressCircle
    progress={number('Percentages', 80)}
    label={text('Label', 'Matching')}
    errorText={text('Error text', 'Error')}
  />
);
