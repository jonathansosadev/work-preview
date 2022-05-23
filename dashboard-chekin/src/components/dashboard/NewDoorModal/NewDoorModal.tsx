import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {Controller, useForm} from 'react-hook-form';
import i18n from '../../../i18n';
import {useErrorModal} from '../../../utils/hooks';
import {
  LOCK_ACCESS_TYPES,
  LOCK_TYPES_OPTIONS,
  LOCK_VENDORS,
} from '../../../utils/constants';
import {
  ExternalLock,
  Lock,
  LockUser,
  Room,
  SelectOption,
  TempLock,
} from '../../../utils/types';
import api, {queryFetcher} from '../../../api';
import {getRequiredOrOptionalFieldLabel} from '../../../utils/common';
import doorIcon from '../../../assets/door.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import Select from '../Select';
import Loader from '../../common/Loader';
import {InputController} from '../Input';
import {FieldWrapper, ModalTwoButtonsWrapper} from '../../../styled/common';
import {Content, EmptyMessage} from './styled';

const lockTypes = Object.values(LOCK_TYPES_OPTIONS);
const LOCK_VENDORS_WITH_EXTERNAL_IDS_FETCH = [
  LOCK_VENDORS.akiles,
  LOCK_VENDORS.omnitec,
  LOCK_VENDORS.keynest,
  LOCK_VENDORS.nuki,
  LOCK_VENDORS.homeit,
  LOCK_VENDORS.keycafe,
  LOCK_VENDORS.remotelock,
  LOCK_VENDORS.ttlock,
  LOCK_VENDORS.yacan,
  LOCK_VENDORS.mondise,
  LOCK_VENDORS.elea,
];

enum FORM_NAMES {
  externalId = 'external_id',
  externalIdOption = 'external_id_option',
  type = 'type',
  name = 'name',
  accessCode = 'access_code',
  room = 'room_id',
  doorNameInSalto = 'doorNameInSalto',
}

type FormTypes = {
  [FORM_NAMES.externalId]: string;
  [FORM_NAMES.externalIdOption]: SelectOption;
  [FORM_NAMES.type]: SelectOption;
  [FORM_NAMES.room]: SelectOption;
  [FORM_NAMES.name]: string;
  [FORM_NAMES.accessCode]: string;
  [FORM_NAMES.doorNameInSalto]: string;
};

function fetchExternalLocks(user: string) {
  return queryFetcher(api.locks.ENDPOINTS.externalLocks(user));
}

function getShouldFetchExternalLocks(user?: SelectOption<LockUser> | null) {
  if (!user) {
    return false;
  }

  return LOCK_VENDORS_WITH_EXTERNAL_IDS_FETCH.some((vendor) => {
    return vendor === user.data?.vendor;
  });
}

function getExternalLocksAsOptions(locks?: ExternalLock[]) {
  if (!locks) {
    return [];
  }

  return locks.map((lock) => {
    return {
      value: lock?.id,
      label: lock?.name,
    };
  });
}

function getRoomsAsOptions(rooms?: Room[], allLocks?: (Lock | TempLock)[]) {
  if (!rooms) {
    return [];
  }

  let result = rooms.map((room) => {
    return {
      data: room,
      value: room.id || room.number,
      label: room.number,
    };
  });

  if (allLocks?.length) {
    result = result.filter((room) => {
      return !allLocks.find((lock) => {
        if (!lock.room_id) {
          return lock.room_number === room.label;
        }
        return lock.room_id === room.value;
      });
    });
  }

  return result;
}

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.name]: true,
  [FORM_NAMES.externalId]: true,
  [FORM_NAMES.type]: true,
  [FORM_NAMES.externalIdOption]: true,
  [FORM_NAMES.room]: false,
  [FORM_NAMES.accessCode]: false,
  [FORM_NAMES.doorNameInSalto]: false,
};

function getAccessTypeDisplayFields(accessType?: LOCK_ACCESS_TYPES) {
  if (accessType === LOCK_ACCESS_TYPES.private) {
    return {
      ...INIT_DISPLAY_FIELDS,
      [FORM_NAMES.room]: true,
      [FORM_NAMES.type]: false,
    };
  }

  return {...INIT_DISPLAY_FIELDS};
}

