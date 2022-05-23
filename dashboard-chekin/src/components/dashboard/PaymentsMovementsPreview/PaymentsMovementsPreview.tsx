import React from 'react';
import {useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import moment, {Moment} from 'moment';
import i18n from '../../../i18n';
import api from '../../../api';
import {
  PaymentsMovements,
  PaymentType,
  SelectOption,
  ShortHousing,
} from '../../../utils/types';
import {toastResponseError} from '../../../utils/common';
import {useIsMounted} from '../../../utils/hooks';
import PaymentsMovementsGrid from '../PaymentsMovementsGrid';
import {DateFilter} from '../DateFilter/DateFilter';
import {
  Content,
  LoadMoreButton,
  MainHeader,
  DownloadBtn,
  DownloadIcon,
  Title,
  FiltersWrapper,
  StyledSelect,
  LoaderStyled,
} from './styled';

const PaymentsMovementsTypeFilters: {[key: string]: SelectOption} = {
  [PaymentType.reservationSecurityDeposit]: {
    value: PaymentType.reservationSecurityDeposit,
    label: i18n.t('deposit_charge_type'),
  },
  [PaymentType.reservationGeneral]: {
    value: PaymentType.reservationGeneral,
    label: i18n.t('booking_payment_and_tourist_taxes'),
  },
};

type GetFiltersPayload = {
  datesFilter: SearchDateFilter;
  selectedHousingFilter: SelectOption | null;
  selectedPaymentTypeFilter: SelectOption | null;
};

function getFiltersPayload({
  datesFilter,
  selectedHousingFilter,
  selectedPaymentTypeFilter,
}: GetFiltersPayload) {
  const startDateString = datesFilter.from
    ? moment(datesFilter.from)?.format('YYYY-MM-DD')
    : '';
  const endDateString = datesFilter.to
    ? moment(datesFilter.to)?.format('YYYY-MM-DD')
    : '';
  const housingId = selectedHousingFilter?.value || '';
  const paymentType = selectedPaymentTypeFilter?.value || '';
  return {startDateString, endDateString, housingId, paymentType};
}

type SearchDateFilter = {from: Moment | null; to: Moment | null};

type PaymentsMovementsPreviewProps = {
  isDownloadingExcel: boolean;
  onOpenExcelModal: () => void;
};

function PaymentsMovementsPreview({
  isDownloadingExcel,
  onOpenExcelModal,
}: PaymentsMovementsPreviewProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const [isPreviewMode, setIsPreviewMode] = React.useState(true);
  const [datesFilter, setDatesFilter] = React.useState<SearchDateFilter>({
    from: null,
    to: null,
  });
  const [
    selectedHousingFilter,
    setSelectedHousingFilter,
  ] = React.useState<SelectOption | null>(null);
  const [
    selectedPaymentTypeFilter,
    setSelectedPaymentTypeFilter,
  ] = React.useState<SelectOption | null>(null);

  const {data: movementsPreview, isLoading: isLoadingMovementsPreview} = useQuery<
    any,
    string
  >(api.paymentsSettings.ENDPOINTS.movementsPreview(), {
    onError: (error: any) => {
      if (error && isMounted.current) {
        toastResponseError(error, {
          notFoundMessage: 'Movements previews not found.',
        });
      }
    },
  });
  const movementsPreviewItems = movementsPreview?.total
    ? movementsPreview.items
    : movementsPreview;
  const hasMovements = movementsPreview?.total;

  const allMovementsQueryParams = () => {
    const filter = getFiltersPayload({
      datesFilter,
      selectedHousingFilter,
      selectedPaymentTypeFilter,
    });
    return `housing_id=${filter.housingId}&payment_type_in=${filter.paymentType}&created_at_after=${filter.startDateString}&created_at_before=${filter.endDateString}`;
  };
  const {data: allMovements, isLoading: isLoadingAllMovements} = useQuery<
    PaymentsMovements,
    string
  >(api.paymentsSettings.ENDPOINTS.fullMovements(allMovementsQueryParams()), {
    onError: (error: any) => {
      if (error && isMounted.current) {
        toastResponseError(error, {
          notFoundMessage: 'Movements not found.',
        });
      }
    },
  });

  const {data: housings} = useQuery<ShortHousing[], string>(
    api.housings.ENDPOINTS.all(`field_set=id,name`),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onError: (error: any) => {
        if (error && isMounted.current) {
          toastResponseError(error, {
            notFoundMessage: 'Housings not found.',
          });
        }
      },
    },
  );

  const housingsOptions = React.useMemo(() => {
    if (!housings) return [];
    return housings.map((singleHousing) => ({
      value: singleHousing.id,
      label: singleHousing.name,
    }));
  }, [housings]);

  const handleCreateReport = () => {
    onOpenExcelModal();
  };

  const handleChangeHousingFilter = (value: SelectOption) => {
    setIsPreviewMode(false);
    setSelectedHousingFilter(value);
  };

  const handleChangePaymentTypeFilter = (value: SelectOption) => {
    setIsPreviewMode(false);
    setSelectedPaymentTypeFilter(value);
  };

  const handleChangeDatesFilter = (value: SearchDateFilter) => {
    setIsPreviewMode(false);
    setDatesFilter(value);
  };
  const handleClearDatesFilter = () => {
    setDatesFilter({from: null, to: null});
  };

  if (!hasMovements) return <></>;
  return (
    <Content>
      <Title>{t('transactions')}</Title>
      <MainHeader>
        <FiltersWrapper>
          <DateFilter
            startDate={datesFilter.from}
            endDate={datesFilter.to}
            onRemove={handleClearDatesFilter}
            onChange={handleChangeDatesFilter}
          />
          <StyledSelect
            onChange={handleChangeHousingFilter}
            options={housingsOptions}
            noOptionsMessage={() => t('no_options')}
            value={selectedHousingFilter}
            placeholder={t('by_property')}
            isClearable={true}
          />
          <StyledSelect
            onChange={handleChangePaymentTypeFilter}
            noOptionsMessage={() => t('no_options')}
            options={Object.values(PaymentsMovementsTypeFilters)}
            value={selectedPaymentTypeFilter}
            placeholder={t('by_feature')}
            isClearable={true}
          />
        </FiltersWrapper>
        <DownloadBtn
          onClick={handleCreateReport}
          label={isDownloadingExcel ? `${t('downloading')}...` : t('download_excel')}
          icon={<DownloadIcon />}
          disabled={isDownloadingExcel}
          link
        />
      </MainHeader>
      {isLoadingMovementsPreview || isLoadingAllMovements ? (
        <LoaderStyled width={50} />
      ) : (
        <PaymentsMovementsGrid
          isPreviewMode={isPreviewMode}
          movements={isPreviewMode ? movementsPreviewItems : allMovements}
        />
      )}

      {isPreviewMode && (
        <LoadMoreButton onClick={() => setIsPreviewMode(false)} label={t('load_more')} />
      )}
    </Content>
  );
}

export {PaymentsMovementsPreview};
