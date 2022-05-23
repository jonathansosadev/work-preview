import React, {Dispatch, SetStateAction} from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useQuery} from 'react-query';
import moment, {Moment} from 'moment';
import {useFormContext} from 'react-hook-form';
import api, {queryFetcher} from '../../../api';
import useBuildSeasonPayload from './useBuildSeasonPayload';
import {
  Exemption,
  Housing,
  InputEventType,
  Season,
  SeasonRule,
  SelectOption,
  TaxExemption,
} from '../../../utils/types';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import {useErrorToast, useIsFormTouched, useModalControls} from '../../../utils/hooks';
import {
  COUNTRIES_WITH_TAXES_AGE_RULES_CALC,
  COUNTRY_CODES,
  SUBSCRIPTION_PRODUCT_TYPES,
} from '../../../utils/constants';
import {useTaxesExport} from '../../../context/taxesExport';
import {useSubscription} from '../../../context/subscription';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {transformBooleanToString} from './utils';
import {
  DEFAULT_EXEMPTIONS_AMOUNT,
  MIN_PRICE,
  MIN_AGE,
  MIN_NIGHTS_NUMBER_TAXED,
  CURRENT_YEAR,
  FORM_NAMES,
  FORM_NAMES_FRANCE_TAXES,
  FORM_TAXES_FEES_NAMES,
  AGE_CALCULATOR_FORM_NAMES,
  FRANCE_STAT_EXEMPTIONS,
  EXTRA_FORM_NAMES,
} from './constants';
import {FEES_OPTIONS_PAYLOAD} from '../FeesOptions';
import SectionTag, {SectionTagColors} from '../SectionTag';
import Section from '../Section';
import PaymentsTooltip from '../PaymentsTooltip';
import Switch, {useSwitchSectionActive} from '../Switch';
import TaxesCreationModals from '../TaxesCreationModals';
import MultiSelect from '../MultiSelect';
import Loader from '../../common/Loader';
import Button from '../Button';
import ExportTaxesSettingsModal from '../ExportTaxesSettingsModal';
import ImportTaxesModal from '../ImportTaxesModal';
import FranceSection from './components/FranceSection';
import SubscriptionModal from '../SubscriptionModal';
import {CustomCheckbox} from '../Checkbox';
import {RelativeWrapper} from '../../../styled/common';
import {
  AgeRuleInput,
  AgeRuleNameButton,
  AgeRuleRow,
  AgeRulesContainer,
  AgeRuleSeasonInput,
  AgeRuleSeasonInputSideLabel,
  AgeRulesLabel,
  BetweenAgesText,
  BetweenAgesWrapper,
  CheckboxWrapper,
  DayMonthPicker,
  ExceptionRuleWrapper,
  ExceptionsLabel,
  ExceptionsMultiSelectWrapper,
  ExceptionsRules,
  ExportSettingsButtonWrapper,
  LessThanRuleWrapper,
  LoaderWrapper,
  StyledExemptSourcesSubsection,
  LowSeasonDayMonthPicker,
  MaxNightsTaxedInputWrapper,
  ModalAgeRuleRow,
  ModalAgeRulesContainer,
  MonthElement,
  RestartTaxesModalButtonWrapper,
  SeasonContainer,
  SeasonDatePickerWrapper,
  SeasonLabel,
  SeasonsGroup,
  ShortInput,
  ShortInputCurrency,
  ShortInputWrapper,
  SinglePricePerNightWrapper,
  TaxesFeesOptions,
  WhiteSpace,
} from './styled';

export type FormTypes = {
  [FORM_NAMES.lowAmount]: string;
  [FORM_NAMES.highAmount]: string;
  [FORM_NAMES.lessThanAge]: string;
  [FORM_NAMES.maxNightsTaxed]: string;
  [FORM_NAMES.moreThanAge]: string;
  [FORM_NAMES.betweenLowAge]: string;
  [FORM_NAMES.betweenHighAge]: string;
  [FORM_NAMES.moreThanHighSeasonAmount]: string;
  [FORM_NAMES.moreThanLowSeasonAmount]: string;
  [FORM_NAMES.betweenHighSeasonAmount]: string;
  [FORM_NAMES.betweenLowSeasonAmount]: string;
  [FORM_NAMES.lessThanHighSeasonAmount]: string;
  [FORM_NAMES.lessThanLowSeasonAmount]: string;
  [FORM_NAMES_FRANCE_TAXES.isClassified]: '1' | '0';
  [FORM_NAMES_FRANCE_TAXES.hasRegionTax]: '1' | '0';
  [FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax]: '1' | '0';
  [FORM_NAMES_FRANCE_TAXES.municipalTariff]: string;
  [FORM_NAMES_FRANCE_TAXES.municipalPercentage]: string;
};

enum AGE_RULES_CHECKBOXES {
  moreThan = 'moreThan',
  between = 'between',
  lessThan = 'lessThan',
}

const initDisplayFields = {
  [FORM_NAMES.lowAmount]: true,
  [FORM_NAMES.highAmount]: true,
  [FORM_NAMES.lessThanAge]: true,
  [FORM_NAMES.maxNightsTaxed]: true,
  [FORM_NAMES.moreThanAge]: true,
  [FORM_NAMES.lessThanAge]: true,
  [FORM_NAMES.betweenLowAge]: true,
  [FORM_NAMES.betweenHighAge]: true,
  [FORM_NAMES.moreThanLowSeasonAmount]: true,
  [FORM_NAMES.lessThanLowSeasonAmount]: true,
  [FORM_NAMES.moreThanHighSeasonAmount]: true,
  [FORM_NAMES.lessThanHighSeasonAmount]: true,
  [FORM_NAMES.betweenLowSeasonAmount]: true,
  [FORM_NAMES.betweenHighSeasonAmount]: true,
  [EXTRA_FORM_NAMES.exemptions]: true,
};

type GetDisplayFields = {
  country?: string;
  isDubaiCity: boolean;
};
function getDisplayFields({country, isDubaiCity}: GetDisplayFields) {
  switch (country) {
    case COUNTRY_CODES.uae:
      if (isDubaiCity) {
        return {...initDisplayFields, [EXTRA_FORM_NAMES.exemptions]: false};
      }
      return initDisplayFields;
    case COUNTRY_CODES.france:
      return {
        [FORM_NAMES.lowAmount]: false,
        [FORM_NAMES.highAmount]: false,
        [FORM_NAMES.lessThanAge]: false,
        [FORM_NAMES.maxNightsTaxed]: false,
        [FORM_NAMES.moreThanAge]: false,
        [FORM_NAMES.lessThanAge]: false,
        [FORM_NAMES.betweenLowAge]: false,
        [FORM_NAMES.betweenHighAge]: false,
        [FORM_NAMES.moreThanLowSeasonAmount]: false,
        [FORM_NAMES.lessThanLowSeasonAmount]: false,
        [FORM_NAMES.moreThanHighSeasonAmount]: false,
        [FORM_NAMES.lessThanHighSeasonAmount]: false,
        [FORM_NAMES.betweenLowSeasonAmount]: false,
        [FORM_NAMES.betweenHighSeasonAmount]: false,
        [EXTRA_FORM_NAMES.exemptions]: false,
        ...Object.values(FORM_NAMES_FRANCE_TAXES).reduce<Record<string, unknown>>(
          (acc, fieldName) => {
            acc[fieldName] = true;
            return acc;
          },
          {},
        ),
      };
    default:
      return initDisplayFields;
  }
}

function getTaxExemptionsAsOptions(data?: TaxExemption[]) {
  const NO_TAX_EXEMPTIONS = 'NONE';

  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data
    .filter((t) => {
      return t.id !== NO_TAX_EXEMPTIONS;
    })
    .map((t) => {
      return {
        value: t.id,
        label: t.name,
      };
    });
}

function fetchTaxExemptions() {
  return queryFetcher(api.statTaxExemptions.ENDPOINTS.all());
}

function getInitInputValues() {
  let result: {[key: string]: string} = {};
  Object.keys({...FORM_NAMES, ...FORM_NAMES_FRANCE_TAXES}).forEach((key) => {
    result[key] = '';
  });

  return result;
}

const DEFAULT_FEES_SELECTOR = {
  [FORM_TAXES_FEES_NAMES.discount_fees_from_my_balance]: FEES_OPTIONS_PAYLOAD.MANAGER,
};

type HousingTaxesSectionProps = {
  openExportTaxesModal: () => void;
  closeExportTaxesModal: () => void;
  isExportTaxesModalOpen: boolean;
  setIsSectionTouched: Dispatch<SetStateAction<boolean>>;
  handlePaymentSectionToggle: (isSectionActive: boolean) => boolean;
  disabled?: boolean;
  areSeasonsLoading?: boolean;
  highSeason?: Season;
  housing?: Housing;
  lowSeason?: Season;
  country?: string;
  province?: string;
};

const defaultProps: Partial<HousingTaxesSectionProps> = {
  disabled: false,
  areSeasonsLoading: false,
  country: '',
};

