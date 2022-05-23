import React from 'react';
import {useAuth} from './auth';
import type {User} from '../utils/types';

const UserContext = React.createContext<User | null | undefined>(null);

function UserProvider(props: any) {
  const {accountDetails: user} = useAuth();

  return <UserContext.Provider value={user} {...props} />;
}

function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an UserProvider');
  }
  return context;
}

export {UserProvider, useUser, UserContext};
