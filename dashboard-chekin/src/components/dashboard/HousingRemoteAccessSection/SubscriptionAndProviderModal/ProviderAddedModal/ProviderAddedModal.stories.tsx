import React from 'react';
import {ProviderAddedModal} from './ProviderAddedModal';

const story = {
  component: ProviderAddedModal,
  title: 'Base/dashboard/ProviderAddedModal',
};

export const Default = () => (
  <ProviderAddedModal handleFinishModalClose={() => {}} openHubspotChat={() => {}} />
);

export default story;