function getDisplayFields(vendor?: string, accessType?: LOCK_ACCESS_TYPES) {
  let fields = getAccessTypeDisplayFields(accessType);

  switch (vendor) {
    case LOCK_VENDORS.manualBox: {
      return {
        ...fields,
        [FORM_NAMES.type]: false,
        [FORM_NAMES.externalId]: false,
        [FORM_NAMES.accessCode]: true,
      };
    }
    case LOCK_VENDORS.roomatic: {
      return {
        ...fields,
        [FORM_NAMES.type]: false,
        [FORM_NAMES.externalId]: false,
      };
    }
    case LOCK_VENDORS.salto: {
      return {
        ...fields,
        [FORM_NAMES.doorNameInSalto]: true,
        [FORM_NAMES.externalId]: false,
        [FORM_NAMES.externalIdOption]: false,
      };
    }
    default: {
      return fields;
    }
  }
}

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.externalId]: i18n.t('required'),
  [FORM_NAMES.type]: i18n.t('required'),
  [FORM_NAMES.externalIdOption]: i18n.t('required'),
  [FORM_NAMES.room]: i18n.t('required'),
  [FORM_NAMES.accessCode]: i18n.t('required'),
  [FORM_NAMES.name]: i18n.t('required'),
  [FORM_NAMES.doorNameInSalto]: i18n.t('required'),
};

function getRequiredFields() {
  return INIT_REQUIRED_FIELDS;
}

function getFields(vendor?: string, accessType = LOCK_ACCESS_TYPES.common) {
  const display = getDisplayFields(vendor, accessType);
  const required = getRequiredFields();

  return {
    required,
    display,
  };
}

type NewDoorModalProps = {
  onClose: () => void;
  onSaveLock: (lock: TempLock) => void;
  setExternalLockError?: (isExternalLockError: boolean) => void;
  open?: boolean;
  user?: SelectOption<LockUser> | null;
  housingId?: string;
  accessType?: LOCK_ACCESS_TYPES;
  rooms?: Room[];
  allLocks?: (Lock | TempLock)[];
  isLoading?: boolean;
};

const defaultProps: Partial<NewDoorModalProps> = {
  open: false,
  user: null,
  rooms: [],
  allLocks: [],
  isLoading: false,
  housingId: '',
  accessType: LOCK_ACCESS_TYPES.common,
  onSaveLock: () => {},
};

