import React from 'react';
import moment, {Moment} from 'moment';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {DocumentReport, ShortHousing} from '../../../utils/types';
import api, {queryFetcher, ResolverTypes} from '../../../api';
import {getShortHousingsAsOptions, fetchShortHousings} from '../../../utils/housing';
import {SelectOption} from '../../../utils/types';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import {downloadFromLink} from '../../../utils/common';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useStatus,
} from '../../../utils/hooks';
import i18n from '../../../i18n';
import {HousingOption} from '../ReservationInfoSection/ReservationInfoSection';
import directDownloadIcon from '../../../assets/direct-download.svg';
import Select from '../Select';
import DateRangePicker from '../DateRangePicker';
import Button from '../Button';
import Loader from '../../common/Loader';
import {ContentWrapper} from '../../../styled/common';
import {
  ReportHeading,
  Section,
  SectionTitle,
  Main,
  Checkbox,
  CheckboxesGrid,
  DirectDownloadIcon,
  Text,
  LoaderWrapper,
} from '../../../styled/reports';

const ALL_PROPERTIES_OPTION = {
  value: 'ALL',
  label: i18n.t('all_properties'),
};

type ReservationReportField = {
  id: string;
  name: string;
};

function getIsAnyCheckboxChecked(checkboxes: {[key: string]: boolean}) {
  return Object.values(checkboxes).some(Boolean);
}

function fetchReservationReportFields() {
  return queryFetcher(api.documents.ENDPOINTS.reservationReportFields());
}

function fetchReservationReports() {
  return queryFetcher(api.documents.ENDPOINTS.reservationReports());
}

function getInitCheckboxes(fields: ReservationReportField[] | undefined) {
  const result: {[key: string]: boolean} = {};

  if (fields) {
    fields.slice(0, 3).forEach((field) => {
      result[field.id] = true;
    });
  }

  return result;
}

function injectAllPropertiesOptionToHousingOptions(options: HousingOption[]) {
  if (!options.length) {
    return [];
  }

  if (options.length < 2) {
    return options;
  }

  return [ALL_PROPERTIES_OPTION, ...options];
}

