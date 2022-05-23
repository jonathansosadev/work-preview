import React from 'react';
import {useQueryClient} from 'react-query';
import api from 'api';
import {EMAIL_SENDING_SETTINGS_QUERY_KEY} from 'components/dashboard/OnlineSendingSettings';

export function usePrefetchSendingSettings(sendingSettingsId: string | undefined | null) {
  const queryClient = useQueryClient();

  React.useEffect(
    function prefetchData() {
      if (sendingSettingsId) {
        queryClient.prefetchQuery(
          [EMAIL_SENDING_SETTINGS_QUERY_KEY, sendingSettingsId],
          () => api.emailSendingSettings.get(sendingSettingsId),
        );
      }
    },
    [queryClient, sendingSettingsId],
  );
}
