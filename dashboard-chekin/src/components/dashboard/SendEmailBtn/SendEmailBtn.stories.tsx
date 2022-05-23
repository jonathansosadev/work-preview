import React from 'react';
import {withKnobs, text, boolean, select} from '@storybook/addon-knobs';
import {SendEmailBtnView, SendEmailStatus} from './SendEmailBtnView';

const story = {
  component: SendEmailBtnView,
  title: 'Base/Dashboard/SendEmailBtn',
  decorators: [withKnobs],
};

const DEFAULT_LABEL = 'Send email';
const labelKnob = text('Label', DEFAULT_LABEL);
const STATUS_OPTIONS: SendEmailStatus[] = ['idle', 'loading', 'success'];

export const Main = () => (
  <SendEmailBtnView
    sendEmail={() => {}}
    label={labelKnob}
    disabled={boolean('Disabled', false)}
    status={select('Status', STATUS_OPTIONS, 'idle')}
  />
);

export default story;
