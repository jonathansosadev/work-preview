import React from 'react';
import {withKnobs, text} from '@storybook/addon-knobs';
import {Tooltip} from './Tooltip';

const withWrapper = (story: any) => <div style={{marginTop: 50}}>{story()}</div>;

const story = {
  component: Tooltip,
  title: 'Base/Dashboard/Tooltip',
  decorators: [withKnobs, withWrapper],
};

export const main = () => <Tooltip content={text('Content', 'test content')} />;

export default story;
