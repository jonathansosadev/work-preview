import React from 'react';
import {withKnobs, select} from '@storybook/addon-knobs';
import {CreateOfferButton} from './CreateOfferButton';
import {withRouter} from '../../../../.storybook/withRouter';

const story = {
  component: CreateOfferButton,
  title: 'Base/Dashboard/CreateOfferButton',
  decorators: [
    withKnobs,
    withRouter,
    (story: any) => <div style={{margin: 100}}>{story()}</div>,
  ],
};

export const main = () => (
  <CreateOfferButton
    position={select('Position', ['center', 'bottom', 'bottom-right'], 'center')}
  />
);

export default story;
