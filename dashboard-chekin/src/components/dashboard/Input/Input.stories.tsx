import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {Input} from './Input';

const story = {
  component: Input,
  title: 'Base/Dashboard/Input',
  decorators: [withKnobs],
};

export const main = () => (
  <Input
    type={text('Type', 'text')}
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
    type={text('Type', 'text')}
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
    type={text('Type', 'text')}
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
    type={text('Type', 'text')}
    value={text('Value', '')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);

export const password = () => (
  <Input
    type={text('Type', 'password')}
    value={text('Value', 'test')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);

export const passwordDisabled = () => (
  <Input
    type={text('Type', 'password')}
    value={text('Value', 'test')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
  />
);

export const withNumberButtons = () => (
  <Input
    type={text('Type', 'number')}
    value={text('Value', 'test')}
    disabled={boolean('Disabled', false)}
    invalid={boolean('Invalid', false)}
    onChange={action('Changed')}
    placeholder={text('Placeholder', 'I am placeholder')}
    label={text('Label', 'Label')}
    showNumberButtons={boolean('Buttons', true)}
  />
);

export default story;
