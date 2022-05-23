import React from 'react';
import {ValidationButton} from './ValidationButton';
import {boolean, withKnobs, select} from '@storybook/addon-knobs';
import {VALIDATION_STATUSES} from '../../../utils/constants';

const story = {
  title: 'Base/Dashboard/Validation Button',
  component: ValidationButton,
  decorators: [withKnobs],
};

export const main = () => (
  <ValidationButton
    disabled={boolean('Disabled', false)}
    status={select('Status', Object.values(VALIDATION_STATUSES), '')}
  />
);

export const inProgress = () => (
  <ValidationButton
    disabled={boolean('Disabled', false)}
    status={select(
      'Status',
      Object.values(VALIDATION_STATUSES),
      VALIDATION_STATUSES.inProgress,
    )}
  />
);

export const completed = () => (
  <ValidationButton
    disabled={boolean('Disabled', false)}
    status={select(
      'Status',
      Object.values(VALIDATION_STATUSES),
      VALIDATION_STATUSES.complete,
    )}
  />
);

export const error = () => (
  <ValidationButton
    disabled={boolean('Disabled', false)}
    status={select(
      'Status',
      Object.values(VALIDATION_STATUSES),
      VALIDATION_STATUSES.error,
    )}
  />
);

export const disabled = () => (
  <ValidationButton
    disabled={boolean('Disabled', true)}
    status={select('Status', Object.values(VALIDATION_STATUSES), '')}
  />
);

export default story;
