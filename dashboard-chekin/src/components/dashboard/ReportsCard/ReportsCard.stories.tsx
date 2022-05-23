import React from 'react';
import {withKnobs, text} from '@storybook/addon-knobs';
import offersSoldIcon from '../../../assets/offers-sold-icon.svg';
import {ReportsCard} from './ReportsCard';

const story = {
  component: ReportsCard,
  title: 'Base/Dashboard/ReportsCard',
  decorators: [withKnobs],
};

export const main = () => (
  <ReportsCard
    title={text('Title', 'Title')}
    content={{
      image: {
        src: text('Src image', offersSoldIcon),
        alt: text('Alt image', 'alt-imag'),
      },
      count: text('Count', '0'),
      subtitle: text('Subtitle', 'Subtitle'),
    }}
  />
);

export const withButton = () => (
  <ReportsCard
    title={text('Title', 'Title')}
    content={{
      image: {
        src: text('Src image', offersSoldIcon),
        alt: text('Alt image', 'alt-imag'),
      },
      count: text('Count', '0'),
      subtitle: text('Subtitle', 'Subtitle'),
    }}
    button={{
      label: text('Button label', 'Button'),
    }}
  />
);

export default story;
