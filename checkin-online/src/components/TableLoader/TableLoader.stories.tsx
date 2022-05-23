import React from 'react';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {TableLoader} from './TableLoader';

const story = {
  title: 'Base/Dashboard/Table Loader',
  component: TableLoader,
  decorators: [withKnobs],
};

export const main = () => (
  <TableLoader
    label={text('Label', 'Loading')}
    hideBorder={boolean('Hide border', false)}
  />
);

export default story;
