import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text} from '@storybook/addon-knobs';
import {AnimatedButton} from './AnimatedButton';

const story = {
  component: AnimatedButton,
  title: 'Base/Dashboard/AnimatedButton',
  decorators: [withKnobs],
};

export const main = () => (
  <AnimatedButton label={text('Label', 'Label')} onClick={action('Clicked')} />
);

export default story;