function ReservationReport() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const ws = useWebsocket();
  const {ErrorModal, displayError} = useErrorModal();
  const {isLoading, setStatus} = useStatus({autoReset: true});
  const [housing, setHousing] = React.useState<SelectOption | null>(null);
  const [focusedDateInput, setFocusedDateInput] = React.useState<
    'startDate' | 'endDate' | null
  >(null);
  const [startDate, setStartDate] = React.useState<Moment | null>(null);
  const [endDate, setEndDate] = React.useState<Moment | null>(null);

  const {
    data: reservationReportFields,
    error: reservationReportFieldsError,
    status: reservationReportFieldsStatus,
  } = useQuery<ReservationReportField[], string>(
    'reservationReportFields',
    fetchReservationReportFields,
  );
  useErrorToast(reservationReportFieldsError, {
    notFoundMessage:
      'Requested reservationReportFields could not be found. Please contact support.',
  });

  const [checkboxes, setCheckboxes] = React.useState<{[key: string]: boolean}>(() => {
    return getInitCheckboxes(reservationReportFields);
  });

  const {
    data: shortHousings,
    error: shortHousingsError,
    status: shortHousingsStatus,
  } = useQuery<ShortHousing[], string>('shortHousings', fetchShortHousings);
  useErrorToast(shortHousingsError, {
    notFoundMessage:
      'Requested short shortHousings could not be found. Please contact support.',
  });
  const {
    data: reservationReports,
    error: reservationReportsError,
    status: reservationReportsStatus,
    refetch: refetchReservationReports,
  } = useQuery<DocumentReport[], string>('reservationReports', fetchReservationReports);
  useErrorToast(reservationReportsError, {
    notFoundMessage:
      'Requested reservation reports could not be found. Please contact support.',
  });

  const isInitLoading =
    shortHousingsStatus === 'loading' ||
    reservationReportsStatus === 'loading' ||
    reservationReportFieldsStatus === 'loading';
  const latestReservationReport = reservationReports ? reservationReports[0] : null;
  const isSubmitButtonDisabled = React.useMemo(() => {
    return !housing || !startDate || !endDate || !getIsAnyCheckboxChecked(checkboxes);
  }, [endDate, housing, startDate, checkboxes]);

  const shortHousingsOptions = React.useMemo(() => {
    const housingOptions = getShortHousingsAsOptions(shortHousings);
    return injectAllPropertiesOptionToHousingOptions(housingOptions);
  }, [shortHousings]);

  const downloadReservationReport = React.useCallback(async () => {
    const isSelectedAllHousings = housing?.value === ALL_PROPERTIES_OPTION.value;
    const housingId = isSelectedAllHousings ? 'all' : housing!.value.toString();
    const reportsPayload = {
      housing_name: isSelectedAllHousings ? undefined : housing!.label,
    };

    const result = await api.documents.downloadReservationReport(
      housingId.toString(),
      reportsPayload,
    );

    setStatus('idle');
    if (result.error) {
      displayError(result.error);
    }

    if (result.data?.link) {
      downloadFromLink(result.data.link);
    } else {
      displayError();
    }
  }, [displayError, housing, setStatus]);

  React.useEffect(
    function handleWSEvents() {
      if (ws.message?.event_type === WS_EVENT_TYPES.reservationReportExcelFinished) {
        downloadReservationReport();
      }

      if (ws.message?.event_type === WS_EVENT_TYPES.reservationReportExcelFailed) {
        displayError();
        setStatus('idle');
      }

      return () => {
        ws.clearMessage();
      };
    },
    [displayError, downloadReservationReport, setStatus, ws],
  );

  React.useEffect(
    function preloadReportSettings() {
      if (!latestReservationReport) {
        return;
      }

      const startDate = moment(latestReservationReport.from_date);
      setStartDate(startDate);

      const endDate = moment(latestReservationReport.to_date);
      setEndDate(endDate);

      const checkboxes: {[key: string]: boolean} = {};
      latestReservationReport.fields_set.forEach((name: any) => {
        checkboxes[name] = true;
      });
      setCheckboxes(checkboxes);
    },
    [latestReservationReport],
  );

  const toggleCheckbox = (name?: string) => {
    if (!name) {
      return;
    }

    setCheckboxes((prevState) => {
      return {
        ...prevState,
        [name]: !prevState?.[name],
      };
    });
  };

  const handleHousingChange = (option: SelectOption) => {
    setHousing(option);
  };

  const getReservationReportTaskPayload = () => {
    if (housing?.value === ALL_PROPERTIES_OPTION.value) {
      return {};
    }

    return {
      housing_id: housing?.value,
    };
  };

  const startReportGenerationTask = async () => {
    const payload = getReservationReportTaskPayload();
    const result = await api.documents.startReservationReportGenerationTask(payload);

    if (result?.error) {
      displayError(result.error);
      setStatus('idle');
    }

    return result;
  };

  const getReservationReportPayload = () => {
    const fieldsSet = Object.keys(checkboxes).filter((key) => {
      return checkboxes[key];
    });

    return {
      from_date: startDate?.format('YYYY-MM-DD'),
      to_date: endDate?.format('YYYY-MM-DD'),
      fields_set: fieldsSet,
    };
  };

  const saveReservationReport = async () => {
    const payload = getReservationReportPayload();
    let result: ResolverTypes;

    if (latestReservationReport) {
      result = await api.documents.patchReservationReport(
        latestReservationReport?.id,
        payload,
      );
    } else {
      result = await api.documents.postReservationReport(payload);
    }

    if (!result.error) {
      await refetchReservationReports();
    }

    return result;
  };

  const saveAndDownloadReport = async () => {
    setStatus('loading');

    const saveResult = await saveReservationReport();
    if (saveResult.error && isMounted.current) {
      displayError(saveResult.error);
      setStatus('idle');
      return;
    }

    const reportId = saveResult.data?.id;
    if (!reportId) {
      displayError('Report id is missing.');
      setStatus('idle');
      return;
    }

    const taskResult = await startReportGenerationTask();
    if (taskResult.error && isMounted.current) {
      displayError(taskResult.error);
      setStatus('idle');
      return;
    }
  };

  return (
    <ContentWrapper>
      <ReportHeading linkToBack={'/booking'} title={t('download_booking_report')} />
      {isInitLoading ? (
        <LoaderWrapper>
          <Loader label={t('loading')} height={45} width={45} />
        </LoaderWrapper>
      ) : (
        <Main>
          <Text>{t('guest_report_description')}</Text>
          <Section>
            <SectionTitle>{t('download_report_first_step')}</SectionTitle>
            <Select
              value={housing}
              onChange={handleHousingChange}
              placeholder={t('select_your_property')}
              options={shortHousingsOptions}
              disabled={isLoading}
            />
          </Section>
          <Section>
            <SectionTitle>{t('download_report_second_step')}</SectionTitle>
            <DateRangePicker
              startDateId="check-in-date"
              startDate={startDate}
              endDateId="check-out-date"
              endDate={endDate}
              focusedInput={focusedDateInput}
              label={t('from_to')}
              disabled={isLoading}
              onFocusChange={(focusedInput) => setFocusedDateInput(focusedInput)}
              onDatesChange={({startDate, endDate}) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
            />
          </Section>
          <Section>
            <SectionTitle>{t('download_report_third_step')}</SectionTitle>
            <CheckboxesGrid>
              {reservationReportFields?.map((field) => {
                return (
                  <Checkbox
                    key={field.id}
                    name={field.id}
                    checked={checkboxes?.[field.id]}
                    label={field.name}
                    onChange={toggleCheckbox}
                    disabled={isLoading}
                  />
                );
              })}
            </CheckboxesGrid>
          </Section>
          <Button
            secondary
            onClick={saveAndDownloadReport}
            blinking={isLoading}
            disabled={isLoading || isSubmitButtonDisabled}
            label={
              <>
                <DirectDownloadIcon src={directDownloadIcon} alt="Arrow down" />
                {isLoading ? `${t('downloading')}...` : t('download_report')}
              </>
            }
          />
        </Main>
      )}
      <ErrorModal />
    </ContentWrapper>
  );
}

export {ReservationReport};
