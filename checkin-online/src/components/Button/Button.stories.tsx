import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import likeIcon from '../../assets/like.svg';
import {Button} from './Button';

export default {
  component: Button,
  title: 'Base|Button',
  decorators: [withKnobs],
};

export const main = () => (
  <Button
    short={boolean('Short', false)}
    disabled={boolean('Disabled', false)}
    icon={<img src={likeIcon} alt="Like" />}
    label={text('Label', 'Hello')}
    onClick={action('Clicked')}
  />
);

export const disabled = () => (
  <Button
    short={boolean('Short', false)}
    disabled={boolean('Disabled', true)}
    icon={<img src={likeIcon} alt="Like" />}
    label={text('Label', 'Hello')}
    onClick={action('Clicked')}
  />
);

export const short = () => (
  <Button
    short={boolean('Short', true)}
    disabled={boolean('Disabled', false)}
    icon={<img src={likeIcon} alt="Like" />}
    label={text('Label', 'Hello')}
    onClick={action('Clicked')}
  />
);

export const shortDisabled = () => (
  <Button
    short={boolean('Short', true)}
    disabled={boolean('Disabled', true)}
    icon={<img src={likeIcon} alt="Like" />}
    label={text('Label', 'Hello')}
    onClick={action('Clicked')}
  />
);
