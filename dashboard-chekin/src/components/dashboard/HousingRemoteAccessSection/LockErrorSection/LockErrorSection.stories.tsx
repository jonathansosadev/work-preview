import React from 'react';
import LockErrorSection from '.';

const story = {
  component: LockErrorSection,
  title: 'Base/Dashboard/LockErrorSection',
};

const mocked_account = {
  label: 'фцуацуфацуф [KeyNest]',
  value: '2f4c576adbfd4456b3c0984f167727ea',
  data: {
    id: '2f4c576adbfd4456b3c0984f167727ea',
    account_name: 'фцуацуфацуф',
    vendor: 'k',
    username: '',
    email: '',
    password: '',
    token: 'a1c48c6c264c45528315ad254a5f8130',
  },
};

export const Default = () => {
  return <LockErrorSection account={mocked_account} />;
};

export default story;
