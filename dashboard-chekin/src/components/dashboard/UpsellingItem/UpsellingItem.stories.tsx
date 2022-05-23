import React from 'react';
import {withKnobs, text, number} from '@storybook/addon-knobs';
import {UpsellingItem, UpsellingLastItem} from './UpsellingItem';

const story = {
  component: [UpsellingItem, UpsellingLastItem],
  title: 'Base/Dashboard/UpsellingItem',
  decorators: [withKnobs],
};

export const main = () => <UpsellingItem title={text('Title', 'Title')} deals={[]} />;

export const withButtons = () => (
  <UpsellingItem title={text('Title', 'Title')} deals={[]} buttons={true} />
);

export const totalRevenue = () => (
  <UpsellingLastItem title={text('Title', 'Title')} totalRevenue={number('Number', 24)} />
);

export default story;
