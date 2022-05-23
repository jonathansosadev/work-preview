import React from 'react';
import moment, {Moment} from 'moment';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import i18n from '../../../i18n';
import {ShortHousing, SelectOption, DocumentReport} from '../../../utils/types';
import api, {queryFetcher, ResolverTypes} from '../../../api';
import {getShortHousingsAsOptions, fetchShortHousings} from '../../../utils/housing';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import {downloadFromLink} from '../../../utils/common';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useStatus,
} from '../../../utils/hooks';
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
import {HousingOption} from '../ReservationInfoSection/ReservationInfoSection';

const ALL_PROPERTIES_OPTION = {
  value: 'ALL',
  label: i18n.t('all_properties'),
};

const TYPES_OF_REPORTS_OPTIONS = ['by_check_in_date', 'by_hosted_guests'];

const typesOptions = TYPES_OF_REPORTS_OPTIONS.map((option) => ({
  value: option,
  label: i18n.t(option),
}));

type GusetReportField = {
  id: string;
  name: string;
};

function getIsAnyCheckboxChecked(checkboxes: {[key: string]: boolean}) {
  return Object.values(checkboxes).some(Boolean);
}

function fetchGuestReportFields() {
  return queryFetcher(api.documents.ENDPOINTS.guestReportFields());
}

function fetchGuestReports() {
  return queryFetcher(api.documents.ENDPOINTS.guestReports());
}

