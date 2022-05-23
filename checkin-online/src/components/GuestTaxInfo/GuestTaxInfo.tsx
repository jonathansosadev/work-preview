import React from 'react';
import debounce from 'lodash.debounce';
import {useTranslation} from 'react-i18next';
import {Control, Controller} from 'react-hook-form';
import {SelectOptionType} from '../../utils/types';
import {useIsMounted, useStatus} from '../../utils/hooks';
import {EXEMPTIONS_IDS, NONE_EXEMPTION_OPTION} from '../../utils/constants';
import {usePaymentSettings} from '../../hooks/usePaymentSettings';
import Select from '../Select';
import {
  GuestBox,
  GuestName,
  GuestTax,
  SelectWrapper,
  ShortInput,
  GuestNumber,
} from './styled';

const DEBOUNCE_TIMEOUT_S = 1;
const MIN_AGE = 1;

function getIsAgeValid(age: string) {
  return age !== '' && Number(age) >= MIN_AGE;
}

enum LOADING_TARGETS {
  age,
  exemption,
}

type GuestTaxInfoProps = {
  item: any;
  index: number;
  register: any;
  getValues: any;
  displayError: (message?: any) => void;
  handleCalculateTaxes: () => void;
  errors: any;
  setGuestsTaxes: React.Dispatch<React.SetStateAction<{[key: number]: number}>>;
  setLoadingGuestsTaxes: React.Dispatch<React.SetStateAction<{[key: string]: boolean}>>;
  guestsTaxes: {[key: number]: number};
  isExemptionFieldLoading: boolean;
  hasSeasonExemptions: boolean;
  control: Control;
  availableTaxExemptions: SelectOptionType[];
  setValue: (name: string, value: SelectOptionType) => void;
  reservationId?: string;
  disabled?: boolean;
};

