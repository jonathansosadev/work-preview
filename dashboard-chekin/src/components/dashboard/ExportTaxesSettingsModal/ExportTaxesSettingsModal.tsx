import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import api, {queryFetcher} from '../../../api';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import {
  Exemption,
  Housing,
  Season,
  SeasonRule,
  SelectOption,
  ShortHousing,
} from '../../../utils/types';
import {useErrorToast} from '../../../utils/hooks';
import {getShortHousingsAsOptions} from '../../../utils/housing';
import {useTaxesExport} from '../../../context/taxesExport';
import SelectPropsModal from '../SelectPropsModal';
import {useFormContext} from 'react-hook-form';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';

function fetchShortHousings() {
  return queryFetcher(api.housings.ENDPOINTS.all(`ordering=name&fields=id,name`));
}

type ExportTaxesSettingsModalProps = {
  onClose: () => void;
  getHighSeasonPayload: () => any;
  getLowSeasonPayload: () => any;
  open?: boolean;
  housing?: Housing;
};

const defaultProps: Partial<ExportTaxesSettingsModalProps> = {
  open: false,
  housing: undefined,
};

function ExportTaxesSettingsModal({
  open,
  onClose,
  getHighSeasonPayload,
  getLowSeasonPayload,
  housing,
}: ExportTaxesSettingsModalProps) {
  const {t} = useTranslation();
  const {startTaxesExport} = useTaxesExport();
  const {getValues} = useFormContext();
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

  const removeIdsFromRules = (rules: SeasonRule[]) => {
    return rules.map((rule) => {
      return {
        ...rule,
        id: undefined,
        season_id: undefined,
      };
    });
  };

  const removeIdsFromExemptions = (exemptions: Exemption[]) => {
    return exemptions.map((exemption) => {
      return {
        ...exemption,
        id: undefined,
        season_id: undefined,
      };
    });
  };

  const removeIdsFromSeason = (season: Season) => {
    return {
      ...season,
      id: undefined,
      season_links: undefined,
      housings: undefined,
      rules: removeIdsFromRules(season?.rules),
      exemptions: removeIdsFromExemptions(season?.exemptions),
    };
  };

  const getHousingPayload = () => {
    const taxSourcesOptions = getValues(HOUSING_FORM_NAMES.tax_exempt_sources);
    const commissionResponsibilityForTouristTax = getValues(
      HOUSING_FORM_NAMES.commission_responsibility_for_tourist_tax,
    );
    const taxSources = taxSourcesOptions?.map((option: SelectOption) => {
      return option.value;
    });

    return {
      [HOUSING_FORM_NAMES.tax_exempt_sources]: taxSources || [],
      [HOUSING_FORM_NAMES.commission_responsibility_for_tourist_tax]:
        commissionResponsibilityForTouristTax ?? undefined,
    };
  };

  const getPayload = () => {
    const highSeason = getHighSeasonPayload();
    const lowSeason = getLowSeasonPayload();
    const highSeasonWithoutIds = removeIdsFromSeason(highSeason);
    const lowSeasonWithoutIds = lowSeason ? removeIdsFromSeason(lowSeason) : null;
    const housingPayload = getHousingPayload();

    return {
      highSeason: highSeasonWithoutIds,
      lowSeason: lowSeasonWithoutIds,
      housing: housingPayload,
    };
  };

  const {
    checkboxes,
    toggleIsChecked,
    toggleSelectAll,
    isAllChecked,
  } = useHousingsSelectCheckboxes(shortHousingsOptions);

  const applyContractDetailsToHousings = async () => {
    const payload = getPayload();
    const housingIds = Object.keys(checkboxes).filter((key) => {
      return checkboxes[key as keyof typeof checkboxes] === true;
    });

    startTaxesExport(housingIds, payload);
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

ExportTaxesSettingsModal.defaultProps = defaultProps;
export {ExportTaxesSettingsModal};