function NewDoorModal({
  open,
  user,
  housingId,
  onClose,
  onSaveLock,
  accessType,
  rooms,
  allLocks,
  setExternalLockError,
  isLoading,
}: NewDoorModalProps) {
  const {t} = useTranslation();
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const {displayError, ErrorModal} = useErrorModal();
  const [isNameTouched, setIsNameTouched] = React.useState(false);
  const [fields, setFields] = React.useState(() => {
    const vendor = user?.data?.vendor;
    return getFields(vendor, accessType);
  });

  const shouldFetchVendorLocks = getShouldFetchExternalLocks(user);
  const {
    data: externalLocks,
    error: externalLocksError,
    status: externalLocksStatus,
  } = useQuery<ExternalLock[], [string, string]>(
    ['externalLocks', user?.value],
    () => fetchExternalLocks(user!.value.toString()),
    {
      enabled: shouldFetchVendorLocks,
    },
  );

  React.useEffect(function handleExternaLockError() {
    if (externalLocksError && setExternalLockError) {
      setExternalLockError(true);
    }
  });

  const externalLocksOptions = React.useMemo(() => {
    return getExternalLocksAsOptions(externalLocks);
  }, [externalLocks]);

  const roomsOptions = React.useMemo(() => {
    return getRoomsAsOptions(rooms, allLocks);
  }, [rooms, allLocks]);

  const areExternalLocksNotFound =
    shouldFetchVendorLocks && externalLocksStatus !== 'loading' && !externalLocks?.length;
  const externalIdLabel = watch(FORM_NAMES.externalIdOption)?.label;
  const externalId = watch(FORM_NAMES.externalId);
  const isPrivateAccessType = accessType === LOCK_ACCESS_TYPES.private;
  const isButtonDisabled =
    areExternalLocksNotFound || externalLocksStatus === 'loading' || isLoading;

  React.useEffect(() => {
    const vendor = user?.data?.vendor;
    const nextFields = getFields(vendor, accessType);
    setFields(nextFields);
  }, [user, accessType]);

  React.useEffect(() => {
    if (!isNameTouched && externalIdLabel) {
      setValue(FORM_NAMES.name, externalIdLabel as string);
    }
  }, [externalIdLabel, setValue, isNameTouched]);

  React.useEffect(() => {
    if (!isNameTouched && externalId) {
      setValue(FORM_NAMES.name, externalId);
    }
  }, [setValue, isNameTouched, externalId]);

  const handleClose = () => {
    setIsNameTouched(false);
    onClose();
  };

  const getLockPayload = (data: FormTypes) => {
    const externalId =
      user?.data?.vendor === LOCK_VENDORS.salto
        ? data[FORM_NAMES.doorNameInSalto]
        : data[FORM_NAMES.externalIdOption]?.value || data[FORM_NAMES.externalId];

    return {
      user: user?.value,
      housing: housingId,
      access_type: accessType,
      room_number: data[FORM_NAMES.room]?.label as string,
      [FORM_NAMES.externalId]: externalId,
      [FORM_NAMES.accessCode]: data[FORM_NAMES.accessCode],
      [FORM_NAMES.name]: data[FORM_NAMES.name],
      [FORM_NAMES.type]: data[FORM_NAMES.type]?.value,
      [FORM_NAMES.room]: data[FORM_NAMES.room]?.data?.id,
    };
  };

  const saveLock = (data: FormTypes) => {
    const payload = getLockPayload(data);
    onSaveLock(payload as TempLock);
    setIsNameTouched(false);
  };

  const onSubmit = async (data: FormTypes) => {
    if (!user) {
      displayError('Missing user and housing id.');
      return;
    }
    saveLock(data);
  };

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      onClose={handleClose}
      open={open}
      iconSrc={doorIcon}
      iconAlt="Door"
      title={isPrivateAccessType ? t('add_a_private_door') : t('add_door')}
      iconProps={{
        width: 84,
        height: 84,
      }}
    >
      <div>
        <ErrorModal />
        <Content>
          {areExternalLocksNotFound ? (
            <EmptyMessage>{t('external_ids_not_found')}</EmptyMessage>
          ) : (
            <div>
              {externalLocksStatus !== 'loading' && (
                <div>
                  {fields.display[FORM_NAMES.type] && (
                    <FieldWrapper>
                      <Controller
                        control={control}
                        name={FORM_NAMES.type}
                        rules={{
                          required: fields.required[FORM_NAMES.type],
                        }}
                        render={({field, fieldState: {error}}) => {
                          return (
                            <Select
                              placeholder={t('select_your_type')}
                              options={lockTypes}
                              label={getRequiredOrOptionalFieldLabel(
                                t('type'),
                                fields.required[FORM_NAMES.type],
                              )}
                              error={error?.message}
                              {...field}
                            />
                          );
                        }}
                      />
                    </FieldWrapper>
                  )}
                </div>
              )}
              {shouldFetchVendorLocks && (
                <div>
                  {externalLocksStatus === 'loading' ? (
                    <Loader />
                  ) : (
                    <div>
                      {fields.display[FORM_NAMES.room] && (
                        <FieldWrapper>
                          <Controller
                            control={control}
                            name={FORM_NAMES.room}
                            rules={{
                              required: fields.required[FORM_NAMES.room],
                            }}
                            render={({field, fieldState: {error}}) => {
                              return (
                                <Select
                                  placeholder={t('select_your_room')}
                                  options={roomsOptions}
                                  label={getRequiredOrOptionalFieldLabel(
                                    t('room'),
                                    fields.required[FORM_NAMES.room],
                                  )}
                                  error={error?.message}
                                  {...field}
                                />
                              );
                            }}
                          />
                        </FieldWrapper>
                      )}
                      {fields.display[FORM_NAMES.externalIdOption] && (
                        <FieldWrapper>
                          <Controller
                            control={control}
                            name={FORM_NAMES.externalIdOption}
                            rules={{
                              required: fields.required[FORM_NAMES.externalIdOption],
                            }}
                            render={({field, fieldState: {error}}) => {
                              return (
                                <Select
                                  placeholder={t('select_your_external_id')}
                                  options={externalLocksOptions}
                                  label={getRequiredOrOptionalFieldLabel(
                                    t('external_id'),
                                    fields.required[FORM_NAMES.externalIdOption],
                                  )}
                                  error={error?.message}
                                  {...field}
                                />
                              );
                            }}
                          />
                        </FieldWrapper>
                      )}
                      {fields.display[FORM_NAMES.name] && (
                        <FieldWrapper>
                          <InputController
                            placeholder={t('enter_name')}
                            label={getRequiredOrOptionalFieldLabel(
                              t('name'),
                              fields.required[FORM_NAMES.name],
                            )}
                            error={(errors[FORM_NAMES.name] as any)?.message}
                            {...register(FORM_NAMES.name, {
                              required: fields.required[FORM_NAMES.name],
                            })}
                            control={control}
                            onInput={() => setIsNameTouched(true)}
                          />
                        </FieldWrapper>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!shouldFetchVendorLocks && (
                <div>
                  {fields.display[FORM_NAMES.room] && (
                    <FieldWrapper>
                      <Controller
                        control={control}
                        name={FORM_NAMES.room}
                        rules={{
                          required: fields.required[FORM_NAMES.room],
                        }}
                        render={({field, fieldState: {error}}) => {
                          return (
                            <Select
                              placeholder={t('select_your_room')}
                              options={roomsOptions}
                              label={getRequiredOrOptionalFieldLabel(
                                t('room'),
                                fields.required[FORM_NAMES.room],
                              )}
                              error={error?.message}
                              {...field}
                            />
                          );
                        }}
                      />
                    </FieldWrapper>
                  )}
                  {fields.display[FORM_NAMES.accessCode] && (
                    <FieldWrapper>
                      <InputController
                        {...register(FORM_NAMES.accessCode, {
                          required: fields.required[FORM_NAMES.accessCode],
                        })}
                        control={control}
                        error={errors[FORM_NAMES.accessCode]?.message}
                        label={getRequiredOrOptionalFieldLabel(
                          t('access_code'),
                          fields.required[FORM_NAMES.accessCode],
                        )}
                        placeholder={t('enter_your_code')}
                      />
                    </FieldWrapper>
                  )}
                  {fields.display[FORM_NAMES.externalId] && (
                    <FieldWrapper>
                      <InputController
                        {...register(FORM_NAMES.externalId, {
                          required: fields.required[FORM_NAMES.externalId],
                        })}
                        control={control}
                        error={errors[FORM_NAMES.externalId]?.message}
                        label={getRequiredOrOptionalFieldLabel(
                          t('external_id'),
                          fields.required[FORM_NAMES.externalId],
                        )}
                        placeholder={t('enter_your_external_id')}
                      />
                    </FieldWrapper>
                  )}
                  {fields.display[FORM_NAMES.doorNameInSalto] && (
                    <FieldWrapper>
                      <InputController
                        {...register(FORM_NAMES.doorNameInSalto, {
                          required: fields.required[FORM_NAMES.doorNameInSalto],
                        })}
                        control={control}
                        error={(errors[FORM_NAMES.doorNameInSalto] as any)?.message}
                        label={getRequiredOrOptionalFieldLabel(
                          t('door_name_in_salto'),
                          fields.required[FORM_NAMES.doorNameInSalto],
                        )}
                        placeholder={t('enter_door_name_in_salto')}
                      />
                    </FieldWrapper>
                  )}
                  {fields.display[FORM_NAMES.name] && (
                    <FieldWrapper>
                      <InputController
                        placeholder={t('enter_name')}
                        label={getRequiredOrOptionalFieldLabel(
                          t('name'),
                          fields.required[FORM_NAMES.name],
                        )}
                        error={(errors[FORM_NAMES.name] as any)?.message}
                        {...register(FORM_NAMES.name, {
                          required: fields.required[FORM_NAMES.name],
                        })}
                        control={control}
                        onInput={() => setIsNameTouched(true)}
                      />
                    </FieldWrapper>
                  )}
                </div>
              )}
            </div>
          )}
        </Content>
        <ModalTwoButtonsWrapper>
          <ModalButton
            disabled={isButtonDisabled}
            onClick={handleSubmit(onSubmit)}
            label={isLoading ? t('loading') : t('add')}
          />
          <ModalButton secondary label={t('cancel')} onClick={handleClose} />
        </ModalTwoButtonsWrapper>
      </div>
    </Modal>
  );
}

NewDoorModal.defaultProps = defaultProps;
export {NewDoorModal};
