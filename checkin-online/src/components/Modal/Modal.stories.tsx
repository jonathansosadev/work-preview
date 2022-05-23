import React from 'react';
import errorIcon from '../../assets/error.svg';
import {withKnobs, text} from '@storybook/addon-knobs';
import {Modal} from './Modal';

export default {
  component: Modal,
  title: 'Base|Modal',
  decorators: [withKnobs],
};

export const Main = () => (
  <Modal
    title={text('Title', 'Title')}
    text={text('Text', 'Text')}
    iconSrc={errorIcon}
    iconAlt="Error mark"
    open={true}
  />
);
