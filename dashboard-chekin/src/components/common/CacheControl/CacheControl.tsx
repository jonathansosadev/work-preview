import React from 'react';
import {useTranslation} from 'react-i18next';
import {Container, Button, Title, ButtonContainer} from './styled';

const REFRESH_TIMEOUT_S = 60 * 5;
const LAST_MODIFIED_HEADER = 'last-modified';

async function fetchLastModifiedHeader() {
  const endpoint = process.env.PUBLIC_URL;

  try {
    const response = await fetch(endpoint, {
      method: 'HEAD',
      headers: {
        'Access-Control-Allow-Origin': 'no-cors',
      },
    });

    // @ts-ignore
    for (const pair of response?.headers?.entries()) {
      if (pair[0] === LAST_MODIFIED_HEADER) {
        return pair[1];
      }
    }
  } catch (err) {
    console.error(err);
  }

  return '';
}

function CacheControl() {
  const {t} = useTranslation();
  const [lastModified, setLastModified] = React.useState('');
  const [isNewerVersionDetected, setIsNewerVersionDetected] = React.useState(false);
  const [isRefreshButtonDisabled, setIsRefreshButtonDisabled] = React.useState(false);

  React.useEffect(() => {
    async function loadLastModified() {
      const lastModifiedHeader = await fetchLastModifiedHeader();
      if (lastModifiedHeader) {
        setLastModified(lastModifiedHeader);
      }
    }

    loadLastModified();
  }, []);

  const compareLastModified = React.useCallback(
    (lastModifiedHeader: string) => {
      if (!lastModified) {
        setLastModified(lastModifiedHeader);
        return;
      }

      if (lastModifiedHeader !== lastModified) {
        setIsNewerVersionDetected(true);
      }
    },
    [lastModified],
  );

  const checkForANewVersion = React.useCallback(async () => {
    const lastModifiedHeader = await fetchLastModifiedHeader();
    if (lastModifiedHeader) {
      compareLastModified(lastModifiedHeader);
    }
  }, [compareLastModified]);

  React.useEffect(() => {
    let interval = setInterval(checkForANewVersion, REFRESH_TIMEOUT_S * 1000);

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [checkForANewVersion]);

  const updateVersion = () => {
    setIsRefreshButtonDisabled(true);
    window.location.reload(true);
  };

  if (!isNewerVersionDetected) {
    return null;
  }

  return (
    <Container>
      <Title>{t('a_new_version_of_dashboard_available')}</Title>
      {t('refresh_to_get_the_latest_version')}
      <ButtonContainer>
        <Button
          disabled={isRefreshButtonDisabled}
          onClick={updateVersion}
          label={t('refresh')}
        />
      </ButtonContainer>
    </Container>
  );
}

export {CacheControl};
