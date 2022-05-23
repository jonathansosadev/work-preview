import React from 'react';
import {ModalButton} from './ModalButton';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';

const story = {
  title: 'Base/Dashboard/Modal Button',
  component: ModalButton,
  decorators: [withKnobs],
};

export const main = () => (
  <ModalButton secondary={boolean('Secondary', false)} label={text('Label', 'Label')} />
);

export const secondary = () => (
  <ModalButton secondary={boolean('Secondary', true)} label={text('Label', 'Label')} />
);

export const danger = () => (
  <ModalButton danger={boolean('Danger', true)} label={text('Label', 'Label')} />
);

export default story;
