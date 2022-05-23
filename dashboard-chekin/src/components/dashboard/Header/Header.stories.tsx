import React from 'react';
import {Header} from './Header';
import {text, withKnobs} from '@storybook/addon-knobs';
import {withRouter} from '../../../../.storybook/withRouter';
import {UserContext} from '../../../context/user';

const story = {
  title: 'Base/Dashboard/Header',
  component: Header,
  decorators: [withKnobs, withRouter],
};

export const main = () => (
  <UserContext.Provider value={{name: text('Username', 'Username')} as any}>
    <Header />
  </UserContext.Provider>
);

export default story;
