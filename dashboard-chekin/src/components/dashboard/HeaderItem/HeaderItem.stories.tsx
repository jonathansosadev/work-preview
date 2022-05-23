import React from 'react';
import notificationIcon from '../../../assets/icon-notification.svg';
import {action} from '@storybook/addon-actions';
import {withKnobs, text} from '@storybook/addon-knobs';
import {HeaderItem} from './HeaderItem';

const story = {
  component: HeaderItem,
  title: 'Base/Dashboard/HeaderItem',
  decorators: [withKnobs, (story: any) => <div style={{width: 200}}>{story()}</div>],
};

export const main = () => (
  <HeaderItem
    onMenuItemClick={action('Clicked')}
    menuOptions={[
      {
        label: 'eat',
        value: 'e',
      },
      {
        label: 'drink',
        value: 'ed',
      },
    ]}
  >
    {() => (
      <div>
        <img src={notificationIcon} alt="Notifications" />
        {text('Label', 'Label')})
      </div>
    )}
  </HeaderItem>
);

export default story;
