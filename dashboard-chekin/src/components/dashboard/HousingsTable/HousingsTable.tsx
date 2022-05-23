import React from 'react';
import {useInfiniteQuery, useQueryClient} from 'react-query';
import {useInfiniteScroll} from 'react-infinite-scroll-hook';
import {Column, Row, useTable} from 'react-table';
import {Trans, useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useForm} from 'react-hook-form';
import {getSearchParamFromUrl, toastResponseError} from '../../../utils/common';
import {Housing, Paginated, SelectOption} from '../../../utils/types';
import {useAuth} from '../../../context/auth';
import {useWebsocket} from '../../../context/websocket';
import {useComputedDetails} from '../../../context/computedDetails';
import {ORIGINS_LABELS, WS_EVENT_TYPES} from '../../../utils/constants';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {
  useErrorToast,
  useModalControls,
  useSubscriptionAskModal,
  useWarningModal,
} from '../../../utils/hooks';
import {usePrefetchSendingSettings} from 'hooks/usePrefetch';
import importIcon from '../../../assets/import-prop-icon.svg';
import plusIcon from '../../../assets/plus-blue.svg';
import policemanIcon from '../../../assets/policeman.svg';
import refreshIcon from '../../../assets/refresh.svg';
import collaboratorsNoAccessIcon from '../../../assets/collaborators_no_access.svg';
import addPropertyIcon from '../../../assets/icon-add-property.svg';
import addPropertyLinkIcon from 'assets/add-prop-icon.svg';
import notFoundIcon from '../../../assets/notfound-icon.svg';
import eviivoIcon from '../../../assets/eviivo-logo.jpg';
import HeadingSelect from '../HeadingSelect';
import SearchHousingsModal from '../SearchHousingsModal';
import TableFilter from '../TableFilter';
import SearchButton from '../SearchButton';
import Modal from '../Modal';
import Loader from '../../common/Loader';
import ModalButton from '../ModalButton';
import ImportCompleteModal from '../ImportCompleteModal';
import TableStatusButton from '../TableStatusButton';
import SiteMinderHousingIdModal from '../SiteMinderHousingIdModal';
import TablePlaceholder, {EMPTY_TABLE_ROWS_NUMBER} from '../TablePlaceholder';
import IntegrationRefetchTokenTooltip from '../IntegrationRefetchTokenTooltip';
import Button from '../Button';
import {InputController} from '../Input';
import {ModalTwoButtonsWrapper, TableContentWrapper} from '../../../styled/common';
import {
  Form,
  FormItemWrapper,
  Heading,
  HeadingRefreshButton,
  HousingsTableLoader,
  InactiveRow,
  MappingNotification,
  MappingNotificationLink,
  MappingNotificationText,
  PropertyTableHeader,
  RefreshButtonLoaderWrapper,
  StatusCell,
  StatusIcon,
  StatusText,
  StatusTooltip,
  TableAddButton,
  TableWrapper,
  ImportPropertiesButton,
  HeaderButtonsWrapper,
  AddPropertyIcon,
  IndexCell,
  HousingsTd,
  HeadingSection,
} from './styled';

const STORAGE_HOUSINGS_STATUS_FILTER = 'housingsStatusFilter';
const STORAGE_HOUSINGS_ACTIVATION_STATUS_FILTER = 'housingsActivationStatusFilter';
const STORAGE_HOUSINGS_NAME_FILTER = 'housingsNameFilter';
const STORAGE_EXACT_HOUSINGS_NAME_FILTER = 'housingsExactNameFilter';
const IS_UNDER_MAINTENANCE = Boolean(process.env.REACT_APP_MAINTENANCE_MODE);
const WS_EVENT_HOUSINGS_SYNC_TYPES_ARRAY = [
  'SYNC_HOUSINGS_FINISHED',
  'SYNC_HOUSINGS_STARTED',
  'SYNC_HOUSINGS_WAITING',
  'SYNC_HOUSINGS_MAPPING',
];
const SYNC_SENT_STATUS = 'SEN';
const SYNC_STARTED_STATUS = 'STR';
const SYNC_WAITING_FOR_MAPPING_STATUS = 'WAI';
const SYNC_MAPPING_IN_PROGRESS_STATUS = 'MAP';
const SYNC_IN_PROGRESS_STATUS = 'PRO';

