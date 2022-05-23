import React from 'react';
import {useHistory} from 'react-router-dom';
import {toast} from 'react-toastify';
import {Trans, useTranslation} from 'react-i18next';
import {useQuery, useQueryClient} from 'react-query';
import i18n from '../../../i18n';
import api from '../../../api';
import {
  ORIGINS_LABELS,
  SECURITY_DEPOSIT_STATUSES,
  UPSELLING_PAYMENTS_STATUS,
} from '../../../utils/constants';
import {useAuth} from '../../../context/auth';
import {useUser} from '../../../context/user';
import {FEES_OPTIONS_PAYLOAD} from '../FeesOptions';
import {BOOKING_FORM_FEES_NAMES} from '../HousingBookingPaymentsSection';
import {useErrorToast} from '../../../utils/hooks';
import {ServiceHousing, ShortHousing} from '../../../utils/types';
import {fetchShortHousings, getShortHousingsAsOptions} from '../../../utils/housing';
import {toastResponseError} from '../../../utils/common';
import {RESERVATION_PAYMENT_STATUSES} from '../ReservationPayments';
import {HousingOption} from '../ReservationInfoSection/ReservationInfoSection';
import addPropertyIcon from '../../../assets/icon-add-property.svg';
import Tooltip from '../Tooltip';
import Select from '../Select';
import Input from '../Input';
import Loader from '../../common/Loader';
import Modal from '../Modal';
import Button from '../Button';
import ModalButton from '../ModalButton';
import {
  ContentWrapper,
  FieldWrapper,
  Heading,
  ModalTwoButtonsWrapper,
} from '../../../styled/common';
import {
  BottomDoneWrapper,
  CenterListItem,
  Divider,
  DoneButton,
  Dot,
  DotsWrapper,
  LeftListItem,
  ListItem,
  ListItemHeaderText,
  ModalContent,
  PropertyNameText,
  TextInfoItem,
  TextInfoWrapper,
  Title,
  TooltipContentItem,
  TooltipWrapper,
} from './styled';

const TOOLTIP_CONTENT = (
  <>
    <TooltipContentItem>{i18n.t('in_chekin_a_property_is_related')}</TooltipContentItem>
  </>
);

const EMPTY_FAKE_HOUSING: ShortHousing = {
  upselling_payments_status: UPSELLING_PAYMENTS_STATUS.inactive,
  checkin_online_sending_settings_id: null,
  default_email_language: '',
  id: '',
  is_contract_enabled: false,
  is_self_online_check_in_enabled: false,
  is_stat_registration_enabled: false,
  is_auto_police_registration_enabled: false,
  security_deposit_amount: '',
  security_deposit_status: SECURITY_DEPOSIT_STATUSES.inactive,
  reservation_payments_status: RESERVATION_PAYMENT_STATUSES.inactive,
  name: '',
  seasons: [],
  rooms: [],
  location: {
    name: '',
    address: '',
    city: '',
    country: {
      name: '',
      code: '',
      alpha_3: '',
    },
    details: {
      division_level_1: '',
      division_level_2: '',
      division_level_3: '',
    },
    postal_code: '',
    full_address: '',
  },
  [BOOKING_FORM_FEES_NAMES.charge_fees_to_guest]: FEES_OPTIONS_PAYLOAD.MANAGER,
  commission_responsibility_for_tourist_tax: FEES_OPTIONS_PAYLOAD.MANAGER,
  commission_responsibility_for_extra_service: FEES_OPTIONS_PAYLOAD.MANAGER,
};

const OPTION_VALUE_TO_CREATE_NEW_PROPERTY = 'create_new_property';