function GuestTaxInfo({
  item,
  index,
  register,
  reservationId,
  displayError,
  setGuestsTaxes,
  errors,
  guestsTaxes,
  availableTaxExemptions,
  control,
  isExemptionFieldLoading,
  hasSeasonExemptions,
  getValues,
  disabled,
  setLoadingGuestsTaxes,
  handleCalculateTaxes,
  setValue,
}: GuestTaxInfoProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {isLoading, setStatus} = useStatus();
  const [isAgeLoading, setIsAgeLoading] = React.useState(false);
  const [isExemptionLoading, setIsExemptionLoading] = React.useState(false);
  const {paymentSettingsCurrencySign} = usePaymentSettings();

  const guestNumber = index + 1 > 9 ? index + 1 : `0${index + 1}`;
  const ageName = `guests[${index}].age`;
  const exemptionName = `guests[${index}].exemption`;

  const startLoading = React.useCallback(
    (loadingTarget: LOADING_TARGETS) => {
      setStatus('loading');
      if (loadingTarget === LOADING_TARGETS.age) {
        setIsAgeLoading(true);
      }
      if (loadingTarget === LOADING_TARGETS.exemption) {
        setIsExemptionLoading(true);
      }
    },
    [setStatus],
  );

  const stopLoading = React.useCallback(
    (loadingTarget: LOADING_TARGETS) => {
      setStatus('idle');
      if (loadingTarget === LOADING_TARGETS.age) {
        setIsAgeLoading(false);
        if (!isExemptionLoading) {
          setLoadingGuestsTaxes(prevState => {
            return {
              ...prevState,
              [index]: false,
            };
          });
        }
      }

      if (loadingTarget === LOADING_TARGETS.exemption) {
        setIsExemptionLoading(false);
        if (!isAgeLoading) {
          setLoadingGuestsTaxes(prevState => {
            return {
              ...prevState,
              [index]: false,
            };
          });
        }
      }
    },
    [index, isAgeLoading, isExemptionLoading, setLoadingGuestsTaxes, setStatus],
  );

  const getGuestTaxCalculationPayload = React.useCallback(
    (age: string, exemption: string) => {
      return {
        reservation_id: reservationId,
        guest_list: [{age, exemption}],
        calculate_only: true,
      };
    },
    [reservationId],
  );

  const calculateGuestTax = React.useCallback(
    debounce(
      async (
        guestIndex: number,
        age = '0',
        exemption = NONE_EXEMPTION_OPTION.value,
        loadingTarget: LOADING_TARGETS,
      ) => {
        startLoading(loadingTarget);
        await handleCalculateTaxes();
        // const payload = getGuestTaxCalculationPayload(age, exemption);
        // const {data: tax, error} = await api.seasonGuests.post(payload);
        //
        if (!isMounted.current) {
          return;
        }

        stopLoading(loadingTarget);

        // if (error) {
        //   displayError(error);
        // }
        //
        // if (tax) {
        //   setGuestsTaxes(prevState => {
        //     return {
        //       ...prevState,
        //       [guestIndex]: tax?.amount,
        //     };
        //   });
        // }
      },
      DEBOUNCE_TIMEOUT_S * 1000,
    ),
    [
      displayError,
      getGuestTaxCalculationPayload,
      isMounted,
      isExemptionLoading,
      isAgeLoading,
    ],
  );

  const handlerChangingExemptions = React.useCallback(
    (age: string) => {
      const selectedExemptionValue = getValues()[exemptionName].value;
      availableTaxExemptions.forEach(exemption => {
        const exemptionValue = exemption.value;
        switch (exemptionValue) {
          case EXEMPTIONS_IDS.under18:
            if (Number(age) >= 18 && selectedExemptionValue === exemptionValue) {
              setValue(exemptionName, NONE_EXEMPTION_OPTION);
            } else if (Number(age) < 18) {
              setValue(exemptionName, exemption);
            }
            break;
          case EXEMPTIONS_IDS.under14:
            if (Number(age) >= 14 && selectedExemptionValue === exemptionValue) {
              setValue(exemptionName, NONE_EXEMPTION_OPTION);
            } else if (Number(age) < 14) {
              setValue(exemptionName, exemption);
            }
        }
      });
    },
    [availableTaxExemptions, setValue, exemptionName, getValues],
  );

  return (
    <GuestBox>
      <GuestName>
        {t('guest')} <GuestNumber>{guestNumber}</GuestNumber>
      </GuestName>
      <div>
        <ShortInput
          hideNumberButtons
          ref={register({
            required: t('required') as string,
            min: {
              value: MIN_AGE,
              message: t('min_number_is', {number: MIN_AGE}),
            },
          })}
          name={ageName}
          defaultValue={item.age}
          label={t('age')}
          placeholder={t('enter_age')}
          disabled={disabled || isLoading}
          error={errors?.guests?.[index]?.age?.message}
          onChange={event => {
            const {value} = event.target;
            handlerChangingExemptions(value);
            const exemption = getValues()[exemptionName];

            if (getIsAgeValid(value)) {
              setLoadingGuestsTaxes(prevState => {
                return {
                  ...prevState,
                  [index]: true,
                };
              });
              calculateGuestTax(index, value, exemption?.value, LOADING_TARGETS.age);
            }
          }}
          type="number"
        />
      </div>
      {hasSeasonExemptions && (
        <SelectWrapper>
          <Controller
            as={<Select />}
            openMenuOnFocus={false}
            loading={isExemptionFieldLoading}
            control={control}
            name={exemptionName}
            disabled={disabled || isLoading}
            defaultValue={item.exemption}
            label={t('exceptions')}
            options={availableTaxExemptions}
            error={errors?.guests?.[index]?.exemption?.message}
            rules={{required: t('required') as string}}
            onChange={([option]) => {
              const age = getValues()[ageName];

              if (getIsAgeValid(age)) {
                setLoadingGuestsTaxes(prevState => {
                  return {
                    ...prevState,
                    [index]: true,
                  };
                });
                calculateGuestTax(
                  index,
                  age,
                  option?.value as string,
                  LOADING_TARGETS.exemption,
                );
              }
              return option;
            }}
          />
        </SelectWrapper>
      )}
      <GuestTax>
        {guestsTaxes[index]?.toFixed(2) || '0.00'} {paymentSettingsCurrencySign}
      </GuestTax>
    </GuestBox>
  );
}

export {GuestTaxInfo};
