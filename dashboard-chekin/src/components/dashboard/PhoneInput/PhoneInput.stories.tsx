import React from 'react';
import {PhoneInput} from './PhoneInput';
import {text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

const story = {
  title: 'Base/Dashboard/PhoneInput',
  component: PhoneInput,
  decorators: [withKnobs],
};

export const main = () => (
  <PhoneInput name="phone" onChange={action('Changed')} label={text('LAbel', 'text')} />
);

export default story;
