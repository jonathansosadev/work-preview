import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {SelectorButton} from './SelectorButton';

const story = {
  component: SelectorButton,
  title: 'Base/Dashboard/SelectorButton',
  decorators: [withKnobs],
};

export const main = () => (
  <SelectorButton
    content={text('Label', 'Label')}
    active={boolean('Active', false)}
    onClick={action('Clicked')}
  />
);

export const active = () => (
  <SelectorButton
    content={text('Label', 'Label')}
    active={boolean('Active', true)}
    onClick={action('Clicked')}
  />
);

export default story;