const HousingTaxesSection = React.forwardRef(
  (
    {
      disabled,
      areSeasonsLoading,
      highSeason,
      lowSeason,
      housing,
      setIsSectionTouched,
      openExportTaxesModal,
      closeExportTaxesModal,
      isExportTaxesModalOpen,
      country,
      province,
      handlePaymentSectionToggle,
    }: HousingTaxesSectionProps,
    ref,
  ) => {
    const {t} = useTranslation();
    const {isTaxActive, isTrialMode} = useSubscription();
    const {register, getValues, setValue, watch, formState, trigger} = useFormContext<
      FormTypes
    >();

    const {errors} = formState;

    const {isSubmitted} = formState;
    const {
      isOpen: isTaxesModalOpen,
      openModal: openTaxesModal,
      closeModal: closeTaxesModal,
    } = useModalControls();
    const {
      isOpen: isImportTaxesModalOpen,
      openModal: openImportTaxesModal,
      closeModal: closeImportTaxesModal,
    } = useModalControls();
    const {
      isOpen: isSubscriptionModalOpen,
      openModal: openSubscriptionModal,
      closeModal: closeSubscriptionModal,
    } = useModalControls();
    const {isExporting} = useTaxesExport();
    const isDubaiCity = country === COUNTRY_CODES.uae && province === 'AE-DU';
    const isFranceCountry = country === COUNTRY_CODES.france;
    const displayFields = getDisplayFields({country, isDubaiCity});
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      displayFields,
      watch,
    });
    const {buildHighSeasonPayload, buildLowSeasonPayload} = useBuildSeasonPayload();
    const [isSelectorsTouched, setIsSelectorsTouched] = React.useState(false);
    const {paymentSettingsCurrencyLabel} = usePaymentSettings();

    const [highSeasonStartDate, setHighSeasonStartDate] = React.useState<Moment | null>(
      null,
    );
    const [highSeasonEndDate, setHighSeasonEndDate] = React.useState<Moment | null>(null);
    const [lowSeasonStartDate, setLowSeasonStartDate] = React.useState<Moment | null>(
      null,
    );
    const [lowSeasonEndDate, setLowSeasonEndDate] = React.useState<Moment | null>(null);
    const [focusedLowSeasonModalInput, setFocusedLowSeasonModalInput] = React.useState<
      'startDate' | 'endDate' | null
    >(null);
    const [focusedHighSeasonModalInput, setFocusedHighSeasonModalInput] = React.useState<
      'startDate' | 'endDate' | null
    >(null);
    const [focusedHighSeasonInput, setFocusedHighSeasonInput] = React.useState<
      'startDate' | 'endDate' | null
    >(null);
    const [focusedLowSeasonInput, setFocusedLowSeasonInput] = React.useState<
      'startDate' | 'endDate' | null
    >(null);
    const [inputValues, setInputValues] = React.useState<{[key: string]: string}>(
      getInitInputValues,
    );
    const [exemptions, setExemptions] = React.useState<SelectOption[]>([]);
    const [isMaxNightsTaxed, setIsMaxNightsTaxed] = React.useState(false);
    const [ageRulesCheckboxes, setAgeRulesCheckboxes] = React.useState({
      [AGE_RULES_CHECKBOXES.moreThan]: false,
      [AGE_RULES_CHECKBOXES.between]: false,
      [AGE_RULES_CHECKBOXES.lessThan]: false,
    });
    const [defaultAgeCalculatorValues, setDefaultAgeCalculatorValues] = React.useState<{
      [key: string]: number;
    }>({});
    const [isCreationModalUsed, setIsCreationModalUsed] = React.useState(false);
    const [isBookingPercentagePrice, setIsBookingPercentagePrice] = React.useState(false);

    const [isHighSeasonPreloaded, setIsHighSeasonPreloaded] = React.useState(false);
    const isHighSeasonDatesComplete = Boolean(highSeasonEndDate && highSeasonStartDate);
    const isLowSeasonDatesComplete = Boolean(lowSeasonEndDate && lowSeasonStartDate);
    const hasTwoSeasons = isHighSeasonDatesComplete;

    const {data: taxExemptions, error: taxExemptionsError} = useQuery<
      TaxExemption[],
      string
    >('taxExemptions', fetchTaxExemptions, {
      refetchOnWindowFocus: false,
    });

    useErrorToast(taxExemptionsError, {
      notFoundMessage:
        'Requested tax exemptions could not be found. Please contact support.',
    });

    const taxExemptionsOptions = React.useMemo(() => {
      return getTaxExemptionsAsOptions(taxExemptions);
    }, [taxExemptions]);

    const isCountryWithTaxesCalc = COUNTRIES_WITH_TAXES_AGE_RULES_CALC.includes(country!);
    const hasLessThanAgeRule =
      !isCountryWithTaxesCalc && Boolean(inputValues[FORM_NAMES.lessThanAge]);
    const isAgeCalculatorNextButtonDisabled =
      Object.values(ageRulesCheckboxes).every((checkbox) => {
        return !checkbox;
      }) ||
      Object.keys(errors).some((key) => {
        if ((errors as any)[key]?.message) {
          return AGE_CALCULATOR_FORM_NAMES.includes(key as FORM_NAMES);
        }
        return false;
      });

    const getHighSeasonExemptionsPayload = React.useCallback(() => {
      if (!exemptions) {
        return [];
      }

      return exemptions.map(
        (exemption): Partial<Exemption> => {
          const existingExemption = highSeason?.exemptions?.find((ex) => {
            return ex?.exemption_type === exemption.value;
          });

          return {
            id: existingExemption?.id,
            exemption_type: exemption.value,
            price: isBookingPercentagePrice ? undefined : DEFAULT_EXEMPTIONS_AMOUNT,
            percent: isBookingPercentagePrice ? DEFAULT_EXEMPTIONS_AMOUNT : undefined,
          };
        },
      );
    }, [exemptions, highSeason, isBookingPercentagePrice]);

    const getLowSeasonExemptionsPayload = React.useCallback(() => {
      if (!exemptions) {
        return [];
      }

      return exemptions.map(
        (exemption): Partial<Exemption> => {
          const existingExemption = lowSeason?.exemptions?.find((ex) => {
            return ex?.exemption_type === exemption.value;
          });

          return {
            id: existingExemption?.id,
            exemption_type: exemption.value,
            price: isBookingPercentagePrice ? undefined : DEFAULT_EXEMPTIONS_AMOUNT,
            percent: isBookingPercentagePrice ? DEFAULT_EXEMPTIONS_AMOUNT : undefined,
          };
        },
      );
    }, [exemptions, isBookingPercentagePrice, lowSeason]);

    const getRulesForHighSeason = React.useCallback(() => {
      const rules: Partial<SeasonRule>[] = [];
      const formValues = getValues();

      if (
        !isCountryWithTaxesCalc ||
        (isCountryWithTaxesCalc && ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan])
      ) {
        const lessThanAge = Number(formValues?.[FORM_NAMES.lessThanAge] || MIN_AGE);

        if (lessThanAge) {
          const lessThanAmount = Number(
            formValues?.[FORM_NAMES.lessThanHighSeasonAmount] || MIN_PRICE,
          );
          const lessThanRule: Partial<SeasonRule> = {
            less_than: lessThanAge,
            price: isBookingPercentagePrice ? undefined : lessThanAmount,
            percent: isBookingPercentagePrice ? lessThanAmount : undefined,
          };

          if (lessThanRule) {
            rules.push(lessThanRule);
          }
        }
      }

      if (isCountryWithTaxesCalc && ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]) {
        const moreThanAge = Number(formValues?.[FORM_NAMES.moreThanAge] || MIN_AGE);

        if (moreThanAge) {
          const moreThanAmount = Number(
            formValues?.[FORM_NAMES.moreThanHighSeasonAmount] || MIN_PRICE,
          );
          const moreThanRule: Partial<SeasonRule> = {
            up_to: moreThanAge,
            price: isBookingPercentagePrice ? undefined : moreThanAmount,
            percent: isBookingPercentagePrice ? moreThanAmount : undefined,
          };

          if (moreThanRule) {
            rules.push(moreThanRule);
          }
        }
      }

      if (isCountryWithTaxesCalc && ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
        const betweenHighAge = Number(formValues?.[FORM_NAMES.betweenHighAge] || MIN_AGE);
        const betweenLowAge = Number(formValues?.[FORM_NAMES.betweenLowAge] || MIN_AGE);
        const betweenAmount = Number(
          formValues?.[FORM_NAMES.betweenHighSeasonAmount] || MIN_PRICE,
        );

        if (betweenHighAge && betweenLowAge) {
          const betweenThanRule: Partial<SeasonRule> = {
            less_than: betweenHighAge,
            up_to: betweenLowAge,
            price: isBookingPercentagePrice ? undefined : betweenAmount,
            percent: isBookingPercentagePrice ? betweenAmount : undefined,
          };

          if (betweenThanRule) {
            rules.push(betweenThanRule);
          }
        }

        if (
          betweenHighAge &&
          !betweenLowAge &&
          !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
        ) {
          const lessThanRule: Partial<SeasonRule> = {
            less_than: betweenHighAge,
            price: isBookingPercentagePrice ? undefined : betweenAmount,
            percent: isBookingPercentagePrice ? betweenAmount : undefined,
          };

          if (lessThanRule) {
            rules.push(lessThanRule);
          }
        }
      }
      return rules;
    }, [ageRulesCheckboxes, getValues, isBookingPercentagePrice, isCountryWithTaxesCalc]);

    const getHighSeasonPayload = React.useCallback(() => {
      const formValues = getValues();
      const rules = getRulesForHighSeason();
      const exemptions = getHighSeasonExemptionsPayload();

      return buildHighSeasonPayload({
        housingId: housing?.id,
        exemptions,
        rules,
        isBookingPercentagePrice,
        highSeasonStartDate,
        highSeasonEndDate,
        country,
        formValues,
      });
    }, [
      buildHighSeasonPayload,
      country,
      getHighSeasonExemptionsPayload,
      getRulesForHighSeason,
      getValues,
      highSeasonEndDate,
      highSeasonStartDate,
      housing?.id,
      isBookingPercentagePrice,
    ]);

    const getRulesForLowSeason = React.useCallback(() => {
      const rules: Partial<SeasonRule>[] = [];
      const formValues = getValues();

      if (
        !isCountryWithTaxesCalc ||
        (isCountryWithTaxesCalc && ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan])
      ) {
        const lessThanAge = Number(formValues?.[FORM_NAMES.lessThanAge] || MIN_AGE);

        if (lessThanAge) {
          const lessThanAmount = Number(
            formValues?.[FORM_NAMES.lessThanLowSeasonAmount] || MIN_PRICE,
          );
          const lessThanRule: Partial<SeasonRule> = {
            less_than: lessThanAge,
            price: isBookingPercentagePrice ? undefined : lessThanAmount,
            percent: isBookingPercentagePrice ? lessThanAmount : undefined,
          };

          if (lessThanRule) {
            rules.push(lessThanRule);
          }
        }
      }

      if (isCountryWithTaxesCalc && ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]) {
        const moreThanAge = Number(formValues?.[FORM_NAMES.moreThanAge] || MIN_AGE);

        if (moreThanAge) {
          const moreThanAmount = Number(
            formValues?.[FORM_NAMES.moreThanLowSeasonAmount] || MIN_PRICE,
          );

          const moreThanRule: Partial<SeasonRule> = {
            up_to: moreThanAge,
            price: isBookingPercentagePrice ? undefined : moreThanAmount,
            percent: isBookingPercentagePrice ? moreThanAmount : undefined,
          };

          if (moreThanRule) {
            rules.push(moreThanRule);
          }
        }
      }

      if (isCountryWithTaxesCalc && ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
        const betweenHighAge = Number(formValues?.[FORM_NAMES.betweenHighAge] || MIN_AGE);
        const betweenLowAge = Number(formValues?.[FORM_NAMES.betweenLowAge] || MIN_AGE);
        const betweenAmount = Number(
          formValues?.[FORM_NAMES.betweenLowSeasonAmount] || MIN_PRICE,
        );

        if (betweenHighAge && betweenLowAge) {
          const betweenThanRule: Partial<SeasonRule> = {
            less_than: betweenHighAge,
            up_to: betweenLowAge,
            price: isBookingPercentagePrice ? undefined : betweenAmount,
            percent: isBookingPercentagePrice ? betweenAmount : undefined,
          };

          if (betweenThanRule) {
            rules.push(betweenThanRule);
          }
        }

        if (
          betweenHighAge &&
          !betweenLowAge &&
          !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
        ) {
          const lessThanRule: Partial<SeasonRule> = {
            less_than: betweenHighAge,
            price: isBookingPercentagePrice ? undefined : betweenAmount,
            percent: isBookingPercentagePrice ? betweenAmount : undefined,
          };

          if (lessThanRule) {
            rules.push(lessThanRule);
          }
        }
      }
      return rules;
    }, [ageRulesCheckboxes, getValues, isBookingPercentagePrice, isCountryWithTaxesCalc]);

    const getLowSeasonPayload = React.useCallback(() => {
      if (!highSeasonStartDate && !highSeasonEndDate) {
        return null;
      }

      const formValues = getValues();
      const rules = getRulesForLowSeason();
      const exemptions = getLowSeasonExemptionsPayload();

      return buildLowSeasonPayload({
        exemptions,
        rules,
        housingId: housing?.id,
        isBookingPercentagePrice,
        country,
        formValues,
      });
    }, [
      highSeasonStartDate,
      highSeasonEndDate,
      getValues,
      getRulesForLowSeason,
      getLowSeasonExemptionsPayload,
      buildLowSeasonPayload,
      housing?.id,
      isBookingPercentagePrice,
      country,
    ]);

    const resetAgeCalculatorDefaultValuesAndCheckboxes = React.useCallback(() => {
      setDefaultAgeCalculatorValues({});
      setAgeRulesCheckboxes({
        [AGE_RULES_CHECKBOXES.between]: false,
        [AGE_RULES_CHECKBOXES.moreThan]: false,
        [AGE_RULES_CHECKBOXES.lessThan]: false,
      });
    }, []);

    const resetTaxesAgeCalculator = React.useCallback(() => {
      setAgeRulesCheckboxes({
        [AGE_RULES_CHECKBOXES.between]: false,
        [AGE_RULES_CHECKBOXES.lessThan]: false,
        [AGE_RULES_CHECKBOXES.moreThan]: false,
      });

      const formData = [
        {name: FORM_NAMES.lessThanAge, value: String(MIN_AGE)},
        {name: FORM_NAMES.moreThanAge, value: String(MIN_AGE)},
        {name: FORM_NAMES.betweenLowAge, value: String(MIN_AGE)},
        {name: FORM_NAMES.betweenHighAge, value: String(MIN_AGE)},
        {name: FORM_NAMES.lessThanLowSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.lessThanHighSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.moreThanLowSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.moreThanHighSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.betweenLowSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.betweenHighSeasonAmount, value: String(MIN_PRICE)},
      ];
      formData.forEach(({name, value}) => {
        setValue(name, value);
      });
    }, [setValue]);

    const resetTaxesDetails = React.useCallback(() => {
      setHighSeasonStartDate(null);
      setHighSeasonEndDate(null);
      setLowSeasonStartDate(null);
      setLowSeasonEndDate(null);
      setInputValues(getInitInputValues());
      resetAgeCalculatorDefaultValuesAndCheckboxes();
      setExemptions([]);
      setIsMaxNightsTaxed(false);
      setIsHighSeasonPreloaded(false);
      resetTaxesAgeCalculator();
    }, [resetAgeCalculatorDefaultValuesAndCheckboxes, resetTaxesAgeCalculator]);

    const activateAgeRuleCheckbox = React.useCallback(
      (name: typeof AGE_RULES_CHECKBOXES[keyof typeof AGE_RULES_CHECKBOXES]) => {
        if (isCountryWithTaxesCalc) {
          setAgeRulesCheckboxes((prevState) => {
            return {
              ...prevState,
              [name]: true,
            };
          });
        }
      },
      [isCountryWithTaxesCalc],
    );

    const findLessThanRule = React.useCallback((season: Season) => {
      const rules = season?.rules;

      if (!rules?.length) {
        return null;
      }

      return rules.find((rule: SeasonRule) => {
        return rule.less_than && !rule.up_to;
      });
    }, []);

    const findMoreThanRule = React.useCallback((season: Season) => {
      const rules = season?.rules;

      if (!rules?.length) {
        return null;
      }

      return rules.find((rule: SeasonRule) => {
        return rule.up_to && !rule.less_than;
      });
    }, []);

    const findBetweenRule = React.useCallback((season: Season) => {
      const rules = season?.rules;

      if (!rules?.length) {
        return null;
      }

      return rules.find((rule: SeasonRule) => {
        return rule.up_to && rule.less_than;
      });
    }, []);

    const getSeasonPrice = React.useCallback((price = MIN_PRICE) => {
      return price;
    }, []);

    const preloadFranceCountry = React.useCallback(
      (season: Season) => {
        const hasDepartmentalTax = transformBooleanToString(season.has_departmental_tax);
        const hasRegionTax = transformBooleanToString(season.has_region_tax);
        const isClassified = transformBooleanToString(season.is_classified);
        const municipalPercentage = String(season.municipal_percentage);
        const municipalTariff = String(season.municipal_tariff);

        setValue(FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax, hasDepartmentalTax);
        setValue(FORM_NAMES_FRANCE_TAXES.hasRegionTax, hasRegionTax);
        setValue(FORM_NAMES_FRANCE_TAXES.municipalPercentage, municipalPercentage);
        setValue(FORM_NAMES_FRANCE_TAXES.municipalTariff, municipalTariff);
        setValue(FORM_NAMES_FRANCE_TAXES.isClassified, isClassified);

        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax]: hasDepartmentalTax,
            [FORM_NAMES_FRANCE_TAXES.hasRegionTax]: hasRegionTax,
            [FORM_NAMES_FRANCE_TAXES.municipalPercentage]: municipalPercentage,
            [FORM_NAMES_FRANCE_TAXES.municipalTariff]: municipalTariff,
            [FORM_NAMES_FRANCE_TAXES.isClassified]: isClassified,
          };
        });
      },
      [setUntouchedValues, setValue],
    );

    const preloadHighSeasonData = React.useCallback(
      (season: Season) => {
        const isBookingPercentagePrice = season.is_by_percent;
        setIsBookingPercentagePrice(isBookingPercentagePrice);

        const startDate = season.from_date
          ? moment(season.from_date, 'YYYY-MM-DD')
          : null;
        const endDate = season.to_date ? moment(season.to_date, 'YYYY-MM-DD') : null;
        setHighSeasonStartDate(startDate);
        setHighSeasonEndDate(endDate);

        if (startDate && endDate) {
          const lowSeasonStartDate = endDate.clone().add(1, 'days');
          const lowSeasonEndDate = startDate.clone().subtract(1, 'days');
          setLowSeasonStartDate(lowSeasonStartDate);
          setLowSeasonEndDate(lowSeasonEndDate);
        }

        const amountPerNight = season?.is_by_percent
          ? getSeasonPrice(season?.percentage_per_booking)
          : getSeasonPrice(season?.price_per_night);
        setInputValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.highAmount]: String(amountPerNight),
          };
        });
        setValue(FORM_NAMES.highAmount, String(amountPerNight));

        const maxNightsTaxed = season?.max_nights || MIN_NIGHTS_NUMBER_TAXED;
        setInputValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.maxNightsTaxed]: String(maxNightsTaxed),
          };
        });
        setValue(FORM_NAMES.maxNightsTaxed, String(maxNightsTaxed));

        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.highAmount]: String(amountPerNight),
            [FORM_NAMES.maxNightsTaxed]: String(maxNightsTaxed),
          };
        });

        if (isFranceCountry) {
          preloadFranceCountry(season);
        }

        const isMaxNightsTaxes = Boolean(season?.is_max_nights_taxed);
        setIsMaxNightsTaxed(isMaxNightsTaxes);

        const lessThanRule = findLessThanRule(season);
        if (lessThanRule) {
          const lessThanAge = String(lessThanRule.less_than || MIN_AGE);
          const lessThanAmount = String(
            season?.is_by_percent
              ? getSeasonPrice(lessThanRule.percent)
              : getSeasonPrice(lessThanRule.price),
          );

          activateAgeRuleCheckbox(AGE_RULES_CHECKBOXES.lessThan);
          activateAgeRuleCheckbox(AGE_RULES_CHECKBOXES.moreThan);

          setInputValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.lessThanAge]: lessThanAge,
              [FORM_NAMES.lessThanHighSeasonAmount]: lessThanAmount,
            };
          });

          const formData = [
            {name: FORM_NAMES.lessThanAge, value: lessThanAge},
            {name: FORM_NAMES.lessThanHighSeasonAmount, value: lessThanAmount},
          ];
          formData.forEach(({name, value}) => {
            setValue(name, value);
          });
          setUntouchedValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.lessThanAge]: lessThanAge,
              [FORM_NAMES.lessThanHighSeasonAmount]: lessThanAmount,
            };
          });
        }

        const moreThanRule = findMoreThanRule(season);
        if (moreThanRule) {
          const moreThanAge = String(moreThanRule.up_to || MIN_AGE);
          const moreThanAmount = String(
            season?.is_by_percent
              ? getSeasonPrice(moreThanRule.percent)
              : getSeasonPrice(moreThanRule.price),
          );

          activateAgeRuleCheckbox(AGE_RULES_CHECKBOXES.moreThan);
          activateAgeRuleCheckbox(AGE_RULES_CHECKBOXES.lessThan);

          setInputValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.moreThanAge]: moreThanAge,
              [FORM_NAMES.moreThanHighSeasonAmount]: moreThanAmount,
            };
          });
          const formData = [
            {name: FORM_NAMES.moreThanAge, value: moreThanAge},
            {name: FORM_NAMES.moreThanHighSeasonAmount, value: moreThanAmount},
          ];
          formData.forEach(({name, value}) => {
            setValue(name, value);
          });
          setUntouchedValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.moreThanAge]: moreThanAge,
              [FORM_NAMES.moreThanHighSeasonAmount]: moreThanAmount,
            };
          });
        }

        const betweenRule = findBetweenRule(season);
        if (betweenRule) {
          const betweenHighAge = String(betweenRule.less_than || MIN_AGE);
          const betweenLowAge = String(betweenRule.up_to || MIN_PRICE);
          const betweenAmount = String(
            season?.is_by_percent
              ? getSeasonPrice(betweenRule.percent)
              : getSeasonPrice(betweenRule.price),
          );

          activateAgeRuleCheckbox(AGE_RULES_CHECKBOXES.between);
          setInputValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.betweenHighAge]: betweenHighAge,
              [FORM_NAMES.betweenLowAge]: betweenLowAge,
              [FORM_NAMES.betweenHighSeasonAmount]: betweenAmount,
            };
          });
          const formData = [
            {name: FORM_NAMES.betweenHighAge, value: betweenHighAge},
            {name: FORM_NAMES.betweenLowAge, value: betweenLowAge},
            {name: FORM_NAMES.betweenHighSeasonAmount, value: betweenAmount},
          ];
          formData.forEach(({name, value}) => {
            setValue(name, value);
          });
          setUntouchedValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.betweenHighAge]: betweenHighAge,
              [FORM_NAMES.betweenLowAge]: betweenLowAge,
              [FORM_NAMES.betweenHighSeasonAmount]: betweenAmount,
            };
          });
        }

        if (season?.exemptions?.length) {
          const nextExemptions: SelectOption[] = [];

          season?.exemptions.forEach((exemption) => {
            const existingExemption = taxExemptionsOptions.find((option) => {
              return option.value === exemption.exemption_type;
            });

            if (existingExemption) {
              nextExemptions.push(existingExemption);
            }
          });

          if (nextExemptions?.length) {
            setExemptions(nextExemptions);
          }
        }

        setIsHighSeasonPreloaded(true);
      },
      [
        isFranceCountry,
        preloadFranceCountry,
        activateAgeRuleCheckbox,
        findBetweenRule,
        findLessThanRule,
        findMoreThanRule,
        getSeasonPrice,
        setUntouchedValues,
        setValue,
        taxExemptionsOptions,
      ],
    );

    const preloadLowSeasonData = React.useCallback(
      (season: Season) => {
        const amountPerNight = season?.is_by_percent
          ? getSeasonPrice(season?.percentage_per_booking)
          : getSeasonPrice(season?.price_per_night);
        setInputValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.lowAmount]: String(amountPerNight),
          };
        });
        setValue(FORM_NAMES.lowAmount, String(amountPerNight));
        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.lowAmount]: String(amountPerNight),
          };
        });

        const lessThanRule = findLessThanRule(season);
        if (lessThanRule) {
          const lessThanAmount = String(
            season?.is_by_percent
              ? getSeasonPrice(lessThanRule.percent)
              : getSeasonPrice(lessThanRule.price),
          );
          setInputValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.lessThanLowSeasonAmount]: lessThanAmount,
            };
          });
          setValue(FORM_NAMES.lessThanLowSeasonAmount, lessThanAmount);
          setUntouchedValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.lessThanLowSeasonAmount]: lessThanAmount,
            };
          });
        }

        const moreThanRule = findMoreThanRule(season);
        if (moreThanRule) {
          const moreThanAmount = String(
            season?.is_by_percent
              ? getSeasonPrice(moreThanRule.percent)
              : getSeasonPrice(moreThanRule.price),
          );
          setInputValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.moreThanLowSeasonAmount]: moreThanAmount,
            };
          });
          setValue(FORM_NAMES.moreThanLowSeasonAmount, moreThanAmount);
          setUntouchedValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.moreThanLowSeasonAmount]: moreThanAmount,
            };
          });
        }

        const betweenRule = findBetweenRule(season);
        if (betweenRule) {
          const betweenAmount = String(
            season?.is_by_percent
              ? getSeasonPrice(betweenRule.percent)
              : getSeasonPrice(betweenRule.price),
          );
          setInputValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.betweenLowSeasonAmount]: betweenAmount,
            };
          });
          setValue(FORM_NAMES.betweenLowSeasonAmount, betweenAmount);
          setUntouchedValues((prevState) => {
            return {
              ...prevState,
              [FORM_NAMES.betweenLowSeasonAmount]: betweenAmount,
            };
          });
        }
      },
      [
        findBetweenRule,
        findLessThanRule,
        findMoreThanRule,
        getSeasonPrice,
        setUntouchedValues,
        setValue,
      ],
    );

    const preloadedSectionActive = Boolean(housing?.seasons?.length);
    const {
      isSectionActive,
      toggleIsSectionActive,
      setIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(preloadedSectionActive, {
      canToggle: (isSectionActive) => {
        const arePaymentsOk = handlePaymentSectionToggle(isSectionActive);
        const hasAnySeason = Boolean(highSeason || lowSeason);

        if (!arePaymentsOk) {
          return false;
        }

        setIsCreationModalUsed(false);

        if (!isSectionActive) {
          resetTaxesDetails();

          if (!hasAnySeason) {
            openTaxesModal();
            return false;
          }
        }

        return true;
      },
    });

    const resetSections = () => {
      setIsCreationModalUsed(false);
    };

    React.useImperativeHandle(ref, () => {
      return {
        getHighSeasonPayload,
        getLowSeasonPayload,
        resetTaxesDetails,
        resetSections,
        active: isSectionActive,
      };
    });

    React.useEffect(
      function setStaticExemptionsByCountry() {
        if (!isSectionActive) return;
        if (isFranceCountry) {
          const franceExemptions = taxExemptionsOptions.filter((opt) =>
            FRANCE_STAT_EXEMPTIONS.includes(opt.value),
          );
          setExemptions(franceExemptions);
        }
      },
      [isFranceCountry, taxExemptionsOptions, isSectionActive],
    );

    React.useEffect(() => {
      if (disabled) {
        return;
      }

      const hasTaxes = Boolean(housing?.seasons?.length);
      setIsSectionActive(hasTaxes);
    }, [housing, disabled, setIsSectionActive]);

    React.useEffect(
      function setHighSeasonDetailsOnSectionToggle() {
        if (!isSectionActive || areSeasonsLoading || !highSeason || isCreationModalUsed) {
          return;
        }

        setIsHighSeasonPreloaded(false);
        resetTaxesAgeCalculator();
        preloadHighSeasonData(highSeason);
      },
      [
        areSeasonsLoading,
        highSeason,
        isSectionActive,
        preloadHighSeasonData,
        resetTaxesAgeCalculator,
        isCreationModalUsed,
      ],
    );

    React.useEffect(
      function setLowSeasonDetails() {
        if (
          !lowSeason ||
          areSeasonsLoading ||
          !isHighSeasonPreloaded ||
          isCreationModalUsed
        ) {
          return;
        }

        preloadLowSeasonData(lowSeason);
      },
      [
        lowSeason,
        preloadLowSeasonData,
        areSeasonsLoading,
        isHighSeasonPreloaded,
        isCreationModalUsed,
      ],
    );

    const setSectionTouched = React.useCallback(() => {
      if (setIsSectionTouched && isSectionActive) {
        setIsSectionTouched(true);
      }
    }, [isSectionActive, setIsSectionTouched]);

    React.useEffect(() => {
      setIsSectionTouched(isFormTouched || isSelectorsTouched || isSectionActiveTouched);
    }, [isFormTouched, isSelectorsTouched, setIsSectionTouched, isSectionActiveTouched]);

    const setFieldValueAndValidateIt = async (
      name: typeof FORM_NAMES[keyof typeof FORM_NAMES],
      value: string,
      forceValidation = false,
    ) => {
      setValue(name, value);
      if (isSubmitted || forceValidation) {
        await trigger(name);
      }
    };

    const getIsNegativeValue = (value: string) => {
      return value && Number(value) < 0;
    };

    const getIsIntegerFieldFloat = (value: string, name: FORM_NAMES) => {
      const integerFields = [FORM_NAMES.lessThanAge, FORM_NAMES.maxNightsTaxed];
      const mustBeIntegerField = value && integerFields.includes(name);

      return mustBeIntegerField && !Number.isInteger(Number(value));
    };

    const handleInputChange = (event: InputEventType) => {
      const {value, name} = event.target;
      const isNegative = getIsNegativeValue(value);
      const isIntegerFieldFloat = getIsIntegerFieldFloat(value, name as FORM_NAMES);

      if (isNegative || isIntegerFieldFloat) {
        return;
      }

      setValue(name as FORM_NAMES, value);
      setInputValues((prevState) => {
        return {
          ...prevState,
          [name]: value,
        };
      });
      setSectionTouched();
    };

    const handleCustomFieldChange = (
      name: FORM_NAMES | FORM_NAMES_FRANCE_TAXES,
      value: string,
    ) => {
      setValue(name as FORM_NAMES, value);
      setInputValues((prevState) => {
        return {
          ...prevState,
          [name]: value,
        };
      });
      setSectionTouched();
    };

    const resetMoreLessThanAgeFields = (forceValidation = false) => {
      const formData = [
        {name: FORM_NAMES.moreThanAge, value: String(MIN_AGE)},
        {name: FORM_NAMES.lessThanAge, value: String(MIN_AGE)},
        {name: FORM_NAMES.moreThanLowSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.moreThanHighSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.lessThanLowSeasonAmount, value: String(MIN_PRICE)},
        {name: FORM_NAMES.lessThanHighSeasonAmount, value: String(MIN_PRICE)},
      ];
      formData.forEach(({name, value}) => {
        setValue(name, value);
      });
      if (isSubmitted || forceValidation) {
        trigger([
          FORM_NAMES.moreThanAge,
          FORM_NAMES.lessThanAge,
          FORM_NAMES.moreThanLowSeasonAmount,
          FORM_NAMES.moreThanHighSeasonAmount,
          FORM_NAMES.lessThanLowSeasonAmount,
          FORM_NAMES.lessThanHighSeasonAmount,
        ]);
      }
    };

    const preloadMoreLessThanAgeFields = async (forceValidation = false) => {
      const formValues = getValues();
      const betweenLowAge = formValues[FORM_NAMES.betweenLowAge];
      const betweenHighAge = formValues[FORM_NAMES.betweenHighAge];

      if (betweenLowAge) {
        await setFieldValueAndValidateIt(
          FORM_NAMES.moreThanAge,
          betweenLowAge,
          forceValidation,
        );

        if (isSubmitted || forceValidation) {
          await trigger(FORM_NAMES.lessThanAge);
        }
      }
      if (betweenHighAge) {
        await setFieldValueAndValidateIt(
          FORM_NAMES.lessThanAge,
          betweenHighAge,
          forceValidation,
        );

        if (isSubmitted || forceValidation) {
          await trigger(FORM_NAMES.moreThanAge);
        }
      }
    };

    const resetBetweenAgeFields = (forceValidation = false) => {
      const formData = [
        {name: FORM_NAMES.betweenHighAge, value: String(MIN_AGE)},
        {name: FORM_NAMES.betweenLowAge, value: String(MIN_AGE)},
        {
          name: FORM_NAMES.betweenLowSeasonAmount,
          value: String(MIN_PRICE),
        },
        {name: FORM_NAMES.betweenHighSeasonAmount, value: String(MIN_PRICE)},
      ];

      formData.forEach(({name, value}) => {
        setValue(name, value);
      });

      if (isSubmitted || forceValidation) {
        trigger([
          FORM_NAMES.betweenLowSeasonAmount,
          FORM_NAMES.betweenHighSeasonAmount,
          FORM_NAMES.betweenHighAge,
          FORM_NAMES.betweenLowAge,
        ]);
      }
    };

    const preloadBetweenAgeFields = async (forceValidation = false) => {
      const formValues = getValues();
      const moreThanAge = formValues[FORM_NAMES.moreThanAge];
      const lessThanAge = formValues[FORM_NAMES.lessThanAge];

      if (moreThanAge) {
        await setFieldValueAndValidateIt(
          FORM_NAMES.betweenLowAge,
          moreThanAge,
          forceValidation,
        );
        if (isSubmitted || forceValidation) {
          await trigger(FORM_NAMES.betweenHighAge);
        }
      }

      if (lessThanAge) {
        await setFieldValueAndValidateIt(
          FORM_NAMES.betweenHighAge,
          lessThanAge,
          forceValidation,
        );
        if (isSubmitted || forceValidation) {
          await trigger(FORM_NAMES.betweenLowAge);
        }
      }
    };

    const handleAgeRulesCheckboxesSet = (name?: string, forceValidation = false) => {
      if (
        name === AGE_RULES_CHECKBOXES.lessThan ||
        name === AGE_RULES_CHECKBOXES.moreThan
      ) {
        setAgeRulesCheckboxes((prevState) => {
          const prevCheckedState = prevState[name];
          if (prevCheckedState) {
            resetMoreLessThanAgeFields(forceValidation);
          } else {
            preloadMoreLessThanAgeFields(forceValidation);
          }

          return {
            ...prevState,
            [AGE_RULES_CHECKBOXES.lessThan]: !prevCheckedState,
            [AGE_RULES_CHECKBOXES.moreThan]: !prevCheckedState,
          };
        });
      }

      if (name === AGE_RULES_CHECKBOXES.between) {
        setAgeRulesCheckboxes((prevState) => {
          const prevCheckedState = prevState[name];
          if (prevCheckedState) {
            resetBetweenAgeFields(forceValidation);
          } else {
            preloadBetweenAgeFields(forceValidation);
          }

          return {
            ...prevState,
            [AGE_RULES_CHECKBOXES.between]: !prevCheckedState,
          };
        });
      }
    };

    const handleAgeRuleCheckboxCheck = (name?: string) => {
      handleAgeRulesCheckboxesSet(name);
      setSectionTouched();
    };

    const handleModalAgeRuleCheckboxCheck = (name?: string) => {
      const forceValidation = true;
      handleAgeRulesCheckboxesSet(name, forceValidation);
    };

    const resetSeasons = () => {
      setHighSeasonStartDate(null);
      setHighSeasonEndDate(null);
      setLowSeasonStartDate(null);
      setLowSeasonEndDate(null);
    };

    const resetExemptions = () => {
      setExemptions([]);
    };

    const handleImportTaxesModalSubmit = (seasons: Season[]) => {
      const highSeason = seasons[0];
      const lowSeason = seasons[1];

      setIsSectionActive(true);
      if (highSeason) {
        preloadHighSeasonData(highSeason);

        if (lowSeason) {
          preloadLowSeasonData(lowSeason);
        }
      }

      setSectionTouched();
      closeImportTaxesModal();
      closeTaxesModal();
    };

    const handleModalHighSeasonDatesChange = ({
      startDate,
      endDate,
    }: {
      startDate: Moment | null;
      endDate: Moment | null;
    }) => {
      setSectionTouched();

      if (!startDate || !endDate) {
        setLowSeasonStartDate(null);
        setLowSeasonEndDate(null);
        setInputValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.lowAmount]: '',
          };
        });
      } else {
        const lowSeasonStartDate = endDate.clone().add(1, 'days');
        const lowSeasonEndDate = startDate.clone().subtract(1, 'days');

        setLowSeasonStartDate(lowSeasonStartDate);
        setLowSeasonEndDate(lowSeasonEndDate);
      }

      setHighSeasonStartDate(startDate);
      setHighSeasonEndDate(endDate);
    };

    const handleHighSeasonDatesChange = ({
      startDate,
      endDate,
    }: {
      startDate: Moment | null;
      endDate: Moment | null;
    }) => {
      setSectionTouched();

      if (startDate && !endDate) {
        const nextEndDate = startDate.clone().add(1, 'day');
        setHighSeasonEndDate(nextEndDate);
        setHighSeasonStartDate(startDate);

        const lowSeasonStartDate = nextEndDate.clone().add(1, 'days');
        const lowSeasonEndDate = startDate.clone().subtract(1, 'days');
        setLowSeasonStartDate(lowSeasonStartDate);
        setLowSeasonEndDate(lowSeasonEndDate);

        return;
      }

      if (endDate && !startDate) {
        const nextStartDate = endDate.clone().subtract(1, 'day');
        setHighSeasonStartDate(nextStartDate);
        setHighSeasonEndDate(endDate);

        const lowSeasonStartDate = endDate.clone().add(1, 'days');
        const lowSeasonEndDate = nextStartDate.clone().subtract(1, 'days');
        setLowSeasonStartDate(lowSeasonStartDate);
        setLowSeasonEndDate(lowSeasonEndDate);

        return;
      }

      if (endDate && startDate) {
        const lowSeasonStartDate = endDate.clone().add(1, 'days');
        const lowSeasonEndDate = startDate.clone().subtract(1, 'days');
        setLowSeasonStartDate(lowSeasonStartDate);
        setLowSeasonEndDate(lowSeasonEndDate);
      }

      setHighSeasonStartDate(startDate);
      setHighSeasonEndDate(endDate);
    };

    const handleLowSeasonDatesChange = ({
      startDate,
      endDate,
    }: {
      startDate: Moment | null;
      endDate: Moment | null;
    }) => {
      setSectionTouched();
      setLowSeasonStartDate(startDate);
      setLowSeasonEndDate(endDate);
    };

    const handleExemptionChange = (nextExemptions: SelectOption[]) => {
      setExemptions(nextExemptions);
      setSectionTouched();
    };

    const handleIsMaxNightsTaxedSwitch = (checked: boolean) => {
      if (!checked) {
        setInputValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.maxNightsTaxed]: '',
          };
        });
      }

      setIsMaxNightsTaxed(checked);
      setSectionTouched();
    };

    const saveAgeCalculatorDefaultValues = () => {
      const formValues: any = getValues();
      const defaultValues: {[key: string]: any} = {};

      Object.keys(formValues).forEach((key) => {
        if (AGE_CALCULATOR_FORM_NAMES.includes(key as FORM_NAMES)) {
          defaultValues[key] = formValues[key];
        }
      });
      setDefaultAgeCalculatorValues(defaultValues);
    };

    const validateSelf = (e: InputEventType) => {
      const fieldName = e.target.name as typeof FORM_NAMES[keyof typeof FORM_NAMES];
      trigger(fieldName);
    };

    const restartTaxesCreation = () => {
      setIsSectionActive(false);
      resetTaxesDetails();
      openTaxesModal();
    };

    const handleFinish = () => {
      const isMaxNightsTaxed = Boolean(inputValues[FORM_NAMES.maxNightsTaxed]);
      if (isMaxNightsTaxed) {
        setIsMaxNightsTaxed(true);
      }

      setIsCreationModalUsed(true);
      closeTaxesModal();
      setIsSectionActive(true);
    };

    const toggleSectionActive = () => {
      if (!isSectionActive && !isTaxActive && !isTrialMode) {
        openSubscriptionModal();
        return;
      }

      toggleIsSectionActive();
    };

    const {onChange: lessThanAgeOnChange, ...lessThanAgeRegister} = register(
      FORM_NAMES.lessThanAge,
      {
        validate: (value) => {
          const moreThanAge = parseInt(getValues()[FORM_NAMES.moreThanAge], 10);
          const numberValue = parseInt(value);

          if (moreThanAge > 0 && numberValue > moreThanAge) {
            return t('max_number', {number: moreThanAge}) as string;
          }

          if (numberValue < MIN_AGE) {
            return t('min_number', {number: MIN_AGE}) as string;
          }
        },
      },
    );

    const {onChange: betweenLowAgeOnChange, ...betweenLowAgeRegister} = register(
      FORM_NAMES.betweenLowAge,
      {
        validate: (value) => {
          const betweenHighAge = parseInt(getValues()[FORM_NAMES.betweenHighAge], 10);
          const numberValue = parseInt(value);

          if (betweenHighAge > 0 && numberValue > betweenHighAge) {
            return t('max_number', {
              number: betweenHighAge,
            }) as string;
          }

          if (numberValue < MIN_AGE) {
            return t('min_number', {number: MIN_AGE}) as string;
          }
        },
      },
    );

    const {onChange: betweenHighAgeOnChange, ...betweenHighAgeRegister} = register(
      FORM_NAMES.betweenHighAge,
      {
        validate: (value) => {
          const betweenLowAge = parseInt(getValues()[FORM_NAMES.betweenLowAge], 10);
          const numberValue = parseInt(value);

          if (betweenLowAge > 0 && numberValue < betweenLowAge) {
            return t('min_number', {
              number: betweenLowAge,
            }) as string;
          }

          if (numberValue < MIN_AGE) {
            return t('min_number', {number: MIN_AGE}) as string;
          }
        },
      },
    );

    const {onChange: moreThanAgeOnChange, ...moreThanAgeRegister} = register(
      FORM_NAMES.moreThanAge,
      {
        validate: (value) => {
          if (!isCountryWithTaxesCalc) return true;

          const lessThanAge = parseInt(getValues()[FORM_NAMES.lessThanAge], 10);
          const numberValue = parseInt(value);

          if (lessThanAge > 0 && numberValue < lessThanAge) {
            return t('min_number', {number: lessThanAge}) as string;
          }

          if (numberValue < MIN_AGE) {
            return t('min_number', {number: MIN_AGE}) as string;
          }
        },
      },
    );

    const minValidation = {
      min: {
        value: MIN_PRICE,
        message: t('min_number', {number: MIN_PRICE}),
      },
    };

    const {
      onChange: lessThanHighSeasonAmountOnChange,
      ...lessThanHighSeasonAmountRegister
    } = register(FORM_NAMES.lessThanHighSeasonAmount, minValidation);

    const {
      onChange: lessThanLowSeasonAmountOnChange,
      ...lessThanLowSeasonAmountRegister
    } = register(FORM_NAMES.lessThanLowSeasonAmount, minValidation);

    const {
      onChange: betweenHighSeasonAmountOnChange,
      ...betweenHighSeasonAmountRegister
    } = register(FORM_NAMES.betweenHighSeasonAmount, minValidation);

    const {
      onChange: betweenLowSeasonAmountOnChange,
      ...betweenLowSeasonAmountRegister
    } = register(FORM_NAMES.betweenLowSeasonAmount, minValidation);

    const {
      onChange: moreThanHighSeasonAmountOnChange,
      ...moreThanHighSeasonAmountRegister
    } = register(FORM_NAMES.moreThanHighSeasonAmount, minValidation);

    const {
      onChange: moreThanLowSeasonAmountOnChange,
      ...moreThanLowSeasonAmountRegister
    } = register(FORM_NAMES.moreThanLowSeasonAmount, minValidation);

    return (
      <Section
        title={
          <div>
            {t('tourist_taxes')}
            <SectionTag color={SectionTagColors.BLUE} label={t('premium')} />
          </div>
        }
        subtitle={t('tourist_taxes_subtitle')}
        subtitleTooltip={
          <PaymentsTooltip
            currencyLabel={paymentSettingsCurrencyLabel}
            title={t('payments_tooltip_title')}
          />
        }
      >
        {isExportTaxesModalOpen && (
          <ExportTaxesSettingsModal
            open
            housing={housing}
            getHighSeasonPayload={getHighSeasonPayload}
            getLowSeasonPayload={getLowSeasonPayload}
            onClose={closeExportTaxesModal}
          />
        )}
        <Switch
          checked={isSectionActive}
          onChange={toggleSectionActive}
          label={t('activate_tourist_taxes')}
          disabled={disabled}
        />
        {isSectionActive && (
          <div>
            {areSeasonsLoading ? (
              <LoaderWrapper>
                <Loader label={t('loading')} height={45} width={45} />
              </LoaderWrapper>
            ) : (
              <div>
                <RestartTaxesModalButtonWrapper>
                  <Button
                    secondary
                    disabled={disabled}
                    label={t('restart_taxes_creation')}
                    onClick={restartTaxesCreation}
                  />
                </RestartTaxesModalButtonWrapper>
                {isFranceCountry && (
                  <FranceSection disabled={disabled} inputValues={inputValues} />
                )}
                {highSeasonStartDate && highSeasonEndDate ? (
                  <SeasonsGroup>
                    <SeasonContainer>
                      <SeasonLabel>{t('high_season')}</SeasonLabel>
                      <SeasonDatePickerWrapper>
                        <DayMonthPicker
                          readOnly
                          hideCalendarIcon
                          startDate={highSeasonStartDate}
                          endDate={highSeasonEndDate}
                          startDateId="start-high-date"
                          endDateId="end-high-date"
                          displayFormat="DD-MM"
                          showClearDates={false}
                          startDatePlaceholderText="00-00"
                          endDatePlaceholderText="00-00"
                          focusedInput={focusedHighSeasonInput}
                          renderMonthElement={({month}) => (
                            <MonthElement>{moment(month).format('MMMM')}</MonthElement>
                          )}
                          initialVisibleMonth={() => {
                            if (highSeasonStartDate) {
                              return highSeasonStartDate;
                            }

                            return moment(`${CURRENT_YEAR}-01-01`, 'YYYY-MM-DD');
                          }}
                          isOutsideRange={(day) => {
                            const leftBoundary = moment(
                              `${CURRENT_YEAR}-01-01`,
                              'YYYY-MM-DD',
                            );
                            const rightBoundary = moment(
                              `${CURRENT_YEAR}-12-31`,
                              'YYYY-MM-DD',
                            );

                            return (
                              day.isBefore(leftBoundary) || day.isAfter(rightBoundary)
                            );
                          }}
                          label={t('from_to')}
                          onFocusChange={(focusedInput) =>
                            setFocusedHighSeasonInput(focusedInput)
                          }
                          onDatesChange={handleHighSeasonDatesChange}
                          disabled={disabled}
                        />
                      </SeasonDatePickerWrapper>
                      {!isCountryWithTaxesCalc && displayFields?.[FORM_NAMES.highAmount] && (
                        <ShortInputWrapper>
                          <ShortInput
                            {...register(FORM_NAMES.highAmount, {
                              required: t('required') as string,
                              min: {
                                value: MIN_PRICE,
                                message: t('min_number_is', {number: MIN_PRICE}),
                              },
                            })}
                            defaultValue={inputValues[FORM_NAMES.highAmount]}
                            error={errors[FORM_NAMES.highAmount]?.message}
                            label={
                              isBookingPercentagePrice
                                ? t('percentage_per_booking')
                                : t('price_per_night')
                            }
                            placeholder={
                              isBookingPercentagePrice
                                ? t('enter_percentage')
                                : t('enter_price')
                            }
                            step="0.01"
                            inputMode="decimal"
                            type="number"
                            disabled={disabled}
                          />
                          <ShortInputCurrency>
                            {isBookingPercentagePrice
                              ? '%'
                              : paymentSettingsCurrencyLabel}
                          </ShortInputCurrency>
                        </ShortInputWrapper>
                      )}
                    </SeasonContainer>
                    <SeasonContainer>
                      <SeasonLabel>{t('low_season')}</SeasonLabel>
                      <SeasonDatePickerWrapper>
                        <LowSeasonDayMonthPicker
                          disabled
                          readOnly
                          hideCalendarIcon
                          showClearDates={false}
                          displayFormat="DD-MM"
                          startDate={lowSeasonStartDate}
                          endDate={lowSeasonEndDate}
                          startDatePlaceholderText="00-00"
                          endDatePlaceholderText="00-00"
                          startDateId="start-low-date"
                          endDateId="end-low-date"
                          focusedInput={focusedLowSeasonInput}
                          label={t('from_to')}
                          isOutsideRange={(day) => {
                            return day.isSameOrBefore(highSeasonEndDate);
                          }}
                          onFocusChange={(focusedInput) =>
                            setFocusedLowSeasonInput(focusedInput)
                          }
                          onDatesChange={handleLowSeasonDatesChange}
                        />
                      </SeasonDatePickerWrapper>
                      {!isCountryWithTaxesCalc && displayFields[FORM_NAMES.lowAmount] && (
                        <ShortInputWrapper>
                          <ShortInput
                            {...register(FORM_NAMES.lowAmount, {
                              required: t('required') as string,
                              min: {
                                value: MIN_PRICE,
                                message: t('min_number_is', {number: MIN_PRICE}),
                              },
                            })}
                            error={errors[FORM_NAMES.lowAmount]?.message}
                            label={
                              isBookingPercentagePrice
                                ? t('percentage_per_booking')
                                : t('price_per_night')
                            }
                            placeholder={
                              isBookingPercentagePrice
                                ? t('enter_percentage')
                                : t('enter_price')
                            }
                            defaultValue={inputValues[FORM_NAMES.lowAmount]}
                            disabled={disabled}
                            step="0.01"
                            inputMode="decimal"
                            type="number"
                          />
                          <ShortInputCurrency>
                            {isBookingPercentagePrice
                              ? '%'
                              : paymentSettingsCurrencyLabel}
                          </ShortInputCurrency>
                        </ShortInputWrapper>
                      )}
                    </SeasonContainer>
                  </SeasonsGroup>
                ) : (
                  <div>
                    {!isCountryWithTaxesCalc && displayFields[FORM_NAMES.highAmount] && (
                      <SinglePricePerNightWrapper>
                        <ShortInput
                          {...register(FORM_NAMES.highAmount, {
                            required: t('required') as string,
                            min: {
                              value: MIN_PRICE,
                              message: t('min_number_is', {number: MIN_PRICE}),
                            },
                          })}
                          defaultValue={inputValues[FORM_NAMES.highAmount]}
                          error={errors[FORM_NAMES.highAmount]?.message}
                          label={
                            isBookingPercentagePrice
                              ? t('percentage_per_booking')
                              : t('price_per_night')
                          }
                          placeholder={
                            isBookingPercentagePrice
                              ? t('enter_percentage')
                              : t('enter_price')
                          }
                          inputMode="decimal"
                          type="number"
                          step="0.01"
                          disabled={disabled}
                        />
                        <ShortInputCurrency>
                          {isBookingPercentagePrice ? '%' : paymentSettingsCurrencyLabel}
                        </ShortInputCurrency>
                      </SinglePricePerNightWrapper>
                    )}
                  </div>
                )}
                {isCountryWithTaxesCalc && (
                  <div>
                    <AgeRulesLabel>{t('prices')}</AgeRulesLabel>
                    <AgeRulesContainer>
                      <AgeRuleRow
                        active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                      >
                        <CheckboxWrapper
                          checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                        >
                          <CustomCheckbox
                            disabled={disabled}
                            onChange={handleAgeRuleCheckboxCheck}
                            checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                            name={AGE_RULES_CHECKBOXES.lessThan}
                          />
                        </CheckboxWrapper>
                        <AgeRuleNameButton
                          type="button"
                          disabled={disabled}
                          grayed={
                            disabled || !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
                          }
                          onClick={() =>
                            handleAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.lessThan)
                          }
                        >
                          {t('less_than')}
                        </AgeRuleNameButton>
                        <AgeRuleInput
                          disabled={
                            disabled || !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
                          }
                          label={t('age')}
                          placeholder={String(MIN_AGE)}
                          defaultValue={
                            defaultAgeCalculatorValues[FORM_NAMES.lessThanAge] || MIN_AGE
                          }
                          error={errors[FORM_NAMES.lessThanAge]?.message}
                          type="number"
                          inputMode="numeric"
                          onChange={(e: InputEventType) => {
                            const value = e.target.value;
                            lessThanAgeOnChange(e);

                            if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
                              setFieldValueAndValidateIt(FORM_NAMES.betweenLowAge, value);
                            }

                            if (isSubmitted) {
                              trigger([
                                FORM_NAMES.moreThanAge,
                                FORM_NAMES.betweenHighAge,
                              ]);
                            }
                          }}
                          {...lessThanAgeRegister}
                        />
                        <RelativeWrapper>
                          <AgeRuleSeasonInput
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
                            }
                            label={hasTwoSeasons ? t('high_season_price') : t('price')}
                            placeholder={String(MIN_PRICE)}
                            defaultValue={
                              defaultAgeCalculatorValues[
                                FORM_NAMES.lessThanHighSeasonAmount
                              ] || MIN_PRICE
                            }
                            error={errors[FORM_NAMES.lessThanHighSeasonAmount]?.message}
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            {...register(FORM_NAMES.lessThanHighSeasonAmount, {
                              min: {
                                value: MIN_PRICE,
                                message: t('min_number', {number: MIN_PRICE}),
                              },
                            })}
                          />
                          <AgeRuleSeasonInputSideLabel
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
                            }
                          >
                            {isBookingPercentagePrice
                              ? `% /${t('booking_price').toLowerCase()}`
                              : `${paymentSettingsCurrencyLabel}/${t(
                                  'night',
                                ).toLowerCase()}`}
                          </AgeRuleSeasonInputSideLabel>
                        </RelativeWrapper>
                        {hasTwoSeasons && (
                          <RelativeWrapper>
                            <AgeRuleSeasonInput
                              disabled={
                                disabled ||
                                !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
                              }
                              label={t('low_season_price')}
                              placeholder={String(MIN_PRICE)}
                              defaultValue={
                                defaultAgeCalculatorValues[
                                  FORM_NAMES.lessThanLowSeasonAmount
                                ] || MIN_PRICE
                              }
                              error={errors[FORM_NAMES.lessThanLowSeasonAmount]?.message}
                              type="number"
                              step="0.01"
                              inputMode="decimal"
                              {...register(FORM_NAMES.lessThanLowSeasonAmount, {
                                min: {
                                  value: MIN_PRICE,
                                  message: t('min_number', {number: MIN_PRICE}),
                                },
                              })}
                            />
                            <AgeRuleSeasonInputSideLabel
                              disabled={
                                disabled ||
                                !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]
                              }
                            >
                              {isBookingPercentagePrice
                                ? `% /${t('booking_price').toLowerCase()}`
                                : `${paymentSettingsCurrencyLabel}/${t(
                                    'night',
                                  ).toLowerCase()}`}
                            </AgeRuleSeasonInputSideLabel>
                          </RelativeWrapper>
                        )}
                      </AgeRuleRow>
                      <AgeRuleRow
                        active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      >
                        <CheckboxWrapper
                          checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                        >
                          <CustomCheckbox
                            disabled={disabled}
                            onChange={handleAgeRuleCheckboxCheck}
                            checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                            name={AGE_RULES_CHECKBOXES.between}
                          />
                        </CheckboxWrapper>
                        <AgeRuleNameButton
                          type="button"
                          disabled={disabled}
                          grayed={
                            disabled || !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                          }
                          onClick={() =>
                            handleAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.between)
                          }
                        >
                          {t('between')}
                        </AgeRuleNameButton>
                        <BetweenAgesWrapper>
                          <AgeRuleInput
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                            }
                            label={t('age')}
                            placeholder={String(MIN_AGE)}
                            defaultValue={
                              defaultAgeCalculatorValues[FORM_NAMES.betweenLowAge] ||
                              MIN_AGE
                            }
                            error={errors[FORM_NAMES.betweenLowAge]?.message}
                            type="number"
                            inputMode="numeric"
                            onChange={(e: InputEventType) => {
                              const value = e.target.value;
                              betweenLowAgeOnChange(e);

                              if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]) {
                                setFieldValueAndValidateIt(FORM_NAMES.lessThanAge, value);
                              }

                              if (isSubmitted) {
                                trigger([
                                  FORM_NAMES.moreThanAge,
                                  FORM_NAMES.betweenHighAge,
                                ]);
                              }
                            }}
                            {...betweenLowAgeRegister}
                          />
                          <BetweenAgesText
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                            }
                          >
                            {t('and').toLowerCase()}
                          </BetweenAgesText>
                          <AgeRuleInput
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                            }
                            label={t('age')}
                            placeholder={String(MIN_AGE)}
                            defaultValue={
                              defaultAgeCalculatorValues[FORM_NAMES.betweenHighAge] ||
                              MIN_AGE
                            }
                            error={errors[FORM_NAMES.betweenHighAge]?.message}
                            onChange={(e: InputEventType) => {
                              const value = e.target.value;
                              betweenHighAgeOnChange(e);

                              if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]) {
                                setFieldValueAndValidateIt(FORM_NAMES.moreThanAge, value);
                              }

                              if (isSubmitted) {
                                trigger([
                                  FORM_NAMES.lessThanAge,
                                  FORM_NAMES.betweenLowAge,
                                ]);
                              }
                            }}
                            type="number"
                            inputMode="numeric"
                            {...betweenHighAgeRegister}
                          />
                        </BetweenAgesWrapper>
                        <RelativeWrapper>
                          <AgeRuleSeasonInput
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                            }
                            label={hasTwoSeasons ? t('high_season_price') : t('price')}
                            placeholder={String(MIN_PRICE)}
                            defaultValue={
                              defaultAgeCalculatorValues[
                                FORM_NAMES.betweenHighSeasonAmount
                              ] || MIN_PRICE
                            }
                            error={errors[FORM_NAMES.betweenHighSeasonAmount]?.message}
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            {...register(FORM_NAMES.betweenHighSeasonAmount, {
                              min: {
                                value: MIN_PRICE,
                                message: t('min_number', {number: MIN_PRICE}),
                              },
                            })}
                          />
                          <AgeRuleSeasonInputSideLabel
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                            }
                          >
                            {isBookingPercentagePrice
                              ? `% /${t('booking_price').toLowerCase()}`
                              : `${paymentSettingsCurrencyLabel} /${t(
                                  'night',
                                ).toLowerCase()}`}
                          </AgeRuleSeasonInputSideLabel>
                        </RelativeWrapper>
                        {hasTwoSeasons && (
                          <RelativeWrapper>
                            <AgeRuleSeasonInput
                              disabled={
                                disabled ||
                                !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                              }
                              label={t('low_season_price')}
                              placeholder={String(MIN_PRICE)}
                              defaultValue={
                                defaultAgeCalculatorValues[
                                  FORM_NAMES.betweenLowSeasonAmount
                                ] || MIN_PRICE
                              }
                              error={errors[FORM_NAMES.betweenLowSeasonAmount]?.message}
                              type="number"
                              step="0.01"
                              inputMode="decimal"
                              {...register(FORM_NAMES.betweenLowSeasonAmount, {
                                min: {
                                  value: MIN_PRICE,
                                  message: t('min_number', {number: MIN_PRICE}),
                                },
                              })}
                            />
                            <AgeRuleSeasonInputSideLabel
                              disabled={
                                disabled ||
                                !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]
                              }
                            >
                              {isBookingPercentagePrice
                                ? `% /${t('booking_price').toLowerCase()}`
                                : `${paymentSettingsCurrencyLabel}/${t(
                                    'night',
                                  ).toLowerCase()}`}
                            </AgeRuleSeasonInputSideLabel>
                          </RelativeWrapper>
                        )}
                      </AgeRuleRow>
                      <AgeRuleRow
                        active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                      >
                        <CheckboxWrapper
                          checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                        >
                          <CustomCheckbox
                            disabled={disabled}
                            onChange={handleAgeRuleCheckboxCheck}
                            checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                            name={AGE_RULES_CHECKBOXES.moreThan}
                          />
                        </CheckboxWrapper>
                        <AgeRuleNameButton
                          type="button"
                          disabled={disabled}
                          grayed={
                            disabled || !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]
                          }
                          onClick={() =>
                            handleAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.moreThan)
                          }
                        >
                          {t('more_than')}
                        </AgeRuleNameButton>
                        <AgeRuleInput
                          disabled={
                            disabled || !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]
                          }
                          label={t('age')}
                          placeholder={String(MIN_AGE)}
                          defaultValue={
                            defaultAgeCalculatorValues[FORM_NAMES.moreThanAge] || MIN_AGE
                          }
                          error={errors[FORM_NAMES.moreThanAge]?.message}
                          onChange={(e: InputEventType) => {
                            const value = e.target.value;
                            moreThanAgeOnChange(e);

                            if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
                              setFieldValueAndValidateIt(
                                FORM_NAMES.betweenHighAge,
                                value,
                              );
                            }

                            if (isSubmitted) {
                              trigger([FORM_NAMES.lessThanAge, FORM_NAMES.betweenLowAge]);
                            }
                          }}
                          type="number"
                          inputMode="numeric"
                          {...moreThanAgeRegister}
                        />
                        <RelativeWrapper>
                          <AgeRuleSeasonInput
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]
                            }
                            label={hasTwoSeasons ? t('high_season_price') : t('price')}
                            placeholder={String(MIN_PRICE)}
                            defaultValue={
                              defaultAgeCalculatorValues[
                                FORM_NAMES.moreThanHighSeasonAmount
                              ] || MIN_PRICE
                            }
                            error={errors[FORM_NAMES.moreThanHighSeasonAmount]?.message}
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            {...register(FORM_NAMES.moreThanHighSeasonAmount, {
                              min: {
                                value: MIN_PRICE,
                                message: t('min_number', {number: MIN_PRICE}),
                              },
                            })}
                          />
                          <AgeRuleSeasonInputSideLabel
                            disabled={
                              disabled ||
                              !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]
                            }
                          >
                            {isBookingPercentagePrice
                              ? `% /${t('booking_price').toLowerCase()}`
                              : `${paymentSettingsCurrencyLabel} /${t(
                                  'night',
                                ).toLowerCase()}`}
                          </AgeRuleSeasonInputSideLabel>
                        </RelativeWrapper>
                        {hasTwoSeasons && (
                          <RelativeWrapper>
                            <AgeRuleSeasonInput
                              disabled={
                                disabled ||
                                !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]
                              }
                              label={t('low_season_price')}
                              placeholder={String(MIN_PRICE)}
                              defaultValue={
                                defaultAgeCalculatorValues[
                                  FORM_NAMES.moreThanLowSeasonAmount
                                ] || MIN_PRICE
                              }
                              error={errors[FORM_NAMES.moreThanLowSeasonAmount]?.message}
                              type="number"
                              step="0.01"
                              inputMode="decimal"
                              {...register(FORM_NAMES.moreThanLowSeasonAmount, {
                                min: {
                                  value: MIN_PRICE,
                                  message: t('min_number', {number: MIN_PRICE}),
                                },
                              })}
                            />
                            <AgeRuleSeasonInputSideLabel
                              disabled={
                                disabled ||
                                !ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]
                              }
                            >
                              {isBookingPercentagePrice
                                ? `% /${t('booking_price').toLowerCase()}`
                                : `${paymentSettingsCurrencyLabel}/${t(
                                    'night',
                                  ).toLowerCase()}`}
                            </AgeRuleSeasonInputSideLabel>
                          </RelativeWrapper>
                        )}
                      </AgeRuleRow>
                    </AgeRulesContainer>
                  </div>
                )}
                {displayFields[EXTRA_FORM_NAMES.exemptions] && (
                  <ExceptionsLabel>{t('exceptions')}</ExceptionsLabel>
                )}
                <ExceptionsRules>
                  {hasLessThanAgeRule && (
                    <div>
                      <LessThanRuleWrapper>
                        <ExceptionRuleWrapper>
                          <ShortInput
                            readOnly
                            disabled={disabled}
                            label={t('rule')}
                            value={t('less_than') as string}
                          />
                        </ExceptionRuleWrapper>
                        {displayFields[FORM_NAMES.lessThanAge] && (
                          <ShortInput
                            {...register(FORM_NAMES.lessThanAge, {
                              required: t('required') as string,
                              min: {
                                value: MIN_AGE,
                                message: t('min_number_is', {number: MIN_AGE}),
                              },
                              validate: (value: string) => {
                                const isFloat = getIsIntegerFieldFloat(
                                  value,
                                  FORM_NAMES.lessThanAge,
                                );

                                return !isFloat || (t('invalid') as string);
                              },
                            })}
                            error={errors[FORM_NAMES.lessThanAge]?.message}
                            label={t('age')}
                            placeholder={t('enter_age')}
                            defaultValue={inputValues[FORM_NAMES.lessThanAge]}
                            inputMode="numeric"
                            type="number"
                            disabled={disabled}
                          />
                        )}
                      </LessThanRuleWrapper>
                    </div>
                  )}
                  {displayFields[EXTRA_FORM_NAMES.exemptions] && (<ExceptionsMultiSelectWrapper>
                    <MultiSelect
                      isSearchable
                      label={t('name_of_exceptions')}
                      placeholder={t('enter_exceptions')}
                      options={taxExemptionsOptions}
                      onChange={handleExemptionChange}
                      value={exemptions}
                      disabled={disabled}
                      empty={!exemptions?.length}
                    />
                  </ExceptionsMultiSelectWrapper>)}
                  {displayFields[FORM_NAMES.maxNightsTaxed] && (
                    <Switch
                      onChange={handleIsMaxNightsTaxedSwitch}
                      checked={isMaxNightsTaxed}
                      label={t('max_nights_taxed')}
                      disabled={disabled}
                    />
                  )}
                  {isMaxNightsTaxed && displayFields[FORM_NAMES.maxNightsTaxed] && (
                    <MaxNightsTaxedInputWrapper>
                      <ShortInput
                        {...register(FORM_NAMES.maxNightsTaxed, {
                          required: t('required') as string,
                          min: {
                            value: MIN_NIGHTS_NUMBER_TAXED,
                            message: t('min_number_is', {
                              number: MIN_NIGHTS_NUMBER_TAXED,
                            }),
                          },
                          validate: (value: string) => {
                            const isFloat = getIsIntegerFieldFloat(
                              value,
                              FORM_NAMES.maxNightsTaxed,
                            );

                            return !isFloat || (t('invalid') as string);
                          },
                        })}
                        error={errors[FORM_NAMES.maxNightsTaxed]?.message}
                        label={t('number_of_nights')}
                        defaultValue={inputValues[FORM_NAMES.maxNightsTaxed]}
                        type="number"
                        inputMode="numeric"
                        placeholder={t('enter_number')}
                        disabled={disabled}
                      />
                    </MaxNightsTaxedInputWrapper>
                  )}
                </ExceptionsRules>
                <StyledExemptSourcesSubsection
                  disabled={isExporting || disabled}
                  housing={housing}
                  formName={HOUSING_FORM_NAMES.tax_exempt_sources}
                  onChange={setSectionTouched}
                />
                <ExportSettingsButtonWrapper>
                  <Button
                    secondary
                    blinking={isExporting}
                    disabled={isExporting || disabled}
                    label={t('export_these_settings_to_other_properties')}
                    onClick={openExportTaxesModal}
                  />
                </ExportSettingsButtonWrapper>
                <TaxesFeesOptions
                  formNames={FORM_TAXES_FEES_NAMES}
                  setIsSelectorsTouched={setIsSelectorsTouched}
                  preloadedSelectorsData={
                    housing?.commission_responsibility_for_tourist_tax
                  }
                  defaultFormValues={DEFAULT_FEES_SELECTOR}
                />
              </div>
            )}
          </div>
        )}
        <ImportTaxesModal
          strictOptions
          onSubmit={handleImportTaxesModalSubmit}
          housingId={housing?.id}
          open={isImportTaxesModalOpen}
          onClose={closeImportTaxesModal}
        />
        {isTaxesModalOpen && (
          <TaxesCreationModals
            open={isTaxesModalOpen}
            exemptions={exemptions}
            resetExemptions={resetExemptions}
            resetSeasons={resetSeasons}
            onClose={closeTaxesModal}
            isHighSeasonDatesComplete={isHighSeasonDatesComplete}
            isLowSeasonDatesComplete={isLowSeasonDatesComplete}
            handleInputChange={handleInputChange}
            handleCustomFieldChange={handleCustomFieldChange}
            inputValues={inputValues}
            setInputValues={setInputValues}
            onFinish={handleFinish}
            openImportTaxesModal={openImportTaxesModal}
            isCountryWithTaxesCalc={isCountryWithTaxesCalc}
            isDubaiCity={isDubaiCity}
            isFranceCountry={isFranceCountry}
            saveAgeCalculatorDefaultValues={saveAgeCalculatorDefaultValues}
            resetAgeCalculatorDefaultValuesAndCheckboxes={
              resetAgeCalculatorDefaultValuesAndCheckboxes
            }
            isBookingPercentagePrice={isBookingPercentagePrice}
            setIsBookingPercentagePrice={setIsBookingPercentagePrice}
            isAgeCalculatorNextButtonDisabled={isAgeCalculatorNextButtonDisabled}
            highSeasonDateRangePicker={
              <DayMonthPicker
                readOnly
                hideCalendarIcon
                startDate={highSeasonStartDate}
                endDate={highSeasonEndDate}
                startDateId="start-modal-high-date"
                endDateId="end-modal-high-date"
                focusedInput={focusedHighSeasonModalInput}
                onFocusChange={(focusedInput) =>
                  setFocusedHighSeasonModalInput(focusedInput)
                }
                displayFormat="DD-MM"
                showClearDates={false}
                startDatePlaceholderText="00-00"
                endDatePlaceholderText="00-00"
                renderMonthElement={({month}) => (
                  <MonthElement>{moment(month).format('MMMM')}</MonthElement>
                )}
                initialVisibleMonth={() => {
                  if (highSeasonStartDate) {
                    return highSeasonStartDate;
                  }

                  return moment(`${CURRENT_YEAR}-01-01`, 'YYYY-MM-DD');
                }}
                isOutsideRange={(day) => {
                  const leftBoundary = moment(`${CURRENT_YEAR}-01-01`, 'YYYY-MM-DD');
                  const rightBoundary = moment(`${CURRENT_YEAR}-12-31`, 'YYYY-MM-DD');

                  return day.isBefore(leftBoundary) || day.isAfter(rightBoundary);
                }}
                label={t('from_to')}
                onDatesChange={handleModalHighSeasonDatesChange}
                disabled={disabled}
              />
            }
            lowSeasonDateRangePicker={
              <LowSeasonDayMonthPicker
                disabled
                hideCalendarIcon
                startDate={lowSeasonStartDate}
                endDate={lowSeasonEndDate}
                startDateId="start-modal-low-date"
                endDateId="end-modal-low-date"
                focusedInput={focusedLowSeasonModalInput}
                label={t('from_to')}
                isOutsideRange={(day) => {
                  return day.isSameOrBefore(highSeasonEndDate);
                }}
                onFocusChange={(focusedInput) =>
                  setFocusedLowSeasonModalInput(focusedInput)
                }
                onDatesChange={handleLowSeasonDatesChange}
                showClearDates={false}
                displayFormat="DD-MM"
                startDatePlaceholderText="00-00"
                endDatePlaceholderText="00-00"
                readOnly
              />
            }
            exceptionsMultiSelect={
              <MultiSelect
                isSearchable
                label={t('name_of_exceptions')}
                placeholder={t('enter_exceptions')}
                options={taxExemptionsOptions}
                onChange={handleExemptionChange}
                value={exemptions}
                empty={!exemptions?.length}
              />
            }
            ageCalculator={
              <ModalAgeRulesContainer>
                <ModalAgeRuleRow
                  active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                >
                  <WhiteSpace />
                  <CheckboxWrapper
                    checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                  >
                    <CustomCheckbox
                      onChange={handleModalAgeRuleCheckboxCheck}
                      checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                      name={AGE_RULES_CHECKBOXES.lessThan}
                    />
                  </CheckboxWrapper>
                  <AgeRuleNameButton
                    type="button"
                    grayed={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                    onClick={() =>
                      handleModalAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.lessThan)
                    }
                  >
                    {t('less_than')}
                  </AgeRuleNameButton>
                  <AgeRuleInput
                    disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                    label={t('age')}
                    placeholder={String(MIN_AGE)}
                    defaultValue={
                      defaultAgeCalculatorValues[FORM_NAMES.lessThanAge] || ''
                    }
                    error={errors[FORM_NAMES.lessThanAge]?.message}
                    type="number"
                    inputMode="numeric"
                    onChange={(e: InputEventType) => {
                      const value = e.target.value;
                      lessThanAgeOnChange(e);
                      validateSelf(e);

                      if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
                        setValue(FORM_NAMES.betweenLowAge, value);
                      }

                      trigger([
                        FORM_NAMES.betweenLowAge,
                        FORM_NAMES.moreThanAge,
                        FORM_NAMES.betweenHighAge,
                      ]);
                    }}
                    {...lessThanAgeRegister}
                  />
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                      label={t('high_season_price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.lessThanHighSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.lessThanHighSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        validateSelf(e);
                        lessThanHighSeasonAmountOnChange(e);
                      }}
                      {...lessThanHighSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                      label={t('low_season_price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.lessThanLowSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.lessThanLowSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        lessThanLowSeasonAmountOnChange(e);
                        validateSelf(e);
                      }}
                      {...lessThanLowSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <WhiteSpace />
                </ModalAgeRuleRow>
                <ModalAgeRuleRow
                  active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                >
                  <WhiteSpace />
                  <CheckboxWrapper
                    checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                  >
                    <CustomCheckbox
                      onChange={handleModalAgeRuleCheckboxCheck}
                      checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      name={AGE_RULES_CHECKBOXES.between}
                    />
                  </CheckboxWrapper>
                  <AgeRuleNameButton
                    type="button"
                    grayed={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                    onClick={() =>
                      handleModalAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.between)
                    }
                  >
                    {t('between')}
                  </AgeRuleNameButton>
                  <BetweenAgesWrapper>
                    <AgeRuleInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      label={t('age')}
                      placeholder={String(MIN_AGE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.betweenLowAge] || ''
                      }
                      error={errors[FORM_NAMES.betweenLowAge]?.message}
                      type="number"
                      inputMode="numeric"
                      onChange={async (e: InputEventType) => {
                        const value = e.target.value;
                        await betweenLowAgeOnChange(e);
                        validateSelf(e);

                        if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]) {
                          setValue(FORM_NAMES.lessThanAge, value);
                        }

                        await trigger([
                          FORM_NAMES.lessThanAge,
                          FORM_NAMES.moreThanAge,
                          FORM_NAMES.betweenHighAge,
                        ]);
                      }}
                      {...betweenLowAgeRegister}
                    />
                    <BetweenAgesText
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                    >
                      {t('and').toLowerCase()}
                    </BetweenAgesText>
                    <AgeRuleInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      label={t('age')}
                      placeholder={String(MIN_AGE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.betweenHighAge] || ''
                      }
                      error={errors[FORM_NAMES.betweenHighAge]?.message}
                      onChange={(e: InputEventType) => {
                        const value = e.target.value;
                        betweenHighAgeOnChange(e);
                        validateSelf(e);

                        if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]) {
                          setValue(FORM_NAMES.moreThanAge, value);
                        }
                        trigger([
                          FORM_NAMES.moreThanAge,
                          FORM_NAMES.lessThanAge,
                          FORM_NAMES.betweenLowAge,
                        ]);
                      }}
                      type="number"
                      inputMode="numeric"
                      {...betweenHighAgeRegister}
                    />
                  </BetweenAgesWrapper>
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      label={t('high_season_price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.betweenHighSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.betweenHighSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        validateSelf(e);
                        betweenHighSeasonAmountOnChange(e);
                      }}
                      {...betweenHighSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      label={t('low_season_price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.betweenLowSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.betweenLowSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        betweenLowSeasonAmountOnChange(e);
                        validateSelf(e);
                      }}
                      {...betweenLowSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <WhiteSpace />
                </ModalAgeRuleRow>
                <ModalAgeRuleRow
                  active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                >
                  <WhiteSpace />
                  <CheckboxWrapper
                    checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                  >
                    <CustomCheckbox
                      onChange={handleModalAgeRuleCheckboxCheck}
                      checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                      name={AGE_RULES_CHECKBOXES.moreThan}
                    />
                  </CheckboxWrapper>
                  <AgeRuleNameButton
                    type="button"
                    grayed={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                    onClick={() =>
                      handleModalAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.moreThan)
                    }
                  >
                    {t('more_than')}
                  </AgeRuleNameButton>
                  <AgeRuleInput
                    disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                    label={t('age')}
                    placeholder={String(MIN_AGE)}
                    defaultValue={
                      defaultAgeCalculatorValues[FORM_NAMES.moreThanAge] || ''
                    }
                    error={errors[FORM_NAMES.moreThanAge]?.message}
                    onChange={(e: InputEventType) => {
                      const value = e.target.value;
                      moreThanAgeOnChange(e);
                      validateSelf(e);

                      if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
                        setValue(FORM_NAMES.betweenHighAge, value);
                      }

                      trigger([
                        FORM_NAMES.lessThanAge,
                        FORM_NAMES.betweenLowAge,
                        FORM_NAMES.betweenHighAge,
                      ]);
                    }}
                    type="number"
                    inputMode="numeric"
                    {...moreThanAgeRegister}
                  />
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                      label={t('high_season_price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.moreThanHighSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.moreThanHighSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        moreThanHighSeasonAmountOnChange(e);
                        validateSelf(e);
                      }}
                      {...moreThanHighSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                      label={t('low_season_price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.moreThanLowSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.moreThanLowSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        validateSelf(e);
                        moreThanLowSeasonAmountOnChange(e);
                      }}
                      {...moreThanLowSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <WhiteSpace />
                </ModalAgeRuleRow>
              </ModalAgeRulesContainer>
            }
            ageCalculatorWithoutSeasons={
              <ModalAgeRulesContainer>
                <ModalAgeRuleRow
                  active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                >
                  <WhiteSpace />
                  <CheckboxWrapper
                    checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                  >
                    <CustomCheckbox
                      onChange={handleModalAgeRuleCheckboxCheck}
                      checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                      name={AGE_RULES_CHECKBOXES.lessThan}
                    />
                  </CheckboxWrapper>
                  <AgeRuleNameButton
                    type="button"
                    grayed={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                    onClick={() =>
                      handleModalAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.lessThan)
                    }
                  >
                    {t('less_than')}
                  </AgeRuleNameButton>
                  <AgeRuleInput
                    disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                    label={t('age')}
                    placeholder={String(MIN_AGE)}
                    defaultValue={
                      defaultAgeCalculatorValues[FORM_NAMES.lessThanAge] || ''
                    }
                    error={errors[FORM_NAMES.lessThanAge]?.message}
                    type="number"
                    inputMode="numeric"
                    onChange={(e: InputEventType) => {
                      const value = e.target.value;
                      lessThanAgeOnChange(e);
                      validateSelf(e);

                      if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
                        setValue(FORM_NAMES.betweenLowAge, value);
                      }

                      trigger([
                        FORM_NAMES.betweenLowAge,
                        FORM_NAMES.moreThanAge,
                        FORM_NAMES.betweenHighAge,
                      ]);
                    }}
                    {...lessThanAgeRegister}
                  />
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                      label={t('price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.lessThanHighSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.lessThanHighSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        validateSelf(e);
                        lessThanHighSeasonAmountOnChange(e);
                      }}
                      {...lessThanHighSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <WhiteSpace />
                </ModalAgeRuleRow>
                <ModalAgeRuleRow
                  active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                >
                  <WhiteSpace />
                  <CheckboxWrapper
                    checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                  >
                    <CustomCheckbox
                      onChange={handleModalAgeRuleCheckboxCheck}
                      checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      name={AGE_RULES_CHECKBOXES.between}
                    />
                  </CheckboxWrapper>
                  <AgeRuleNameButton
                    type="button"
                    grayed={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                    onClick={() =>
                      handleModalAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.between)
                    }
                  >
                    {t('between')}
                  </AgeRuleNameButton>
                  <BetweenAgesWrapper>
                    <AgeRuleInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      label={t('age')}
                      placeholder={String(MIN_AGE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.betweenLowAge] || ''
                      }
                      error={errors[FORM_NAMES.betweenLowAge]?.message}
                      type="number"
                      inputMode="numeric"
                      onChange={(e: InputEventType) => {
                        const value = e.target.value;
                        betweenLowAgeOnChange(e);
                        validateSelf(e);

                        if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]) {
                          setValue(FORM_NAMES.lessThanAge, value);
                        }

                        trigger([
                          FORM_NAMES.lessThanAge,
                          FORM_NAMES.moreThanAge,
                          FORM_NAMES.betweenHighAge,
                        ]);
                      }}
                      {...betweenLowAgeRegister}
                    />
                    <BetweenAgesText
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                    >
                      {t('and').toLowerCase()}
                    </BetweenAgesText>
                    <AgeRuleInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      label={t('age')}
                      placeholder={String(MIN_AGE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.betweenHighAge] || ''
                      }
                      error={errors[FORM_NAMES.betweenHighAge]?.message}
                      type="number"
                      inputMode="numeric"
                      onChange={(e: InputEventType) => {
                        const value = e.target.value;
                        betweenHighAgeOnChange(e);
                        validateSelf(e);

                        if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.lessThan]) {
                          setValue(FORM_NAMES.moreThanAge, value);
                        }

                        trigger([
                          FORM_NAMES.moreThanAge,
                          FORM_NAMES.lessThanAge,
                          FORM_NAMES.betweenLowAge,
                        ]);
                      }}
                      {...betweenHighAgeRegister}
                    />
                  </BetweenAgesWrapper>
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                      label={t('price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.betweenHighSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.betweenHighSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        validateSelf(e);
                        betweenHighSeasonAmountOnChange(e);
                      }}
                      {...betweenHighSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <div />
                  <WhiteSpace />
                </ModalAgeRuleRow>
                <ModalAgeRuleRow
                  active={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                >
                  <WhiteSpace />
                  <CheckboxWrapper
                    checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                  >
                    <CustomCheckbox
                      onChange={handleModalAgeRuleCheckboxCheck}
                      checked={ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                      name={AGE_RULES_CHECKBOXES.moreThan}
                    />
                  </CheckboxWrapper>
                  <AgeRuleNameButton
                    type="button"
                    grayed={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                    onClick={() =>
                      handleModalAgeRuleCheckboxCheck(AGE_RULES_CHECKBOXES.moreThan)
                    }
                  >
                    {t('more_than')}
                  </AgeRuleNameButton>
                  <AgeRuleInput
                    disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                    label={t('age')}
                    placeholder={String(MIN_AGE)}
                    defaultValue={
                      defaultAgeCalculatorValues[FORM_NAMES.moreThanAge] || ''
                    }
                    error={errors[FORM_NAMES.moreThanAge]?.message}
                    type="number"
                    inputMode="numeric"
                    onChange={(e: InputEventType) => {
                      const value = e.target.value;
                      validateSelf(e);
                      moreThanAgeOnChange(e);

                      if (ageRulesCheckboxes[AGE_RULES_CHECKBOXES.between]) {
                        setValue(FORM_NAMES.betweenHighAge, value);
                      }

                      trigger([
                        FORM_NAMES.lessThanAge,
                        FORM_NAMES.betweenLowAge,
                        FORM_NAMES.betweenHighAge,
                      ]);
                    }}
                    {...moreThanAgeRegister}
                  />
                  <RelativeWrapper>
                    <AgeRuleSeasonInput
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                      label={t('price')}
                      placeholder={String(MIN_PRICE)}
                      defaultValue={
                        defaultAgeCalculatorValues[FORM_NAMES.moreThanHighSeasonAmount] ||
                        MIN_PRICE
                      }
                      error={errors[FORM_NAMES.moreThanHighSeasonAmount]?.message}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      onChange={(e) => {
                        validateSelf(e);
                        moreThanHighSeasonAmountOnChange(e);
                      }}
                      {...moreThanHighSeasonAmountRegister}
                    />
                    <AgeRuleSeasonInputSideLabel
                      disabled={!ageRulesCheckboxes[AGE_RULES_CHECKBOXES.moreThan]}
                    >
                      {isBookingPercentagePrice
                        ? `% /${t('booking_price').toLowerCase()}`
                        : `${paymentSettingsCurrencyLabel} /${t('night').toLowerCase()}`}
                    </AgeRuleSeasonInputSideLabel>
                  </RelativeWrapper>
                  <div />
                  <WhiteSpace />
                </ModalAgeRuleRow>
              </ModalAgeRulesContainer>
            }
          />
        )}
        <SubscriptionModal
          open={isSubscriptionModalOpen}
          onClose={closeSubscriptionModal}
          setSectionTouched={setSectionTouched}
          setIsSectionActive={toggleIsSectionActive}
          onUpgradeToPremium={closeSubscriptionModal}
          subscriptionProductType={SUBSCRIPTION_PRODUCT_TYPES.tax}
          subtitle={
            <Trans i18nKey="tourist_taxes_premium_feature_subtitle">
              <div>
                <strong>Tourist Taxes</strong> is a premium feature that allows you to
                charge your guest with a tourist tax rate as per your local regulations.
                This feature enables an extra step on the online check-in process for the
                guest to calculate the taxes and proceed to the payment. The subscription
                is additional to your basic plan.
              </div>
              <p>
                <a href={t('tourist_taxes_link')} target="_blank" rel="noreferrer">
                  Learn more
                </a>{' '}
                about how to set up the Tourist taxes.
              </p>
            </Trans>
          }
        />
      </Section>
    );
  },
);

HousingTaxesSection.defaultProps = defaultProps;
export {HousingTaxesSection};
