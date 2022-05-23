import React from 'react';
import {useTranslation} from 'react-i18next';
import {Subtitle} from '../Section';
import Tooltip from '../Tooltip';
import Selectors from '../Selectors';
import {SubtitleWrapper} from './styled';

export enum FEES_OPTIONS_PAYLOAD {
  GUEST = 'GUEST',
  MANAGER = 'MANAGER',
}

const feesOptions = {
  discount_fees_from_my_balance: FEES_OPTIONS_PAYLOAD.MANAGER,
  charge_fees_to_guest: FEES_OPTIONS_PAYLOAD.GUEST,
};

function FeesOptions({
  className,
  formNames,
  setIsSelectorsTouched,
  preloadedSelectorsData,
  defaultFormValues,
}: {
  formNames: {[key: string]: string};
  className?: string;
  setIsSelectorsTouched: any;
  preloadedSelectorsData: any;
  defaultFormValues: any;
}) {
  const {t} = useTranslation();

  return (
    <div className={className}>
      <SubtitleWrapper>
        <Subtitle>{t('select_fees_subtitle')}</Subtitle>
        <Tooltip content={t('select_fees_tooltip_content')} />
      </SubtitleWrapper>
      <Selectors
        setIsSelectorsTouched={setIsSelectorsTouched}
        preloadedSelectorsData={preloadedSelectorsData}
        selectorsFormNames={formNames}
        radioValues={feesOptions}
        defaultFormValues={defaultFormValues}
      />
    </div>
  );
}

export {FeesOptions};