export enum HOUSING_STATUSES {
  complete = 'COMPLETE',
  incomplete = 'INCOMPLETE',
  all = 'ALL',
}

export enum HOUSING_ACTIVATION_STATUSES {
  all = 'ALL',
  active = 'ACTIVE',
  deactivated = 'DEACTIVATED',
}

enum FORM_NAMES {
  short_name = 'short_name',
}

type FormTypes = {
  [FORM_NAMES.short_name]: string;
};

const HOUSING_STATUSES_LABELS: {[key: string]: string} = {
  [HOUSING_STATUSES.complete]: i18n.t('complete'),
  [HOUSING_STATUSES.incomplete]: i18n.t('uncompleted'),
  [HOUSING_ACTIVATION_STATUSES.deactivated]: i18n.t('inactive'),
  [HOUSING_ACTIVATION_STATUSES.active]: i18n.t('active'),
  [HOUSING_STATUSES.all]: i18n.t('all_statuses'),
};

const HOUSINGS_STATUSES_FILTERS: {[key: string]: SelectOption} = {
  [HOUSING_STATUSES.all]: {
    value: HOUSING_STATUSES.all,
    label: HOUSING_STATUSES_LABELS[HOUSING_STATUSES.all],
  },
  [HOUSING_STATUSES.complete]: {
    value: HOUSING_STATUSES.complete,
    label: HOUSING_STATUSES_LABELS[HOUSING_STATUSES.complete],
  },
  [HOUSING_STATUSES.incomplete]: {
    value: HOUSING_STATUSES.incomplete,
    label: HOUSING_STATUSES_LABELS[HOUSING_STATUSES.incomplete],
  },
};

const HOUSING_ACTIVATION_STATUSES_FILTERS: {[key: string]: SelectOption} = {
  [HOUSING_ACTIVATION_STATUSES.all]: {
    value: HOUSING_ACTIVATION_STATUSES.all,
    label: HOUSING_STATUSES_LABELS[HOUSING_ACTIVATION_STATUSES.all],
  },
  [HOUSING_ACTIVATION_STATUSES.active]: {
    value: HOUSING_ACTIVATION_STATUSES.active,
    label: HOUSING_STATUSES_LABELS[HOUSING_ACTIVATION_STATUSES.active],
  },
  [HOUSING_ACTIVATION_STATUSES.deactivated]: {
    value: HOUSING_ACTIVATION_STATUSES.deactivated,
    label: HOUSING_STATUSES_LABELS[HOUSING_ACTIVATION_STATUSES.deactivated],
  },
};

const DEFAULT_HOUSING_STATUS_FILTER = HOUSINGS_STATUSES_FILTERS[HOUSING_STATUSES.all];
const DEFAULT_HOUSING_ACTIVATION_STATUS_FILTER =
  HOUSING_ACTIVATION_STATUSES_FILTERS[HOUSING_ACTIVATION_STATUSES.all];

function preloadStatusFilter() {
  const prevStatus = sessionStorage.getItem(STORAGE_HOUSINGS_STATUS_FILTER);
  if (prevStatus && HOUSINGS_STATUSES_FILTERS[prevStatus]) {
    return HOUSINGS_STATUSES_FILTERS[prevStatus];
  }

  sessionStorage.setItem(
    STORAGE_HOUSINGS_STATUS_FILTER,
    String(DEFAULT_HOUSING_STATUS_FILTER.value),
  );
  return DEFAULT_HOUSING_STATUS_FILTER;
}

function preloadActivationStatusFilter() {
  const prevStatus = sessionStorage.getItem(STORAGE_HOUSINGS_ACTIVATION_STATUS_FILTER);
  if (prevStatus && HOUSING_ACTIVATION_STATUSES_FILTERS[prevStatus]) {
    return HOUSING_ACTIVATION_STATUSES_FILTERS[prevStatus];
  }

  sessionStorage.setItem(
    STORAGE_HOUSINGS_ACTIVATION_STATUS_FILTER,
    String(DEFAULT_HOUSING_ACTIVATION_STATUS_FILTER.value),
  );
  return DEFAULT_HOUSING_ACTIVATION_STATUS_FILTER;
}

function preloadNameFilter() {
  const prevName = sessionStorage.getItem(STORAGE_HOUSINGS_NAME_FILTER);
  return prevName || '';
}

