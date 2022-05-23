import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {Input} from './Input';

export default {
  component: Input,
  title: 'Base|Input',
  decorators: [withKnobs],
};

export const main = () => (
  <Input
    value={text('Value', 'Hello')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);

export const disabled = () => (
  <Input
    value={text('Value', 'Hello')}
    disabled={boolean('Disabled', true)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);

export const invalid = () => (
  <Input
    value={text('Value', 'Hello')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', true)}
    error={text('Error', 'Error')}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);

export const empty = () => (
  <Input
    value={text('Value', '')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);

export const number = () => (
  <Input
    type="number"
    value={text('Value', '123')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);
