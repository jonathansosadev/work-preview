import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text} from '@storybook/addon-knobs';
import {GridSingleItem} from './GridSingleItem';

const story = {
  component: GridSingleItem,
  title: 'Base/Dashboard/GridSingleItem',
  decorators: [withKnobs, (story: any) => <div style={{width: 386}}>{story()}</div>],
};

export const Main = () => {
  const [isActive, setIsActive] = React.useState(false);

  return (
    <GridSingleItem
      onActiveSwitch={setIsActive}
      active={isActive}
      name={text('Name', 'Late Check-out')}
      onDelete={action('Deleted')}
    />
  );
};

export const withoutSwitch = () => {
  return (
    <GridSingleItem name={text('Name', 'Late Check-out')} onDelete={action('Deleted')} />
  );
};

export const WithoutDelete = () => {
  const [isActive, setIsActive] = React.useState(false);

  return (
    <GridSingleItem
      onActiveSwitch={setIsActive}
      active={isActive}
      name={text('Name', 'Late Check-out')}
    />
  );
};

export const withoutDeleteAndSwitch = () => {
  return <GridSingleItem name={text('Name', 'Late Check-out')} />;
};

export default story;
