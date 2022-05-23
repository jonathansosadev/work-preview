import React from 'react';
import api, {queryFetcher} from '../../../api';
import {useQuery} from 'react-query';
import {useLocation} from 'react-router-dom';
import {useUser} from '../../../context/user';
import {initHubspot} from '../../../analytics/hubspot';

const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';

type HubspotTokenPayload = {
  email: string;
  first_name?: string;
  last_name?: string;
};

type HubspotToken = {
  token: string;
};

function fetchHubspotToken({
  queryKey: [, payload],
}: {
  queryKey: [string, HubspotTokenPayload];
}) {
  return queryFetcher(api.hubspot.ENDPOINTS.all(), {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

function Hubspot() {
  const user = useUser();
  const {pathname} = useLocation();

  const hubspotTokenPayload = React.useMemo(() => {
    return {
      email: user?.email!,
      first_name: user?.first_name,
      last_name: user?.last_name,
    };
  }, [user]);
  const {data: hubspotToken} = useQuery<HubspotToken, [string, HubspotTokenPayload]>(
    ['hubspotToken', hubspotTokenPayload],
    fetchHubspotToken,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: Boolean(IS_PRODUCTION_BUILD && user),
    },
  );

  const identificationEmail = user?.email;
  const identificationToken = hubspotToken?.token;

  React.useLayoutEffect(() => {
    if (identificationToken && identificationEmail) {
      // @ts-ignore
      window.hsConversationsSettings = {
        identificationEmail,
        identificationToken,
      };
    } else {
      // @ts-ignore
      window.hsConversationsSettings = {
        loadImmediately: false,
      };
    }
  }, [identificationEmail, identificationToken]);

  React.useEffect(() => {
    if (IS_PRODUCTION_BUILD) {
      // @ts-ignore
      const HubSpotConversations = window.HubSpotConversations;

      if (HubSpotConversations) {
        if (identificationToken && identificationEmail) {
          HubSpotConversations.widget.load();
          HubSpotConversations.resetAndReloadWidget();
        } else {
          const status = HubSpotConversations.widget.status();

          if (status?.loaded) {
            HubSpotConversations.widget.refresh();
          } else {
            HubSpotConversations.widget.load();
          }
        }
      } else {
        // @ts-ignore
        window.hsConversationsOnReady = [
          () => {
            HubSpotConversations.widget.load();
          },
        ];
      }
    }
  }, [identificationEmail, identificationToken]);

  React.useEffect(() => {
    if (IS_PRODUCTION_BUILD) {
      initHubspot(pathname);
    }
  }, [pathname]);

  return null;
}

export {Hubspot};
