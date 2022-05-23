import React from 'react';
import {withKnobs, text} from '@storybook/addon-knobs';
import {SidebarLayout} from './SidebarLayout';
import Sidebar from '../Sidebar';
import {withRouter} from '../../../../.storybook/withRouter';

const story = {
  component: SidebarLayout,
  title: 'Base/Dashboard/SidebarLayout',
  decorators: [withKnobs, withRouter],
};

export const main = () => (
  <SidebarLayout
    header={<div>Heading</div>}
    sidebar={
      <Sidebar
        links={[
          {
            to: '/',
            name: text('Link 1', 'Home'),
            exact: true,
            icon: (active) => (active ? <div>1</div> : <div>0</div>),
          },
          {
            to: '/test',
            name: text('Link 2', 'Test'),
            icon: (active) => (active ? <div>1</div> : <div>0</div>),
          },
        ]}
      />
    }
  >
    Content
  </SidebarLayout>
);

export default story;
