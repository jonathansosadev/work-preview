import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {useFormContext} from 'react-hook-form';
import {Housing, ShortHousing} from '../../../utils/types';
import {useErrorToast} from '../../../utils/hooks';
import {useContractsExport} from '../../../context/contractsExport';
import {getShortHousingsAsOptions, fetchShortHousings} from '../../../utils/housing';
import {FORM_NAMES} from '../HousingContractsSection';
import SelectPropsModal from '../SelectPropsModal';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';

type ExportContractsSettingsModalProps = {
  getContractsPayload: () => any;
  onClose: () => void;
  open?: boolean;
  housing?: Housing;
};

const defaultProps: Partial<ExportContractsSettingsModalProps> = {
  open: false,
  housing: undefined,
};

function ExportContractsSettingsModal({
  open,
  onClose,
  getContractsPayload,
  housing,
}: ExportContractsSettingsModalProps) {
  const {t} = useTranslation();
  const {getValues} = useFormContext();
  const {startContractSettingsExport} = useContractsExport();

  const {
    data: shortHousings,
    error: shortHousingsError,
    status: shortHousingsStatus,
  } = useQuery<ShortHousing[], string>('shortHousings', fetchShortHousings, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  useErrorToast(shortHousingsError, {
    notFoundMessage:
      'Requested short shortHousings could not be found. Please contact support.',
  });

  const housingId = housing?.id;
  const shortHousingsOptions = React.useMemo(() => {
    return getShortHousingsAsOptions(shortHousings).filter((option) => {
      return option.value !== housingId;
    });
  }, [housingId, shortHousings]);

  const {
    checkboxes,
    toggleIsChecked,
    toggleSelectAll,
    isAllChecked,
  } = useHousingsSelectCheckboxes(shortHousingsOptions);

  const getPayload = () => {
    const values = getValues();
    const result: {[key: string]: string} = {};

    Object.values(FORM_NAMES).forEach((formName) => {
      result[formName] = values[formName];
    });

    return {
      ...result,
      ...getContractsPayload(),
      is_contract_enabled: true,
      location: {...housing?.location, address: result.address === '' ? '' : undefined},
      address: undefined,
    };
  };

  const applyContractDetailsToHousings = async () => {
    const payload = getPayload();
    const housingIds = Object.keys(checkboxes).filter((key) => {
      return checkboxes[key as keyof typeof checkboxes] === true;
    });

    startContractSettingsExport(housingIds, payload);
    onClose();
  };

  return (
    <SelectPropsModal
      open={open}
      onClose={onClose}
      housingsOptions={shortHousingsOptions}
      toggleIsChecked={toggleIsChecked}
      toggleSelectAll={toggleSelectAll}
      checkboxes={checkboxes}
      isAllChecked={isAllChecked}
      isLoading={shortHousingsStatus === 'loading'}
      onExport={applyContractDetailsToHousings}
      confirmBtnLabel={t('export')}
    />
  );
}

ExportContractsSettingsModal.defaultProps = defaultProps;
export {ExportContractsSettingsModal};
