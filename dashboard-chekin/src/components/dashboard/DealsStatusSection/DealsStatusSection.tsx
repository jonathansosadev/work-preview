import React from 'react';
import {useQuery} from 'react-query';
import {useHistory, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import api from '../../../api';
import {useIsMounted} from '../../../utils/hooks';
import {ErrorType, toastResponseError} from '../../../utils/common';
import {SelectOption} from '../../../utils/types';
import {Deal} from '../../../utils/upselling/types';
import {UPSELLING_LINKS} from '../../../utils/links';
import CupOfTeaPlaceholder from '../CupOfTeaPlaceholder';
import DealsStatusTable from '../DealsStatusTable';
import TabButtonLinks from '../TabButtonLinks';
import {Loader} from '../../common/Loader/Loader';
import {TabButtonLink} from '../TabButtonLinks/TabButtonLinks';
import {StyledUpsellingSection} from '../UpsellingSections';
import {LoaderWrapper} from '../ChangePlanModal/styled';
import {AbsoluteCenterWrapper} from './styled';

export enum DEAL_FILTERS {
  requested = 'requested',
  approved = 'approved',
  rejected = 'rejected',
  paid = 'paid',
}

const i18nDealFilterNames: Record<DEAL_FILTERS, string> = {
  [DEAL_FILTERS.rejected]: 'rejected',
  [DEAL_FILTERS.approved]: 'approved',
  [DEAL_FILTERS.requested]: 'pending',
  [DEAL_FILTERS.paid]: 'paid',
};

type Params = {
  filter: DEAL_FILTERS;
};

type DealsStatusSectionProps = {
  housingFilter: SelectOption | undefined;
};

function getHousingIdQuery(housingId?: string) {
  if (housingId && housingId !== 'all') {
    return housingId;
  }
  return '';
}

function DealsStatusSection({housingFilter}: DealsStatusSectionProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {filter} = useParams<Params>();
  const history = useHistory();
  const statusFilter = filter?.toUpperCase();
  const housingId = getHousingIdQuery(housingFilter?.value);

  const getDealsQueryKey = (status = statusFilter) => {
    return api.upselling.ENDPOINTS.deals(`status=${status}&housing_id=${housingId}`);
  };
  const {data: deals, isLoading: isLoadingDeals} = useQuery<Deal[], ErrorType>(
    getDealsQueryKey(),
    {
      onError: (error) => {
        if (error && isMounted.current) {
          toastResponseError(error);
        }
      },
    },
  );

  React.useLayoutEffect(
    function keepAnyFilter() {
      const isUnknownFilter = filter && !Object.values(DEAL_FILTERS).includes(filter);

      if (!filter || isUnknownFilter) {
        history.replace(`${UPSELLING_LINKS.offersStatus}/${DEAL_FILTERS.requested}`);
      }
    },
    [filter, history],
  );

  const filtersLinks: TabButtonLink[] = Object.values(DEAL_FILTERS).map((filter) => {
    return {
      name: t(i18nDealFilterNames[filter]),
      to: `${UPSELLING_LINKS.offersStatus}/${filter}`,
    };
  });

  const hasDeals = Boolean(deals?.length);
  const placeholderSubtitle = t(
    `there_are_no_${
      i18nDealFilterNames[filter] || i18nDealFilterNames[DEAL_FILTERS.requested]
    }_requests`,
  );

  return (
    <StyledUpsellingSection>
      <TabButtonLinks links={filtersLinks} />
      {isLoadingDeals && (
        <AbsoluteCenterWrapper>
          <LoaderWrapper>
            <Loader label={t('loading')} />
          </LoaderWrapper>
        </AbsoluteCenterWrapper>
      )}
      {!isLoadingDeals && (
        <>
          {hasDeals ? (
            <DealsStatusTable
              filter={filter}
              getDealsQueryKey={getDealsQueryKey}
              deals={deals}
            />
          ) : (
            <CupOfTeaPlaceholder subtitle={placeholderSubtitle} />
          )}
        </>
      )}
    </StyledUpsellingSection>
  );
}

export {DealsStatusSection};
