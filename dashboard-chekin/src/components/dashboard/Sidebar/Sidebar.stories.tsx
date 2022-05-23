import React from 'react';
import {withKnobs, text} from '@storybook/addon-knobs';
import {Sidebar} from './Sidebar';
import {withRouter} from '../../../../.storybook/withRouter';

const story = {
  component: Sidebar,
  title: 'Base/Dashboard/Sidebar',
  decorators: [withKnobs, withRouter],
};

export const main = () => (
  <Sidebar
    links={[
      {
        to: '/',
        name: text('Link 1', 'Link 1'),
        exact: true,
        icon: (active) => (active ? <div>1</div> : <div>0</div>),
        nested: [
          {
            to: '/',
            name: 'Link 1.1',
            exact: true,
          },
          {
            to: '/home2',
            name: 'Link 1.2',
          },
        ],
      },
      {
        to: '/test/1',
        name: text('Link 2', 'Link 2'),
        icon: (active) => (active ? <div>1</div> : <div>0</div>),
        nested: [
          {
            to: '/test/1',
            name: 'Link 2.1',
          },
          {
            to: '/test/2',
            name: 'Link 2.2',
          },
          {
            to: '/test/3',
            name: 'Link 2.3',
          },
        ],
      },
      {
        to: '/test2',
        name: text('Link 3', 'Link 3'),
        icon: (active) => (active ? <div>1</div> : <div>0</div>),
      },
      {
        to: '/test3',
        name: text('Link 4', 'Link 4'),
        icon: (active) => (active ? <div>1</div> : <div>0</div>),
      },
    ]}
  />
);

export default story;