function preloadExactNameFilter() {
  const prevName = sessionStorage.getItem(STORAGE_EXACT_HOUSINGS_NAME_FILTER);
  return prevName || '';
}

function getStatusQuery(option: SelectOption) {
  if (option.value === HOUSING_STATUSES.all) {
    return '';
  }

  return `status=${option.value}`;
}

function getActivationStatusQuery(option: SelectOption) {
  switch (option.value) {
    case HOUSING_ACTIVATION_STATUSES.active:
      return 'is_deactivated=false';
    case HOUSING_ACTIVATION_STATUSES.deactivated:
      return 'is_deactivated=true';
    default:
      return '';
  }
}

function getNameQuery(name = '', exactName = '') {
  if (exactName) {
    return `exact_name=${encodeURIComponent(exactName)}`;
  }

  return `name=${encodeURIComponent(name)}`;
}

type HousingsParams = {
  name?: string;
  status?: SelectOption;
  exactName?: string;
  activeStatus?: SelectOption;
};
function getHousingsParams({
  name = '',
  exactName = '',
  status = DEFAULT_HOUSING_STATUS_FILTER,
  activeStatus = DEFAULT_HOUSING_ACTIVATION_STATUS_FILTER,
}: HousingsParams) {
  const searchQuery = getNameQuery(name, exactName);
  const statusQuery = getStatusQuery(status);
  const activationStatusQuery = getActivationStatusQuery(activeStatus);

  return `ordering=name&${statusQuery}&${activationStatusQuery}&${searchQuery}`;
}

