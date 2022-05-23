import React from 'react';
import {withKnobs, boolean, text} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StyledShortInput} from './styled';

export default {
  component: StyledShortInput,
  title: 'Base|Short Input',
  decorators: [withKnobs],
};

export const main = () => (
  <StyledShortInput
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Label')}
    onChange={action('Changed')}
    value={text('Text', 'Text')}
    placeholder={text('Placeholder', 'Placeholder')}
  />
);

export const disabled = () => (
  <StyledShortInput
    disabled={boolean('Disabled', true)}
    label={text('Label', 'Label')}
    onChange={action('Changed')}
    value={text('Text', 'Text')}
    placeholder={text('Placeholder', 'Placeholder')}
  />
);

export const empty = () => (
  <StyledShortInput
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Label')}
    onChange={action('Changed')}
    value={text('Text', '')}
    placeholder={text('Placeholder', 'Placeholder')}
  />
);
