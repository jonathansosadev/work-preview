import React from 'react';
import moment from 'moment';
import i18n from 'i18next';
import {useMutation, useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import api from '../../../api';
import {useWebsocket} from '../../../context/websocket';
import {StartGenerateUpsReportsTypes} from '../../../api/documents';
import {MONTHS, WS_EVENT_TYPES} from '../../../utils/constants';
import {useErrorModal, useIsMounted, useStatus} from '../../../utils/hooks';
import {downloadFromLink, ErrorType, toastResponseError} from '../../../utils/common';
import {SelectOption} from '../../../utils/types';
import revenueIcon from '../../../assets/revenue-icon.svg';
import dealsSoldIcon from '../../../assets/offers-sold-icon.svg';
import ReportsCard from '../ReportsCard';
import {
  BlockCards,
  RowSelects,
  StyledReportsSection,
  StyledSelect,
  StyledSelectYears,
} from './styled';

const allMonthsOptions = Object.values(MONTHS);
const allFilterOption: DateOption = {
  label: i18n.t('all'),
  value: '',
};

const currentDate = {
  month: moment().month() + 1,
  year: moment().year(),
};
const currentDateOptions = {
  month: {
    label:
      allMonthsOptions.find(
        (singleMonth) => Number(singleMonth.value) === currentDate.month,
      )?.label || '',
    value: String(currentDate.month),
  },
  year: {
    label: currentDate.year,
    value: currentDate.year,
  },
};

function getYearsOptions(startYearSelect: number) {
  return new Array(currentDate.year - startYearSelect + 1)
    .fill('')
    .map((_, index) => {
      const generatedYear = startYearSelect + index;
      return {
        label: generatedYear,
        value: generatedYear,
      };
    })
    .reverse();
}

function getMonthsOptions(
  startDateSelect: {month: number; year: number},
  selectedYear: DateOption,
) {
  const isFirstYear = selectedYear.value === startDateSelect.year;
  const isLastYear = selectedYear.value === currentDate.year;
  const isFirstAndLastYear = isFirstYear && isLastYear;

  const isMonthMoreStart = (singleMonth: number) => singleMonth >= startDateSelect.month;
  const isMonthLessCurrent = (singleMonth: number) =>
    singleMonth <= startDateSelect.month;
  const isMonthMoreAndLess = (singleMonth: number) =>
    isMonthMoreStart(singleMonth) && isMonthLessCurrent(singleMonth);

  if (isFirstAndLastYear) {
    return allMonthsOptions.filter((singleMonth) =>
      isMonthMoreAndLess(Number(singleMonth.value)),
    );
  }
  if (isFirstYear) {
    return allMonthsOptions.filter((singleMonth) =>
      isMonthMoreStart(Number(singleMonth.value)),
    );
  }
  if (isFirstAndLastYear) {
    return allMonthsOptions.filter((singleMonth) =>
      isMonthLessCurrent(Number(singleMonth.value)),
    );
  }
  return allMonthsOptions;
}

function getHousingIdQuery(housingId: string | undefined) {
  if (!housingId || housingId === 'all') return '';
  return housingId;
}

type DateOption = SelectOption<any, number | string>;

type ReportsSectionProps = {
  housingFilter?: SelectOption<string>;
};

function ReportsSection({housingFilter}: ReportsSectionProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const ws = useWebsocket();
  const {isLoading: isDownloading, setStatus} = useStatus({autoReset: true});
  const {ErrorModal, displayError} = useErrorModal();
  const [upsellingReportId, setUpsellingReportId] = React.useState<string>('');
  const [monthsOptions, setMonthsOptions] = React.useState<DateOption[] | null>(null);
  const [yearsOptions, setYearsOptions] = React.useState<DateOption[] | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<DateOption>(
    currentDateOptions.month,
  );
  const [selectedYear, setSelectedYear] = React.useState<DateOption>(
    currentDateOptions.year,
  );
  const isSelectedAllYears = String(selectedYear.value) === allFilterOption.value;
  const isNotEmptyOptions = yearsOptions && monthsOptions;

  const getHousingIdQueryParam = () => {
    const housingId = getHousingIdQuery(housingFilter?.value);
    return `housing_id=${housingId}`;
  };

  const {data: firstDealCreatedDate} = useQuery<{first_deal_date: string}>(
    api.upselling.ENDPOINTS.oneDealDate(getHousingIdQueryParam()),
    {
      onError: (error: any) => {
        if (error && isMounted.current) {
          toastResponseError(error);
        }
      },
    },
  );

  const startDateSelect = React.useMemo(() => {
    return {
      year: moment(firstDealCreatedDate?.first_deal_date).year(),
      month: moment(firstDealCreatedDate?.first_deal_date).month() + 1,
    };
  }, [firstDealCreatedDate?.first_deal_date]);

  const dealsReportsQueryParams = () => {
    const housingId = getHousingIdQuery(housingFilter?.value);
    return `year=${selectedYear.value}&month=${selectedMonth.value}&housing_id=${housingId}`;
  };

  const {data: dealsReports, isLoading: isLoadingReports} = useQuery<{
    count: string;
    revenue: string;
  }>(api.upselling.ENDPOINTS.dealsReports(dealsReportsQueryParams()), {
    onError: (error: any) => {
      if (error && isMounted.current) {
        toastResponseError(error);
      }
    },
  });

  const startGenerationReportsMutation = useMutation<
    unknown,
    ErrorType,
    StartGenerateUpsReportsTypes
  >((payload) => api.documents.startGenerateUpsellingReports(payload), {
    onError: (error: ErrorType) => {
      if (error && isMounted.current) {
        setStatus('idle');
        toastResponseError(error);
      }
    },
  });

  const downloadLink = useQuery<{link: string}, ErrorType>(
    api.documents.ENDPOINTS.downloadExcelUpsellingReports(upsellingReportId),
    {
      enabled: false,
      onSuccess: (dataLink) => {
        if (dataLink) downloadFromLink(dataLink.link);
      },
      onError: (error: ErrorType) => {
        if (error && isMounted.current) {
          toastResponseError(error);
        }
      },
      onSettled: () => {
        setStatus('idle');
        setUpsellingReportId('');
      },
    },
  );

  React.useEffect(() => {
    const newYearsOptions = getYearsOptions(startDateSelect.year);
    setYearsOptions([allFilterOption, ...newYearsOptions]);
  }, [startDateSelect.year]);

  React.useEffect(() => {
    const newMonthOptions = getMonthsOptions(startDateSelect, selectedYear);
    setMonthsOptions([allFilterOption, ...newMonthOptions]);
  }, [startDateSelect, selectedYear]);

  React.useEffect(
    function handleWSEvents() {
      if (ws.message?.event_type === WS_EVENT_TYPES.upsellingReportExcelFinished) {
        const reportId = ws.message.user_upselling_report_id;
        if (reportId) {
          setUpsellingReportId(reportId);
        }
      }

      if (ws.message?.event_type === WS_EVENT_TYPES.upsellingReportExcelFailed) {
        displayError();
        setStatus('idle');
      }

      return () => {
        ws.clearMessage();
      };
    },
    [displayError, downloadLink, setStatus, ws],
  );

  React.useEffect(() => {
    if (upsellingReportId) downloadLink.refetch();
  }, [downloadLink, upsellingReportId]);

  const handleChangeYear = (e: DateOption) => {
    setSelectedYear(e);
  };

  const handleChangeMonth = (e: DateOption) => {
    setSelectedMonth(e);
  };

  const getReportsDownloadMutationPayload = () => {
    const payload: StartGenerateUpsReportsTypes = {
      year: String(selectedYear.value),
      month: String(selectedMonth.value),
    };
    const isHousingIdIsNotEmptyOrAll = getHousingIdQuery(housingFilter?.value);
    if (isHousingIdIsNotEmptyOrAll) {
      payload.housing_id = getHousingIdQuery(housingFilter?.value);
    }
    return payload;
  };

  const handleClickDownload = async () => {
    setStatus('loading');
    const payload = getReportsDownloadMutationPayload();
    startGenerationReportsMutation.mutate(payload);
  };

  const downloadButtonProps = dealsReports?.count
    ? {
        label: isDownloading ? `${t('downloading')}...` : t('download_details'),
        onClick: handleClickDownload,
        disabled: isDownloading,
      }
    : undefined;

  return (
    <StyledReportsSection>
      {isNotEmptyOptions && (
        <RowSelects>
          <StyledSelect
            defaultValue={selectedMonth}
            onChange={handleChangeMonth}
            disabled={isSelectedAllYears || isDownloading}
            options={monthsOptions}
          />
          <StyledSelectYears
            onChange={handleChangeYear}
            defaultValue={selectedYear}
            disabled={isDownloading}
            options={yearsOptions}
          />
        </RowSelects>
      )}
      <BlockCards>
        <ReportsCard
          loading={isLoadingReports || isDownloading}
          title={t('deals_sold')}
          content={{
            image: {src: dealsSoldIcon, alt: '', height: 71, width: 54},
            count: dealsReports?.count || '0',
            subtitle: t('deals'),
          }}
        />
        <ReportsCard
          loading={isLoadingReports || isDownloading}
          title={t('total_revenue')}
          content={{
            image: {src: revenueIcon, alt: 'revenue-icon', height: 64, width: 52},
            count: dealsReports?.revenue || '0',
            subtitle: t('euros'),
          }}
          button={downloadButtonProps}
        />
      </BlockCards>
      <ErrorModal />
    </StyledReportsSection>
  );
}

export {ReportsSection};
