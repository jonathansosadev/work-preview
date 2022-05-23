import React from 'react';
import {SignatureCanvas} from './SignatureCanvas';
import {boolean, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

const story = {
  component: SignatureCanvas,
  title: 'Base/Dashboard/Signature',
  decorators: [withKnobs],
};

export const main = () => (
  <SignatureCanvas
    hasSignature={boolean('Has Signature', false)}
    onClear={action('Cleared')}
    onEnable={action('Enabled')}
    enabled={boolean('Enabled', false)}
  />
);

export const enabled = () => (
  <SignatureCanvas
    hasSignature={boolean('Has Signature', false)}
    onClear={action('Cleared')}
    onEnable={action('Enabled')}
    enabled={boolean('Enabled', true)}
  />
);

export const withSignature = () => (
  <SignatureCanvas
    hasSignature={boolean('Has Signature', true)}
    onClear={action('Cleared')}
    onEnable={action('Enabled')}
    enabled={boolean('Enabled', true)}
  />
);

export default story;
