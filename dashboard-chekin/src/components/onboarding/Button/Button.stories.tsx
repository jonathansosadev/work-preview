import React from 'react';
import {Button} from './Button';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';

const story = {
  title: 'Base/Onboarding/Button',
  component: Button,
  decorators: [withKnobs],
};

export const main = () => (
  <Button label={text('Label', 'Label')} disabled={boolean('Disabled', false)} />
);

export const disabled = () => (
  <Button label={text('Label', 'Label')} disabled={boolean('Disabled', true)} />
);

export default story;
