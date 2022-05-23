import React from 'react';
import {HousingPicture} from './HousingPicture';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  component: HousingPicture,
  title: 'Views|Housing Picture',
  decorators: [withKnobs],
};

export const main = () => <HousingPicture />;
