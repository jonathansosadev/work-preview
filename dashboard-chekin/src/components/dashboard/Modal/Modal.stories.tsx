import React from 'react';
import iconPlaceholder from '../../../assets/icon-placeholder.svg';
import {withKnobs, text} from '@storybook/addon-knobs';
import {Modal} from './Modal';

const withBg = (story: any) => (
  <div style={{height: '100vh', width: '100%', backgroundColor: 'magenta'}}>
    {story()}
  </div>
);

const story = {
  component: Modal,
  title: 'Base/Dashboard/Modal',
  decorators: [withKnobs, withBg],
};

export const main = () => (
  <Modal
    title={text('Title', 'Title')}
    text={text('Text', 'Text')}
    iconSrc={iconPlaceholder}
    iconAlt="Error mark"
    open={true}
  />
);

export default story;
