import React from 'react';
import {withKnobs, text} from '@storybook/addon-knobs';
import {withRouter} from '../../../../.storybook/withRouter';
import {TabButtonLinks} from './TabButtonLinks';

const story = {
  component: TabButtonLinks,
  title: 'Base/Dashboard/TabButtonLinks',
  decorators: [withKnobs, withRouter],
};

export const main = () => (
  <TabButtonLinks
    links={[
      {to: '/', name: text('Link 1', 'Home'), exact: true},
      {to: '/1', name: text('Link 2', 'Second link')},
      {to: '/2', name: text('Link 3', 'Third link')},
    ]}
  />
);

export default story;
