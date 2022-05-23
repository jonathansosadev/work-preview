import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import likeIcon from '../../assets/like.svg';
import whatsApp from '../../assets/whatsApp_icon.svg';
import {OriginalButton} from './OriginalButton';

export default {
  component: OriginalButton,
  title: 'Base | OriginalButton',
  decorators: [withKnobs],
};

export const main = () => (
  <OriginalButton
    disabled={boolean('Disabled', false)}
    icon={<img src={likeIcon} alt="Like" />}
    label={text('Label', 'Hello')}
    onClick={action('Clicked')}
  />
);

export const link = () => (
  <OriginalButton
    disabled={boolean('Disabled', false)}
    icon={<img src={whatsApp} alt="Like" />}
    label={text('Label', 'Hello')}
    onClick={action('Clicked')}
    link
  />
);
