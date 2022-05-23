import React from 'react';
import {withKnobs, text} from '@storybook/addon-knobs';
import {TabLinks} from './TabLinks';
import {withRouter} from '../../../../.storybook/withRouter';

const withWrapper = (story: any) => <div style={{marginTop: 50}}>{story()}</div>;

const story = {
  component: TabLinks,
  title: 'Base/Dashboard/TabLinks',
  decorators: [withKnobs, withWrapper, withRouter],
};

export const main = () => (
  <TabLinks
    links={[
      {
        name: text('Link 1', 'Home'),
        to: '/',
        exact: true,
      },
      {
        name: text('Link 2', 'Link 2'),
        to: '/2',
      },
      {
        name: text('Link 3', 'Link 3'),
        to: '/3',
      },
    ]}
  />
);

export default story;
