import React from 'react';
import {withKnobs, text} from '@storybook/addon-knobs';
import {QuestionTooltip} from './QuestionTooltip';

const withWrapper = (story: any) => <div style={{marginTop: 50}}>{story()}</div>;

export default {
  component: QuestionTooltip,
  title: 'Base/Dashboard/Tooltip',
  decorators: [withKnobs, withWrapper],
};

export const main = () => <QuestionTooltip content={text('Content', 'test content')} />;
