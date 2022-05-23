import React from 'react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {FileInput} from './FileInput';

const withWrapper = (story: any) => <div style={{width: 'auto'}}>{story()}</div>;

export default {
  title: 'Base/File Input',
  component: FileInput,
  decorators: [withKnobs, withWrapper],
};

export const main = () => (
  <FileInput
    onChange={action('Changed')}
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Label')}
    value={{name: text('Value', 'File name')} as File}
    placeholder={text('Placeholder', 'Click to upload')}
    error={text('Error', '')}
    invalid={boolean('Invalid', false)}
  />
);

export const disabled = () => (
  <FileInput
    onChange={action('Changed')}
    disabled={boolean('Disabled', true)}
    label={text('Label', 'Label')}
    value={{name: text('Value', 'File name')} as File}
    placeholder={text('Placeholder', 'Click to upload')}
    error={text('Error', '')}
    invalid={boolean('Invalid', false)}
  />
);

export const empty = () => (
  <FileInput
    onChange={action('Changed')}
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Label')}
    value={{name: text('Value', '')} as File}
    placeholder={text('Placeholder', 'Click to upload')}
    error={text('Error', '')}
    invalid={boolean('Invalid', false)}
  />
);

export const invalid = () => (
  <FileInput
    onChange={action('Changed')}
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Label')}
    value={{name: text('Value', '')} as File}
    placeholder={text('Placeholder', 'Click to upload')}
    error={text('Error', '')}
    invalid={boolean('Invalid', true)}
  />
);

export const withError = () => (
  <FileInput
    onChange={action('Changed')}
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Label')}
    value={{name: text('Value', '')} as File}
    placeholder={text('Placeholder', 'Click to upload')}
    error={text('Error', 'Error')}
    invalid={boolean('Invalid', true)}
  />
);
