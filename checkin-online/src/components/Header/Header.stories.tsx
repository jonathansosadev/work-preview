import React from 'react';
import {withKnobs, text, boolean, number} from '@storybook/addon-knobs';
import {Header} from './Header';

export default {
  component: Header,
  title: 'Views|Header',
  decorators: [withKnobs],
};

export const main = () => (
  <Header
    activeStep={number('Active step', 1)}
    steps={number('Steps', 3)}
    hideLogo={boolean('Hide logo', false)}
    subtitle={text('Mobile subtitle', 'Subtitle')}
    title={text('Title', 'Title')}
  />
);

export const mobile = () => (
  <Header
    activeStep={number('Active step', 1)}
    steps={number('Steps', 3)}
    hideLogo={boolean('Hide logo', false)}
    subtitle={text('Mobile subtitle', 'Subtitle')}
    title={text('Title', 'Title')}
  />
);
mobile.story = {
  parameters: {
    viewport: {defaultViewport: 'mobileM'},
  },
};
