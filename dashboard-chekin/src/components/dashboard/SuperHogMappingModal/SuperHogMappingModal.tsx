import React, {useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import Modal from '../Modal';
import {
  contentStyle,
  ModalText,
  ModalTextFirst,
  PropertiesList,
  PropertyItem,
  SubmitButton,
  SuperHogItem,
} from './styled';
import api, {queryFetcher} from 'api';
import {ShortHousing, SuperHogChekinHousing, SuperHogHousing} from 'utils/types';
import {useErrorToast, useModalControls} from 'utils/hooks';
import {useQuery} from 'react-query';
import {Controller, useForm} from 'react-hook-form';
import Select from '../Select';
import SuperHogCompleteModal from '../SuperHogCompleteModal';
import arrowMapIcon from '../../../assets/mapping-arrow.svg';
import {toast} from 'react-toastify';

type SuperHogMappingModalProps = {
  open: boolean;
  onClose: () => void;
  superHogHousings: SuperHogHousing[];
  higher: string;
  isEditing: boolean;
};

function fetchHousings() {
  return queryFetcher(api.housings.ENDPOINTS.allLight());
}

function fetchSuperHogChekinHousings() {
  return queryFetcher(api.propertiesProtections.ENDPOINTS.mapHousings());
}

type SelectHousing = {
  value: string;
  label: string;
  is_self_online_check_in_enabled?: boolean;
  external_id?: string;
};

type ChekinSuperHogHousing = {
  housing: string;
  external_id: string;
  fieldName: string;
  is_self_online_check_in_enabled?: boolean;
  id?: string;
};

function SuperHogMappingModal({
  onClose,
  open,
  superHogHousings,
}: SuperHogMappingModalProps) {
  const {control, handleSubmit, setValue, getValues} = useForm();
  const {t} = useTranslation();
  const [payload, setPayload] = React.useState<ChekinSuperHogHousing[]>([]);
  const [options, setOptions] = useState<SelectHousing[]>([]);
  const [newSuperHogHousings, setNewSuperHogHousings] = React.useState<string[]>([]);
  const [higher, setHigher] = React.useState<string>('SH');

  // const goToSuperHogLogin = () => {
  //   history.push(`/marketplace/property-protection/superhog`);
  // };

  const {data: housings, error: housingsError} = useQuery<ShortHousing[]>(
    'housings',
    fetchHousings,
  );
  useErrorToast(housingsError, {
    notFoundMessage: 'Requested housings could not be found. Please contact support.',
  });

  const {data: superHogChekinHousings, error: SuperHogChekinHousingsError} = useQuery<
    SuperHogChekinHousing[]
  >('SuperHogChekinHousings', fetchSuperHogChekinHousings);
  useErrorToast(SuperHogChekinHousingsError, {
    notFoundMessage:
      'Requested Super Hog Housing could not be found. Please contact support.',
  });

  const {
    isOpen: isFinishModalOpen,
    closeModal: closeFinishModal,
    openModal: openFinishModal,
  } = useModalControls();

  const onSubmit = async () => {

    const randonRemoveIdstotal = superHogHousings.length - payload.length;
    let housingsWithIV = housings?.filter(housing => housing.is_self_online_check_in_enabled);
    const housingsWithIVIds = housingsWithIV?.map(housing => housing.id);
    const noConnectedHousings = housingsWithIV?.filter(housing => {
      return !payload.some(superHogHousing => housing.id === superHogHousing.housing)
    }).map(housing => housing.id).splice(randonRemoveIdstotal);

    if (housings && superHogHousings.length >= housings?.length) {
      setNewSuperHogHousings(housingsWithIVIds as string[]);
    } else {
      setNewSuperHogHousings(noConnectedHousings as string[]);
    }
    for await (const newHousing of payload) {
      const n = {
        housing: newHousing.housing,
        external_id: newHousing.external_id,
        ...(newHousing.id && {id: newHousing.id}),
      };
      const {error} = await api.propertiesProtections.createOrUpdateMapHousings(n);
      toast.error(error);
    }
    setPayload([]);

    if (higher !== 'none') {
      openFinishModal();
    } else {
      onClose();
    }
  };

  const DisabledIVToast = (name: string, propertyId?: string) => (
    <div
      onClick={() => {
        window.open(`/properties/${propertyId}`, '_blank');
      }}
    >
      <Trans i18nKey="no_iv_detected" values={{name: name}}>
        <p>
          Property<strong> {{name: name}} </strong> Have not Identity Verificacion
          Activated go to property configuration, and activated, and then, try to map it
          again with Superhog
        </p>
      </Trans>
    </div>
  );

  const AlreadyExistToast = () => <div>{t('already_selected_property')}</div>;
  React.useEffect(() => {
    if (open) {
      if (housings && housings.length > superHogHousings.length) {
        setHigher('chekin');
      }
      if (housings && superHogHousings.length > housings.length) {
        setHigher('SH');
      }
      if (housings && superHogHousings.length === housings.length) {
        setHigher('none');
      }
    }
  }, [open, housings, superHogHousings]);
  React.useEffect(() => {
    if (housings) {
      let tempOptions = housings.map((h) => {
        return {
          value: h.id,
          label: h.name,
          is_self_online_check_in_enabled: h.is_self_online_check_in_enabled,
        };
      });
      setOptions(tempOptions);

      if (
        superHogChekinHousings &&
        superHogHousings &&
        superHogChekinHousings.length > 0
      ) {
        housings.forEach((h) => {
          const hosingWithSuperHog = superHogChekinHousings.find((item) => {
            const housingId = item.housing.split('-').join('');
            return h.id === housingId;
          });

          if (hosingWithSuperHog) {
            const housingId = hosingWithSuperHog.housing.split('-').join('');
            const findingSuperHog = (superHogHouse: SuperHogHousing) =>
              `${superHogHouse.id}` === hosingWithSuperHog.external_id;
            const index = superHogHousings.findIndex(findingSuperHog);
            const matchedSuperHogHousing = superHogHousings.find(findingSuperHog);

            if (matchedSuperHogHousing) {
              const payloadItem: ChekinSuperHogHousing = {
                housing: housingId,
                external_id: hosingWithSuperHog.external_id,
                fieldName: `${matchedSuperHogHousing.id}_${index}`,
                id: hosingWithSuperHog.id,
              };
              setPayload((payload) => [...payload, payloadItem]);
              matchedSuperHogHousing.selected = tempOptions.find(
                (o) => o.value === housingId,
              );
              setValue(
                `${matchedSuperHogHousing.id}_${index}`,
                matchedSuperHogHousing.selected,
              );
            }
          }
        });
      }
    }
  }, [
    housings,
    superHogChekinHousings,
    superHogHousings,
    setValue,
    getValues,
    setOptions,
  ]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      contentStyle={contentStyle}
      title={t('map_properties')}
      closeOnDocumentClick={true}
      closeOnEscape={true}
    >
      <ModalTextFirst>{t('super_hog_modal_description_using')}</ModalTextFirst>
      <ModalText>
        {higher === 'SH' && t('super_hog_modal_description_instructions')}
        {higher === 'chekin' && t('map_checkin_more_properties')}
      </ModalText>
      <ModalText>{t('super_hog_modal_description_advice')}</ModalText>

      <PropertiesList onSubmit={handleSubmit(onSubmit)}>
        {housings &&
          superHogHousings &&
          superHogHousings.map((superHogHousing, index) => {
            const fieldName = `${superHogHousing.id}_${index}`;
            return (
              <PropertyItem key={index}>
                <SuperHogItem>
                  {superHogHousing.friendlyName}
                  <img src={arrowMapIcon} alt="" />
                </SuperHogItem>

                {
                  <div>
                    <Controller
                      control={control}
                      name={fieldName}
                      // rules={{ required: t('required') as string }}
                      render={({field: {onChange, ...field}, fieldState: {error}}) => {
                        return (
                          <Select
                            options={options}
                            error={error?.message}
                            placeholder={t('placeholder')}
                            {...field}
                            onChange={(event: SelectHousing) => {
                              const currentValue = getValues()[fieldName];
                              setValue(fieldName, event);
                              const alreadyExist = payload.find(
                                (p) => event.value === p.housing,
                              );
                              const replaceIndex = payload.findIndex(
                                (p) => String(superHogHousing.id) === p.external_id,
                              );
                              superHogHousing.is_self_online_check_in_enabled =
                                event.is_self_online_check_in_enabled;
                              const disabled =
                                getValues()[fieldName]?.value &&
                                !superHogHousing?.is_self_online_check_in_enabled;
                              const valueToWrite = currentValue || null;
                              if (!!alreadyExist) {
                                setValue(fieldName, valueToWrite);
                                toast.warning(AlreadyExistToast());
                              } else if (disabled) {
                                setValue(fieldName, valueToWrite);
                                toast.warning(DisabledIVToast(event.label, event.value));
                              } else {
                                let chekinSuperHogHousing = {
                                  housing: event.value,
                                  external_id: String(superHogHousing.id),
                                  fieldName: fieldName,
                                };
                                if (!alreadyExist && replaceIndex === -1) {
                                  setPayload((payload) => [
                                    ...payload,
                                    chekinSuperHogHousing,
                                  ]);
                                }
                                if (!alreadyExist && replaceIndex !== -1) {
                                  let currentPayload = payload;
                                  const currentId = currentPayload[replaceIndex].id;
                                  currentPayload[replaceIndex] = chekinSuperHogHousing;
                                  currentPayload[replaceIndex].id = currentId;

                                  setPayload(currentPayload);
                                }
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </div>
                }
              </PropertyItem>
            );
          })}

        <SubmitButton type="submit" label={t('confirm_mapping')}>
          Send
        </SubmitButton>
      </PropertiesList>
      <SuperHogCompleteModal
        open={isFinishModalOpen}
        onClose={closeFinishModal}
        higher={higher}
        newSuperHogHousings={newSuperHogHousings}
        closeMapModal={onClose}
        superHogHousingsCount={superHogHousings.length}
      />
    </Modal>
  );
}

export {SuperHogMappingModal};