function ConnectPropertiesSection() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useUser();
  const {refreshAccount} = useAuth();
  const origin = user?.origin;
  const id = user?.id;
  const history = useHistory();
  const [unmappedHousings, setUnmappedHousings] = React.useState<Array<ServiceHousing>>(
    [],
  );
  const [createdHousingsIds, setCreatedHousingsIds] = React.useState<Array<string>>([]);
  const [isSendingMapTask, setIsSendingMapTask] = React.useState(false);
  const [housingSyncTaskId, setHousingSyncTaskId] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [showModal, setShowModal] = React.useState(false);
  const [isCreatingHousing, setIsCreatingHousing] = React.useState(false);
  const [housingName, setHousingName] = React.useState('');
  const {data: housings, error: housingsError} = useQuery(
    'shortHousings',
    fetchShortHousings,
  );
  useErrorToast(housingsError, {
    notFoundMessage: t('errors.requested_short_housings_not_found'),
  });

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const housingSyncTaskIdFromUrl = url.searchParams.get('housingSyncTaskId') || '';
    setHousingSyncTaskId(housingSyncTaskIdFromUrl);
  }, []);

  const getUnmappedHousings = React.useCallback(async () => {
    const integrationUrl = origin?.toLocaleLowerCase().replace('_', '-');
    const {data, error} = await api.housings.getUnmapped(integrationUrl, id);
    if (error) {
      toastResponseError(error);
    }
    if (data) {
      setUnmappedHousings(data.housings_to_map);
    }
  }, [origin, id]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;
    setHousingName(value);
  };

  const createHousing = async () => {
    setIsCreatingHousing(true);
    const {error, data} = await api.housings.post({name: housingName});
    if (error) {
      toastResponseError(error);
    }
    if (data) {
      let newUnmappedHousings = [...unmappedHousings];
      let mappedHousing = newUnmappedHousings[activeIndex];
      mappedHousing.core_housing_id = data.id;
      newUnmappedHousings[activeIndex] = mappedHousing;
      setUnmappedHousings(newUnmappedHousings);
      queryClient.refetchQueries('shortHousings');

      let newCreatedHousingsIds = [...createdHousingsIds];
      newCreatedHousingsIds.push(data.id);
      setCreatedHousingsIds(newCreatedHousingsIds);
    }
    closeModal();
    setIsCreatingHousing(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setHousingName('');
    setActiveIndex(-1);
  };

  React.useEffect(() => {
    getUnmappedHousings();
  }, [getUnmappedHousings]);

  const housingsOptions = React.useMemo(() => {
    let result = getShortHousingsAsOptions(housings);
    result.push({
      label: i18n.t('create_new_property'),
      value: OPTION_VALUE_TO_CREATE_NEW_PROPERTY,
      country: '',
      data: EMPTY_FAKE_HOUSING,
    });
    return result;
  }, [housings]);

  const getOriginText = () => {
    return ORIGINS_LABELS[user?.origin || ''];
  };

  const getCoreHousingValueOption = (housing: ServiceHousing) => {
    return housingsOptions.find((c) => c.data?.id === housing.core_housing_id);
  };

  const handleSelectChange = async (
    selectedOption: HousingOption,
    housing: ServiceHousing,
    index: number,
  ) => {
    if (selectedOption.value === OPTION_VALUE_TO_CREATE_NEW_PROPERTY) {
      setActiveIndex(index);
      setShowModal(true);
    } else {
      let newUnmappedHousings = [...unmappedHousings];
      let mappedHousing = newUnmappedHousings[index];
      mappedHousing.core_housing_id = selectedOption.data?.id;
      newUnmappedHousings[index] = mappedHousing;
      setUnmappedHousings(newUnmappedHousings);
    }
  };

  const setLoaderForHousing = (index: number) => {
    let newUnmappedHousings = [...unmappedHousings];
    let mappedHousing = newUnmappedHousings[index];
    mappedHousing.isLoading = true;
    newUnmappedHousings[index] = mappedHousing;
    setUnmappedHousings(newUnmappedHousings);
  };

  const resetHousingCoreId = async (housing: ServiceHousing, index: number) => {
    setLoaderForHousing(index);
    const membersWithoutUpdatedGuest = unmappedHousings.filter((h) => {
      return h.core_housing_id === housing.core_housing_id;
    });
    if (membersWithoutUpdatedGuest.length < 2) {
      if (housing.core_housing_id) {
        const {data} = await api.housings.deleteById(housing.core_housing_id);
        if (data) {
          queryClient.refetchQueries('shortHousings');
        }
      }
    }
    let newUnmappedHousings = [...unmappedHousings];
    let mappedHousing = newUnmappedHousings[index];
    mappedHousing.core_housing_id = null;
    mappedHousing.isLoading = false;
    newUnmappedHousings[index] = mappedHousing;
    setUnmappedHousings(newUnmappedHousings);
  };

  const sendSyncTask = async () => {
    setIsSendingMapTask(true);
    const isFirstMapping = user?.import_status === 'WAITING_FOR_MAPPING';
    const housingsToSend = unmappedHousings.filter((housing) => {
      return Boolean(housing.core_housing_id);
    });
    const usedCoreHousingsId = housingsToSend.map((housing) => {
      return housing.core_housing_id;
    });
    const coreHousingIdsToDelete = createdHousingsIds.filter((housingId) => {
      return !usedCoreHousingsId.includes(housingId);
    });
    for (let housingIdToDelete of coreHousingIdsToDelete) {
      await api.housings.deleteById(housingIdToDelete);
    }
    const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
    const payload = {
      housings_to_map: housingsToSend,
      is_first_mapping: isFirstMapping,
      housing_sync_task_id: housingSyncTaskId,
    };
    const {error, data} = await api.housings.sendMapTask(
      integrationUrl,
      user?.id,
      payload,
    );
    if (error) {
      toastResponseError(error);
    }
    if (data) {
      toast.success(t('please_wait_untill_we_finish_import'), {autoClose: 3000});
      if (isFirstMapping) {
        await refreshAccount();
      }
      history.push('/properties');
    }
    setIsSendingMapTask(false);
  };

  /*const connectHousingsAutomatically = async () => {
    setIsSendingMapTask(true);
    const isFirstConnecting = user?.import_status === 'WAITING_FOR_MAPPING';
    const payload = {
      is_first_connecting: isFirstConnecting,
      housing_sync_task_id: housingSyncTaskId,
    };
    const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
    const {error, data} = await api.housings.sendConnectHousingsAutomaticallyTask(
      integrationUrl,
      user?.id,
      payload,
    );
    if (error) {
      toastResponseError(error);
    }
    if (data) {
      toast.success(t('please_wait_untill_we_finish_import'));
      if (isFirstConnecting) {
        await refreshAccount();
      }
      history.push('/properties');
    }
    setIsSendingMapTask(false);
  };*/

  return (
    <>
      <ContentWrapper>
        <Heading>
          <div />
          <Title>{t('connect_properties')}</Title>
        </Heading>
        <TextInfoWrapper>
          <TextInfoItem>
            <Trans
              i18nKey="to_use_our_platforn"
              values={{
                integration: ORIGINS_LABELS[user?.origin || ''],
              }}
            >
              To use our platform, it is essential to link the properties you have created
              in Guesty to properties here in CheKin.
            </Trans>
          </TextInfoItem>
          <TextInfoItem>{t('if_you_have_a_hostel_hotel_camping')}</TextInfoItem>
        </TextInfoWrapper>
        {/*{isSendingMapTask ? (*/}
        {/*  <Loader width={30} height={40} />*/}
        {/*) : (*/}
        {/*  <Button*/}
        {/*    onClick={connectHousingsAutomatically}*/}
        {/*    secondary*/}
        {/*    label={*/}
        {/*      <ButtonLabelWrapper>*/}
        {/*        <ButtonLabelIcon src={plusIcon} />*/}
        {/*        <ButtonLabelText>{t('create_and_connect_automatically')}</ButtonLabelText>*/}
        {/*      </ButtonLabelWrapper>*/}
        {/*    }*/}
        {/*  />*/}
        {/*)}*/}
        <DotsWrapper>
          <Dot />
          <Dot />
          <Dot />
        </DotsWrapper>
        {/*<ConnectManuallyHeader>*/}
        {/*  {i18n.t('or_connect_properties_manually')}*/}
        {/*</ConnectManuallyHeader>*/}
        <ListItem>
          <LeftListItem>
            <ListItemHeaderText>
              {i18n.t('your_units_in')}
              {` `}
              {getOriginText()}
            </ListItemHeaderText>
          </LeftListItem>
          <CenterListItem>
            <ListItemHeaderText>{t('your_properties_in_chekin')}</ListItemHeaderText>
            <TooltipWrapper>
              <Tooltip content={TOOLTIP_CONTENT} />
            </TooltipWrapper>
          </CenterListItem>
        </ListItem>
        {unmappedHousings.map((housing, index) => {
          return (
            <ListItem>
              <LeftListItem>
                <PropertyNameText>{housing.name}</PropertyNameText>
              </LeftListItem>
              <CenterListItem>
                <Select
                  options={housingsOptions}
                  value={getCoreHousingValueOption(housing)}
                  onChange={(selectedOption: HousingOption) =>
                    handleSelectChange(selectedOption, housing, index)
                  }
                />{' '}
              </CenterListItem>
              {housing.core_housing_id && housing.isLoading && (
                <Loader width={40} height={40} />
              )}
              {housing.core_housing_id && !housing.isLoading && (
                <Button
                  label={t('unlink')}
                  onClick={() => resetHousingCoreId(housing, index)}
                  secondary
                />
              )}
            </ListItem>
          );
        })}
        <Divider />

        {isSendingMapTask ? (
          <Loader width={30} height={40} />
        ) : (
          <BottomDoneWrapper>
            <DoneButton label={t('done')} onClick={sendSyncTask} secondary />
          </BottomDoneWrapper>
        )}
      </ContentWrapper>
      {showModal && (
        <Modal
          open
          iconSrc={addPropertyIcon}
          iconAlt="Add property"
          title={t('add_the_name_of_property')}
        >
          <ModalContent>
            <FieldWrapper>
              <Input
                value={housingName}
                disabled={isCreatingHousing}
                onChange={handleInputChange}
                placeholder={t('enter_name')}
                label={t('property_name')}
              />
            </FieldWrapper>
            <ModalTwoButtonsWrapper>
              {isCreatingHousing ? (
                <Loader />
              ) : (
                <>
                  <ModalButton
                    disabled={!housingName.length}
                    onClick={createHousing}
                    label={t('add')}
                  />
                  <ModalButton secondary label={t('cancel')} onClick={closeModal} />
                </>
              )}
            </ModalTwoButtonsWrapper>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export {ConnectPropertiesSection};
