import React from 'react';
import styled from 'styled-components';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';
import {Button} from './Button';

const story = {
  component: Button,
  title: 'Base/Dashboard/Button',
  decorators: [withKnobs],
};

const BlueIconPlaceholder = styled.span`
  height: 15px;
  width: 15px;
  border: 1px dashed #385cf8;
  display: inline-block;
  margin-right: 12px;
`;

const WhiteIconPlaceholder = styled(BlueIconPlaceholder)`
  border-color: white;
`;

export const main = () => (
  <Button
    secondary={boolean('Secondary', false)}
    disabled={boolean('Disabled', false)}
    label={
      <>
        <WhiteIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export const disabled = () => (
  <Button
    secondary={boolean('Secondary', false)}
    disabled={boolean('Disabled', true)}
    label={
      <>
        <WhiteIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export const secondary = () => (
  <Button
    secondary={boolean('Secondary', true)}
    disabled={boolean('Disabled', false)}
    label={
      <>
        <BlueIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export const secondaryDisabled = () => (
  <Button
    secondary={boolean('Secondary', true)}
    disabled={boolean('Disabled', true)}
    label={
      <>
        <BlueIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export const danger = () => (
  <Button
    danger={boolean('Danger', true)}
    disabled={boolean('Disabled', false)}
    outlined={boolean('Outlined', false)}
    secondary={boolean('Secondary', false)}
    label={
      <>
        <BlueIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export const dangerDisabled = () => (
  <Button
    danger={boolean('Danger', true)}
    disabled={boolean('Disabled', true)}
    secondary={boolean('Secondary', false)}
    label={
      <>
        <BlueIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export const link = () => (
  <Button
    link={boolean('Link', true)}
    disabled={boolean('Disabled', false)}
    secondary={boolean('Secondary', false)}
    label={
      <>
        <BlueIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export const linkDisabled = () => (
  <Button
    link={boolean('Link', true)}
    disabled={boolean('Disabled', true)}
    secondary={boolean('Secondary', false)}
    label={
      <>
        <BlueIconPlaceholder />
        {text('Label', 'Hello')}
      </>
    }
    onClick={action('Clicked')}
  />
);

export default story;