function HousingTable() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const history = useHistory();
  const ws = useWebsocket();
  const {WarningModal, displayWarning} = useWarningModal();
  const {SubscriptionAskModal, tryToAskSubscription} = useSubscriptionAskModal();
  const {isAccountCollaborator} = useComputedDetails();
  const {accountDetails: user, refreshAccount} = useAuth();
  const sendingSettingsId = user?.checkin_online_sending_settings_id;
  const {
    isOpen: isSearchModalOpen,
    closeModal: closeSearchModal,
    openModal: openSearchModal,
  } = useModalControls();
  const {
    isOpen: isAddHousingModalVisible,
    openModal: openAddHousingModal,
    closeModal: closeAddHousingModal,
  } = useModalControls();
  const {
    control,
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormTypes>();

  const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(false);
  const [syncTask, setSyncTask] = React.useState<any>();
  const [integrationUser, setIntegrationUser] = React.useState<any>();
  const [isAddHousingFromCode, setIsAddHousingFromCode] = React.useState(false);
  const [nameFilter, setNameFilter] = React.useState(preloadNameFilter);
  const [exactNameFilter, setExactNameFilter] = React.useState(preloadExactNameFilter);
  const [statusFilter, setStatusFilter] = React.useState(preloadStatusFilter);
  const [activationStatusFilter, setActivationStatusFilter] = React.useState(
    preloadActivationStatusFilter,
  );

  const housingsParams = getHousingsParams({
    status: statusFilter,
    activeStatus: activationStatusFilter,
    name: nameFilter,
    exactName: exactNameFilter,
  });
  const fetchHousings = ({pageParam = 1}) => {
    return queryFetcher(
      api.housings.ENDPOINTS.all(`page=${pageParam}&${housingsParams}`),
    );
  };
  const {
    isFetchingNextPage,
    data,
    fetchNextPage,
    hasNextPage,
    error,
    status,
  } = useInfiniteQuery<Paginated<Housing>>(['housings', housingsParams], fetchHousings, {
    getNextPageParam: (lastGroup) => {
      if (lastGroup?.next) {
        return Number(getSearchParamFromUrl('page', lastGroup.next));
      }
      return false;
    },
  });
  useErrorToast(error, {
    notFoundMessage: t('errors.requested_housings_not_found'),
  });

  const infiniteRef = useInfiniteScroll<HTMLTableElement>({
    loading: isFetchingNextPage || status === 'loading',
    hasNextPage: Boolean(hasNextPage),
    onLoadMore: () => {
      fetchNextPage();
    },
  });

  const getSyncHousingsTasks = React.useCallback(async () => {
    if (user?.show_buttons_refresh_housings) {
      setIsRefreshDisabled(true);
      const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
      const {data} = await api.housings.getSyncTasks(integrationUrl, user?.id);
      if (data) {
        setSyncTask((data.length && data[0]) || null);
      }
      setIsRefreshDisabled(false);
    }
  }, [user]);

  const getIntegrationUser = React.useCallback(async () => {
    if (user?.have_manually_refresh_token_possibility) {
      setIsRefreshDisabled(true);
      const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
      const {data} = await api.users.getIntegrationUser(integrationUrl, user?.id);
      if (data) {
        setIntegrationUser(data);
      }
      setIsRefreshDisabled(false);
    }
  }, [user]);

  usePrefetchSendingSettings(sendingSettingsId);

  React.useEffect(() => {
    getSyncHousingsTasks();
  }, [user, getSyncHousingsTasks]);

  React.useEffect(() => {
    getIntegrationUser();
  }, [user, getIntegrationUser]);

  React.useEffect(() => {
    async function handleWebsocketEvents() {
      if (WS_EVENT_HOUSINGS_SYNC_TYPES_ARRAY.includes(ws.message?.event_type)) {
        await getSyncHousingsTasks();
      }

      if (
        ws.message.event_type === WS_EVENT_TYPES.housingCreated ||
        ws.message.event_type === WS_EVENT_TYPES.housingRemoved
      ) {
        queryClient.refetchQueries('housings');
      }
    }

    handleWebsocketEvents();

    return () => {
      ws.clearMessage();
    };
  }, [ws, ws.message, getSyncHousingsTasks, queryClient]);

  React.useEffect(() => {
    async function saveUserHasSeenPropertiesPage() {
      if (user && !user.has_seen_properties_page) {
        const {error, data} = await api.users.patchMe({has_seen_properties_page: true});
        if (error) {
          toastResponseError(error);
        }
        if (data) {
          refreshAccount();
        }
      }
    }

    saveUserHasSeenPropertiesPage();
  }, [refreshAccount, user]);

  const sendRefreshHousingsTasks = async () => {
    setIsRefreshDisabled(true);
    const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
    const {data, error} = await api.housings.sendSyncTask(integrationUrl, user?.id);

    if (error) {
      toastResponseError(error);
    }

    if (data) {
      await getSyncHousingsTasks();
      toast.success(t('sync_task_sent'));
    }

    setIsRefreshDisabled(false);
  };

  const goToHousingsImport = () => {
    if (tryToAskSubscription()) {
      return;
    }

    history.push('/properties/import');
  };

  const goToHousingsAdd = () => {
    if (tryToAskSubscription()) {
      return;
    }

    if (user?.show_add_housing_modal) {
      openAddHousingModal();
      return;
    }

    history.push('/properties/add');
  };

  const goToReservations = () => {
    history.push('/bookings');
  };

  const goToHousingsEdit = (row: Row<Housing>) => {
    const housing = row.original;
    const housingId = housing.id;

    if (housingId) {
      queryClient.setQueryData(['housing', housingId], housing);
      history.push(`/properties/${housingId}`);
    }
  };

  const resetQuery = React.useCallback(() => {
    queryClient.resetQueries('housings');
  }, [queryClient]);

  const resetNameFilter = React.useCallback(() => {
    setNameFilter('');
    setExactNameFilter('');
    sessionStorage.removeItem(STORAGE_HOUSINGS_NAME_FILTER);
    sessionStorage.removeItem(STORAGE_EXACT_HOUSINGS_NAME_FILTER);
    resetQuery();
  }, [resetQuery]);

  const handleStatusChange = (status: SelectOption) => {
    setStatusFilter(status);
    sessionStorage.setItem(STORAGE_HOUSINGS_STATUS_FILTER, String(status.value));
    resetQuery();
  };

  const handleActivationStatusChange = (activationStatus: SelectOption) => {
    setActivationStatusFilter(activationStatus);
    sessionStorage.setItem(
      STORAGE_HOUSINGS_ACTIVATION_STATUS_FILTER,
      String(activationStatus.value),
    );
    resetQuery();
  };

  const submitSearchModalQuery = (option: SelectOption) => {
    const filter = String(option.label);
    const isExact = Boolean(option.value);

    if (isExact) {
      setExactNameFilter(filter);
      setNameFilter('');
      sessionStorage.setItem(STORAGE_EXACT_HOUSINGS_NAME_FILTER, filter);
      sessionStorage.removeItem(STORAGE_HOUSINGS_NAME_FILTER);
    } else {
      setNameFilter(filter);
      setExactNameFilter('');
      sessionStorage.setItem(STORAGE_HOUSINGS_NAME_FILTER, String(option.label));
      sessionStorage.removeItem(STORAGE_EXACT_HOUSINGS_NAME_FILTER);
    }

    resetQuery();
  };

  const onSubmit = async (data: FormTypes) => {
    setIsAddHousingFromCode(true);

    const origin = user?.origin.toLocaleLowerCase().replace('_', '-') || '';
    const userId = user?.id || '';
    const payload = {
      shortnames: data[FORM_NAMES.short_name],
    };

    const {error} = await api.housings.createHousingFromCode(origin, userId, payload);

    if (error) {
      toastResponseError(error);
    } else {
      toast.success(t('housing_imported'));
      closeAddHousingModal();
    }
    setIsAddHousingFromCode(false);
  };

  const housingNameFilter = exactNameFilter || nameFilter;

  const columns = React.useMemo<Column<Housing>[]>(
    () => [
      {
        Header: t('number') as string,
        Cell: ({row}: {row: any}) => {
          return <IndexCell>{row.index + 1}</IndexCell>;
        },
      },
      {
        Header: (
          <PropertyTableHeader>
            {housingNameFilter ? (
              <TableFilter onRemove={resetNameFilter}>{housingNameFilter}</TableFilter>
            ) : (
              (t('property_name') as string)
            )}
            <SearchButton onClick={openSearchModal} />
          </PropertyTableHeader>
        ),
        accessor: 'name',
      },
      {
        Header: t('property_setup') as string,
        accessor: 'status',
        Cell: ({value}) => {
          return <TableHousingSetupCell status={value} />;
        },
      },
      {
        Header: t('status') as string,
        accessor: 'is_deactivated',
        Cell: ({value}) => {
          return <TableHousingStatusCell deactivated={value} />;
        },
      },
    ],
    [t, housingNameFilter, resetNameFilter, openSearchModal],
  );
  const tableData = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data?.pages
      .map((g) => {
        return g?.results || [];
      })
      .flat();
  }, [data]);

  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns,
    data: tableData,
  });

  const isInitiallyLoading = status === 'loading';
  const isLoaderVisible = isInitiallyLoading || isFetchingNextPage;
  const isAnyFilterApplied = Boolean(
    nameFilter ||
      statusFilter?.value !== HOUSING_STATUSES.all ||
      activationStatusFilter?.value !== HOUSING_ACTIVATION_STATUSES.all,
  );

  return (
    <>
      <WarningModal />
      <SiteMinderHousingIdModal />
      <TableContentWrapper>
        <Heading>
          <HeadingSection>
            <HeadingSelect
              onChange={handleStatusChange}
              options={Object.values(HOUSINGS_STATUSES_FILTERS)}
              value={statusFilter}
            />
            <HeadingSelect
              onChange={handleActivationStatusChange}
              options={Object.values(HOUSING_ACTIVATION_STATUSES_FILTERS)}
              value={activationStatusFilter}
            />
          </HeadingSection>
          <HeaderButtonsWrapper>
            {user?.show_buttons_add_delete_import_housings && (
              <ImportPropertiesButton
                onClick={() => {
                  if (IS_UNDER_MAINTENANCE) {
                    displayWarning(
                      <Trans i18nKey="maintenance_text">
                        <p>
                          We are currently updating the registration process, so you won't
                          be able to register and add properties in the next few hours.
                        </p>
                        Please, contact us by the chat and our team will create an account
                        or add properties for you as soon as we perform the update!
                      </Trans>,
                    );
                    return;
                  }
                  goToHousingsImport();
                }}
              >
                <img src={importIcon} alt="" height={20} width={26} />{' '}
                {t('import_properties')}
              </ImportPropertiesButton>
            )}
            {user?.show_buttons_add_delete_import_housings && (
              <Button
                onClick={() => {
                  if (IS_UNDER_MAINTENANCE) {
                    displayWarning(
                      <Trans i18nKey="maintenance_text">
                        <p>
                          We are currently updating the registration process, so you won't
                          be able to register and add properties in the next few hours.
                        </p>
                        Please, contact us by the chat and our team will create an account
                        or add properties for you as soon as we perform the update!
                      </Trans>,
                    );
                    return;
                  }

                  goToHousingsAdd();
                }}
                label={t('new_property')}
                icon={<AddPropertyIcon src={addPropertyLinkIcon} alt="" />}
              />
            )}
            {user?.show_buttons_refresh_housings && (
              <HeadingRefreshButton
                onClick={sendRefreshHousingsTasks}
                disabled={
                  isRefreshDisabled ||
                  (syncTask &&
                    [
                      SYNC_IN_PROGRESS_STATUS,
                      SYNC_SENT_STATUS,
                      SYNC_STARTED_STATUS,
                      SYNC_MAPPING_IN_PROGRESS_STATUS,
                      SYNC_WAITING_FOR_MAPPING_STATUS,
                    ].includes(syncTask?.status))
                }
              >
                <img src={refreshIcon} alt="Plus" />
                {syncTask &&
                  ![
                    SYNC_IN_PROGRESS_STATUS,
                    SYNC_SENT_STATUS,
                    SYNC_STARTED_STATUS,
                    SYNC_MAPPING_IN_PROGRESS_STATUS,
                    SYNC_WAITING_FOR_MAPPING_STATUS,
                  ].includes(syncTask?.status) &&
                  !isRefreshDisabled &&
                  t('refresh')}
                {(isRefreshDisabled ||
                  (syncTask &&
                    [
                      SYNC_IN_PROGRESS_STATUS,
                      SYNC_SENT_STATUS,
                      SYNC_STARTED_STATUS,
                      SYNC_MAPPING_IN_PROGRESS_STATUS,
                      SYNC_WAITING_FOR_MAPPING_STATUS,
                    ].includes(syncTask?.status))) && (
                  <RefreshButtonLoaderWrapper>
                    <Loader height={20} />
                  </RefreshButtonLoaderWrapper>
                )}
              </HeadingRefreshButton>
            )}
          </HeaderButtonsWrapper>
        </Heading>
        <TableWrapper>
          <table ref={infiniteRef} {...getTableProps()} style={{}}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} style={{}}>
                  {headerGroup.headers.map((column) => {
                    return (
                      <th {...column.getHeaderProps()} style={{}}>
                        {column.render('Header')}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} style={{}}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => goToHousingsEdit(row)}
                    style={{}}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <HousingsTd {...cell.getCellProps()} style={{}}>
                          {cell.render('Cell')}
                        </HousingsTd>
                      );
                    })}
                  </tr>
                );
              })}
              {!isInitiallyLoading &&
                Boolean(tableData?.length) &&
                user?.show_buttons_add_delete_import_housings && (
                  <InactiveRow hasBorder={tableData?.length < EMPTY_TABLE_ROWS_NUMBER}>
                    <td>
                      <IndexCell>{rows.length + 1}</IndexCell>
                    </td>
                    <td>
                      <TableAddButton onClick={goToHousingsAdd}>
                        <img src={plusIcon} alt="Plus" />
                      </TableAddButton>
                    </td>
                    <td />
                    <td />
                  </InactiveRow>
                )}
            </tbody>
          </table>
          {isLoaderVisible && (
            <HousingsTableLoader
              hideBorder
              label={data?.pages.length ? t('loading_more') : t('loading')}
            />
          )}
          <TablePlaceholder
            hidden={isAnyFilterApplied}
            isInitiallyLoading={isInitiallyLoading}
            isLoaderVisible={isLoaderVisible}
            modalIconSrc={addPropertyIcon}
            modalIconAlt="House with a plus"
            modalIconProps={{height: 58, width: 58}}
            modalText={t('first_thing_add_property')}
            tableDataLength={tableData?.length}
          >
            <ModalButton label={t('add_a_new_property')} onClick={goToHousingsAdd} />
          </TablePlaceholder>
          <TablePlaceholder
            hidden={!isAnyFilterApplied}
            isInitiallyLoading={isInitiallyLoading}
            isLoaderVisible={isLoaderVisible}
            modalIconSrc={notFoundIcon}
            modalIconAlt="Sad face"
            modalIconProps={{height: 31, width: 31}}
            modalText={t('no_properties_match_the_filters')}
            modalTitle={`${t('not_found').toUpperCase()}...`}
            tableDataLength={tableData?.length}
          />
        </TableWrapper>
      </TableContentWrapper>
      {isSearchModalOpen && (
        <SearchHousingsModal
          open
          onClose={closeSearchModal}
          onSubmit={submitSearchModalQuery}
        />
      )}
      {isAccountCollaborator && (
        <Modal
          iconSrc={collaboratorsNoAccessIcon}
          iconAlt="Hands with a warning sign"
          title={t('you_cant_access_properties')}
          text={t('you_have_collaborator_acc_only_managers_can_see')}
          iconProps={{
            height: 82,
            width: 84,
          }}
        >
          <ModalButton onClick={goToReservations} label={t('ok')} />
        </Modal>
      )}
      <SubscriptionAskModal />
      {user?.show_buttons_mapping &&
        (user?.import_status === 'WAITING_FOR_MAPPING' ||
          syncTask?.status === SYNC_WAITING_FOR_MAPPING_STATUS) && (
          <MappingNotification>
            <MappingNotificationText>
              <Trans
                i18nKey="you_have_added_a_new_property_on"
                values={{
                  integration: ORIGINS_LABELS[user?.origin || ''],
                }}
              >
                You have added a new property on Guesty. Please link it to a property on
                CheKin.
              </Trans>
            </MappingNotificationText>
            <MappingNotificationLink
              to={
                syncTask?.status === SYNC_WAITING_FOR_MAPPING_STATUS
                  ? `/properties/connect?housingSyncTaskId=${syncTask?.id}`
                  : '/properties/connect'
              }
            >
              {t('link_property')}
            </MappingNotificationLink>
          </MappingNotification>
        )}
      <ImportCompleteModal />
      {isAddHousingModalVisible && (
        <Modal
          open
          closeOnDocumentClick
          closeOnEscape
          iconSrc={eviivoIcon}
          iconAlt="Eviivo"
          onClose={closeAddHousingModal}
        >
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormItemWrapper>
              <InputController
                placeholder={t('enter_text') as string}
                label={t('property_code')}
                error={errors[FORM_NAMES.short_name]?.message}
                {...register(FORM_NAMES.short_name, {
                  required: t('required') as string,
                })}
                control={control}
              />
            </FormItemWrapper>
            <ModalTwoButtonsWrapper>
              <ModalButton
                disabled={isAddHousingFromCode}
                type={'submit'}
                label={t('add')}
              />
              <ModalButton
                disabled={isAddHousingFromCode}
                secondary
                label={t('cancel')}
                onClick={closeAddHousingModal}
              />
            </ModalTwoButtonsWrapper>
          </Form>
        </Modal>
      )}
      {integrationUser?.need_refetch_token && <IntegrationRefetchTokenTooltip />}
    </>
  );
}

