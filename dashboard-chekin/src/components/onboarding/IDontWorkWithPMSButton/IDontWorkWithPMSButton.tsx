import React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';
import {Button} from './styled';

function IDontWorkWithPMSButton() {
  const {t} = useTranslation();
  const location = useLocation();

  return (
    <Button
      to={{
        ...location,
        pathname: '/register/form',
      }}
    >
      {t('i_dont_work_with_pms')}
    </Button>
  );
}

export {IDontWorkWithPMSButton};
