import React from 'react';
import {SignatureCanvas} from './SignatureCanvas';
import {boolean, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

export default {
  component: SignatureCanvas,
  title: 'Base|Signature Canvas',
  decorators: [withKnobs],
};

export const main = () => (
  <SignatureCanvas
    hasSignature={boolean('Has Signature', false)}
    onClear={action('Cleared')}
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
