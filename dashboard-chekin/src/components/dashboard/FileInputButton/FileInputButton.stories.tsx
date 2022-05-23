import React from 'react';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {FileInputButton} from './FileInputButton';

const withWrapper = (story: any) => <div style={{width: 200}}>{story()}</div>;

const story = {
  title: 'Base/Dashboard/File Input Button',
  component: FileInputButton,
  decorators: [withKnobs, withWrapper],
};

export const main = () => (
  <FileInputButton
    onChange={action('Changed')}
    secondary={boolean('Secondary', false)}
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Upload')}
  />
);

export const disabled = () => (
  <FileInputButton
    onChange={action('Changed')}
    secondary={boolean('Secondary', false)}
    disabled={boolean('Disabled', true)}
    label={text('Label', 'Upload')}
  />
);

export const secondary = () => (
  <FileInputButton
    onChange={action('Changed')}
    secondary={boolean('Secondary', true)}
    disabled={boolean('Disabled', false)}
    label={text('Label', 'Upload')}
  />
);

export const secondaryDisabled = () => (
  <FileInputButton
    onChange={action('Changed')}
    secondary={boolean('Secondary', true)}
    disabled={boolean('Disabled', true)}
    label={text('Label', 'Upload')}
  />
);

export default story;