type TableStatusCellProps = {
  status: string;
};

function TableHousingSetupCell({status}: TableStatusCellProps) {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const displayStatus =
    HOUSING_STATUSES_LABELS[status] ||
    HOUSING_STATUSES_LABELS[HOUSING_STATUSES.incomplete];

  return (
    <StatusCell>
      <div
        onMouseOver={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
      >
        <TableStatusButton
          active={status !== HOUSING_STATUSES.incomplete}
          onClick={(e) => e.stopPropagation()}
        />
        <StatusTooltip
          onClick={(e) => e.stopPropagation()}
          onMouseOver={(e) => e.stopPropagation()}
          open={isTooltipOpen}
        >
          <StatusIcon src={policemanIcon} alt="Policeman" />
          <StatusText>{displayStatus}</StatusText>
        </StatusTooltip>
      </div>
    </StatusCell>
  );
}

type TableHousingStatusCellProps = {
  deactivated: boolean;
};

function TableHousingStatusCell({deactivated}: TableHousingStatusCellProps) {
  const status = deactivated
    ? HOUSING_ACTIVATION_STATUSES.deactivated
    : HOUSING_ACTIVATION_STATUSES.active;
  const displayStatus =
    HOUSING_STATUSES_LABELS[status] ||
    HOUSING_STATUSES_LABELS[HOUSING_ACTIVATION_STATUSES.active];

  return (
    <StatusCell>
      <TableStatusButton
        interactive={false}
        active={!deactivated}
        customText={displayStatus}
      />
    </StatusCell>
  );
}

export {HousingTable};