function getInitCheckboxes(fields: GusetReportField[] | undefined) {
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

function GuestReport() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const ws = useWebsocket();
  const {ErrorModal, displayError} = useErrorModal();
  const {isLoading, setStatus} = useStatus({autoReset: true});
  const [housing, setHousing] = React.useState<SelectOption | null>(null);
  const [typeOfReport, setTypeOfReport] = React.useState<SelectOption>(typesOptions[0]);
  const [focusedDateInput, setFocusedDateInput] = React.useState<
    'startDate' | 'endDate' | null
  >(null);
  const [startDate, setStartDate] = React.useState<Moment | null>(null);
  const [endDate, setEndDate] = React.useState<Moment | null>(null);
  const [guestReportId, setGuestReportId] = React.useState('');

  const {
    data: guestReportFields,
    error: guestReportFieldsError,
    status: guestReportFieldsStatus,
  } = useQuery<GusetReportField[], string>('guestReportFields', fetchGuestReportFields);
  useErrorToast(guestReportFieldsError, {
    notFoundMessage:
      'Requested guestReportFields could not be found. Please contact support.',
  });

  const [checkboxes, setCheckboxes] = React.useState<{[key: string]: boolean}>(() => {
    return getInitCheckboxes(guestReportFields);
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
    data: guestReports,
    error: guestReportsError,
    status: guestReportsStatus,
    refetch: refetchGuestReports,
  } = useQuery<DocumentReport[], string>('guestReports', fetchGuestReports);
  useErrorToast(guestReportsError, {
    notFoundMessage:
      'Requested guest reports could not be found. Please contact support.',
  });

  const isInitLoading =
    shortHousingsStatus === 'loading' ||
    guestReportsStatus === 'loading' ||
    guestReportFieldsStatus === 'loading';
  const latestGuestReport = guestReports ? guestReports[0] : null;

  const isSubmitButtonDisabled = React.useMemo(() => {
    return !housing || !startDate || !endDate || !getIsAnyCheckboxChecked(checkboxes);
  }, [endDate, housing, startDate, checkboxes]);

  const shortHousingsOptions = React.useMemo(() => {
    const housingOptions = getShortHousingsAsOptions(shortHousings);
    return injectAllPropertiesOptionToHousingOptions(housingOptions);
  }, [shortHousings]);

  const downloadGuestReport = React.useCallback(async () => {
    const isSelectedAllHousings = housing?.value === ALL_PROPERTIES_OPTION.value;
    const housingId = isSelectedAllHousings ? '' : housing!.value.toString();
    const reportsPayload = {
      housing_name: isSelectedAllHousings ? undefined : housing!.label,
    };

    const result = await api.documents.downloadGuestReport(
      guestReportId!,
      housingId,
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
  }, [displayError, guestReportId, housing, setStatus]);

  React.useEffect(
    function handleWSEvents() {
      if (ws.message?.event_type === WS_EVENT_TYPES.guestReportGenerationFinished) {
        downloadGuestReport();
      }

      if (ws.message?.event_type === WS_EVENT_TYPES.guestReportGenerationFailed) {
        displayError();
        setStatus('idle');
      }

      return () => {
        ws.clearMessage();
      };
    },
    [displayError, downloadGuestReport, setStatus, ws],
  );

  React.useEffect(
    function preloadReportSettings() {
      if (!latestGuestReport) {
        return;
      }

      const startDate = moment(latestGuestReport.from_date);
      setStartDate(startDate);

      const endDate = moment(latestGuestReport.to_date);
      setEndDate(endDate);

      const checkboxes: {[key: string]: boolean} = {};
      latestGuestReport.fields_set.forEach((name) => {
        checkboxes[name] = true;
      });
      setCheckboxes(checkboxes);
    },
    [latestGuestReport],
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

  const handleTypeOfReportChange = (option: SelectOption) => {
    setTypeOfReport(option);
  };

  const getGuestReportTaskPayload = () => {
    if (housing?.value === ALL_PROPERTIES_OPTION.value) {
      return {};
    }

    return {
      housing_id: housing?.value,
    };
  };

  const startReportGenerationTask = async () => {
    const payload = getGuestReportTaskPayload();
    const result = await api.documents.startGuestReportGenerationTask(payload);

    if (result?.error) {
      displayError(result.error);
      setStatus('idle');
    }

    return result;
  };

  const getGuestReportPayload = () => {
    const fieldsSet = Object.keys(checkboxes).filter((key) => {
      return checkboxes[key];
    });

    return {
      from_date: startDate?.format('YYYY-MM-DD'),
      to_date: endDate?.format('YYYY-MM-DD'),
      fields_set: fieldsSet,
      type: typeOfReport.value,
    };
  };

  const saveGuestReport = async () => {
    const payload = getGuestReportPayload();
    let result: ResolverTypes;

    if (latestGuestReport) {
      result = await api.documents.patchGuestReport(latestGuestReport?.id, payload);
    } else {
      result = await api.documents.postGuestReport(payload);
    }

    if (!result.error) {
      await refetchGuestReports();
    }

    return result;
  };

  const saveAndDownloadReport = async () => {
    setStatus('loading');

    const saveResult = await saveGuestReport();
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
    setGuestReportId(reportId);

    const taskResult = await startReportGenerationTask();
    if (taskResult.error && isMounted.current) {
      displayError(taskResult.error);
      setStatus('idle');
      return;
    }
  };

  return (
    <ContentWrapper>
      <ReportHeading linkToBack="/bookings" title={t('download_guest_report')} />
      {isInitLoading ? (
        <LoaderWrapper>
          <Loader label={t('loading')} height={45} width={45} />
        </LoaderWrapper>
      ) : (
        <Main>
          <Text>{t('guest_report_description')}</Text>
          <Section>
            <SectionTitle>1 - {t('download_report_first_step')}</SectionTitle>
            <Select
              value={housing}
              onChange={handleHousingChange}
              placeholder={t('select_your_property')}
              options={shortHousingsOptions}
              disabled={isLoading}
            />
          </Section>
          <Section>
            <SectionTitle>2 - {t('select_type_of_report')}</SectionTitle>
            <Select
              value={typeOfReport}
              onChange={handleTypeOfReportChange}
              placeholder={t('select_type_of_report')}
              options={typesOptions}
              disabled={isLoading}
            />
          </Section>
          <Section>
            <SectionTitle>3 - {t('download_report_second_step')}</SectionTitle>
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
              minimumNights={0}
            />
          </Section>
          <Section>
            <SectionTitle>4 - {t('download_report_third_step')}</SectionTitle>
            <CheckboxesGrid>
              {guestReportFields?.map((field) => {
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

export {GuestReport};
