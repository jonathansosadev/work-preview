import React from 'react';
import {TableButton} from './TableButton';
import {text, withKnobs, boolean} from '@storybook/addon-knobs';
import {withRouter} from '../../../../.storybook/withRouter';

const story = {
  component: TableButton,
  title: 'Base/Dashboard/TableButton',
  decorators: [withKnobs, withRouter],
};

export const main = () => (
  <TableButton danger={boolean('Danger', false)} label={text('Label', 'Text')} />
);

export const danger = () => (
  <TableButton danger={boolean('Danger', true)} label={text('Label', 'Text')} />
);

export default story;
