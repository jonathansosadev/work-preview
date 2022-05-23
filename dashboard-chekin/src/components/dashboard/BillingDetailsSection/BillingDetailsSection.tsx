import React from 'react';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';
import {useQueryClient, useQuery} from 'react-query';
import {useForm, Controller} from 'react-hook-form';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {
  addSupportEmailToMessage,
  getRequiredOrOptionalFieldLabel,
  toastResponseError,
} from '../../../utils/common';
import {useCountriesOptions} from '../../../hooks/useCountriesOptions';
import {useErrorToast, useIsMounted} from '../../../utils/hooks';
import {COUNTRY_CODES, DIVISION_LVL_1_COUNTRIES} from '../../../utils/constants';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import {
  BillingDetails,
  District,
  Province,
  SelectOption,
  TaxId,
} from '../../../utils/types';
import Select from '../Select';
import Button from '../ButtonBilling';
import Section from '../Section';
import Loader from '../../common/Loader';
import {InputController} from '../Input';
import {
  FormWrapper,
  FormPartWrapper,
  FormItemWrapper,
  FormTextInfo,
  Form,
  CityFormItemWrapper,
  SubmitButtonWrapper,
  ButtonLabelText,
  ButtonLabelWrapper,
  LoaderWrapper,
} from './styled';

const PROVINCES_CACHE_TIME_MIN = 60;
const PROVINCES_STALE_TIME_MIN = 30;

const TAX_TYPE = 'eu_vat';

export const TAX_COUNTRIES = [
  {value: COUNTRY_CODES.spain, label: i18n.t('sp_vat')},
  {value: COUNTRY_CODES.italy, label: i18n.t('it_vat')},
  {value: COUNTRY_CODES.portugal, label: i18n.t('pt_vat')},
  {value: COUNTRY_CODES.germany, label: i18n.t('de_vat')},
];

const TAX_REGEX_VALUES: {[index: string]: any} = {
  ES: /[0-9A-Z][0-9]{7}[0-9A-Z]/,
  PT: /[0-9]{9}/,
  IT: /[0-9]{11}/,
  DE: /[0-9]{9}/,
};

const DIVISION_LVL_1_PROVINCE_COUNTRIES = [
  COUNTRY_CODES.uae,
  COUNTRY_CODES.romania,
  COUNTRY_CODES.portugal,
  COUNTRY_CODES.colombia,
  COUNTRY_CODES.hungary,
];

function fetchBillingDetails() {
  return queryFetcher(api.payments.ENDPOINTS.billingDetails());
}

function fetchProvinces({queryKey: [, country = '']}) {
  return queryFetcher(api.locations.ENDPOINTS.all(`country=${country}&ordering=name`));
}

function getProvincesAsOptions(provinces: any, country = '') {
  if (!provinces?.results) {
    return [];
  }

  if (DIVISION_LVL_1_PROVINCE_COUNTRIES.includes(country)) {
    return provinces?.results?.map((c: District) => {
      return {
        label: c?.division_level_1?.name,
        value: c?.division_level_1?.code,
      };
    });
  }

  return provinces?.results?.map((c: Province) => {
    return {
      label: c?.division_level_2?.name,
      value: c?.division_level_2?.code,
    };
  });
}

function getCountryCode(billing?: BillingDetails | null): string {
  return billing?.address?.country || '';
}

function getProvinceCode(billing?: BillingDetails | null) {
  const countryCode = getCountryCode(billing);

  if (DIVISION_LVL_1_COUNTRIES.includes(countryCode)) {
    return billing?.address?.state;
  }
  return billing?.address?.state;
}

function getInitTaxIdOption(taxId: TaxId) {
  return TAX_COUNTRIES.find((option) => {
    return option?.value === taxId?.country;
  });
}

function getInitTaxValue(taxId: TaxId) {
  if (!taxId) {
    return '';
  }
  return taxId.value.slice(2);
}

function getInitCountryOption(countryCode: string, countries: SelectOption[]) {
  if (!countries) {
    return undefined;
  }

  return countries.find((option) => {
    return option.value === countryCode;
  });
}

export enum FORM_NAMES {
  name = 'name',
  country = 'country',
  city = 'city',
  address_line_1 = 'address_line_1',
  address_line_2 = 'address_line_2',
  postal_code = 'postal_code',
  state = 'state',
  tax_id = 'tax_id',
  tax_value = 'tax_value',
}

type FormTypes = {
  [FORM_NAMES.name]: string;
  [FORM_NAMES.country]: SelectOption;
  [FORM_NAMES.state]: SelectOption;
  [FORM_NAMES.city]: string;
  [FORM_NAMES.address_line_1]: string;
  [FORM_NAMES.address_line_2]: string;
  [FORM_NAMES.tax_id]: SelectOption;
  [FORM_NAMES.tax_value]: string;
  [FORM_NAMES.postal_code]: string;
};

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.name]: true,
  [FORM_NAMES.country]: true,
  [FORM_NAMES.state]: false,
  [FORM_NAMES.city]: true,
  [FORM_NAMES.address_line_1]: true,
  [FORM_NAMES.address_line_2]: true,
  [FORM_NAMES.tax_id]: true,
  [FORM_NAMES.tax_value]: true,
  [FORM_NAMES.postal_code]: true,
};

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.name]: i18n.t('required') as string,
  [FORM_NAMES.country]: i18n.t('required') as string,
  [FORM_NAMES.state]: false,
  [FORM_NAMES.city]: false,
  [FORM_NAMES.address_line_1]: i18n.t('required') as string,
  [FORM_NAMES.address_line_2]: false,
  [FORM_NAMES.tax_id]: i18n.t('required') as string,
  [FORM_NAMES.tax_value]: i18n.t('required') as string,
  [FORM_NAMES.postal_code]: false,
};

function getDisplayFields(country: string) {
  switch (country) {
    case COUNTRY_CODES.italy:
    case COUNTRY_CODES.portugal:
    case COUNTRY_CODES.romania:
    case COUNTRY_CODES.spain:
    case COUNTRY_CODES.uae:
    case COUNTRY_CODES.colombia:
    case COUNTRY_CODES.hungary: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.state]: true,
      };
    }
    default: {
      return INIT_DISPLAY_FIELDS;
    }
  }
}

function getFields(country: string) {
  return {
    display: getDisplayFields(country),
    required: INIT_REQUIRED_FIELDS,
  };
}

function BillingDetailsSection() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const ws = useWebsocket();
  const isMounted = useIsMounted();
  const {register, control, formState, trigger, setValue, watch, handleSubmit} = useForm<
    FormTypes
  >({
    shouldUnregister: true,
  });

  const {errors} = formState;

  const country = watch(FORM_NAMES.country)?.value;
  const taxId = watch(FORM_NAMES.tax_id)?.value;
  const taxValue = watch(FORM_NAMES.tax_value);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isCountryPreloaded, setIsCountryPreloaded] = React.useState(false);
  const [isProvincePreloaded, setIsProvincePreloaded] = React.useState(false);
  const [fields, setFields] = React.useState(() => {
    return getFields(country);
  });

  const {
    data: fetchedBillingDetails,
    error: fetchedBillingDetailsError,
    status,
  } = useQuery('billingDetails', fetchBillingDetails, {
    refetchOnWindowFocus: false,
  });
  useErrorToast(fetchedBillingDetailsError, {
    notFoundMessage: t('errors.requested_billing_details_not_found'),
  });

  const isLoading = status === 'loading';

  const billing = React.useMemo(() => {
    return fetchedBillingDetails;
  }, [fetchedBillingDetails]);

  const {data: provinces, error} = useQuery(['provinces', country], fetchProvinces, {
    refetchOnWindowFocus: false,
    cacheTime: 1000 * 60 * PROVINCES_CACHE_TIME_MIN,
    staleTime: 1000 * 60 * PROVINCES_STALE_TIME_MIN,
  });
  useErrorToast(error, {
    notFoundMessage: t('errors.requested_provinces_not_found'),
  });

  const {countriesOptions} = useCountriesOptions({});

  React.useEffect(
    function handleDisplayFields() {
      const nextFields = getFields(country);
      setFields(nextFields);
    },
    [country],
  );

  React.useEffect(
    function preloadFormData() {
      if (!billing) {
        return;
      }

      const countryCode = getCountryCode(billing);
      const formData = [
        {name: FORM_NAMES.name, value: billing?.name},
        {name: FORM_NAMES.address_line_1, value: billing?.address?.line1},
        {name: FORM_NAMES.address_line_2, value: billing?.address?.line2},
        {name: FORM_NAMES.postal_code, value: billing?.address?.postal_code},
        {name: FORM_NAMES.city, value: billing?.address?.city},
        {name: FORM_NAMES.tax_value, value: getInitTaxValue(billing?.tax_id)},
        {name: FORM_NAMES.tax_id, value: getInitTaxIdOption(billing?.tax_id)},
        {
          name: FORM_NAMES.country,
          value: getInitCountryOption(countryCode, countriesOptions),
        },
      ];
      formData.forEach(({name, value}) => {
        setValue(name, value);
      });
      setIsCountryPreloaded(true);
    },
    [countriesOptions, billing, setValue],
  );

  React.useEffect(
    function preloadProvince() {
      const canPreloadProvince =
        !isProvincePreloaded && isCountryPreloaded && provinces && billing;

      if (canPreloadProvince) {
        const nextProvince = getProvincesAsOptions(provinces).find(
          (option: SelectOption) => {
            return option.value === getProvinceCode(billing);
          },
        );

        setValue(FORM_NAMES.state, nextProvince);
        setIsProvincePreloaded(true);
      }
    },
    [billing, isCountryPreloaded, isProvincePreloaded, provinces, setValue],
  );

  React.useEffect(() => {
    if (ws.message?.event_type === WS_EVENT_TYPES.subscriptionUpdated) {
      queryClient.refetchQueries('billingDetails');
    }

    return () => ws.clearMessage();
  }, [ws, queryClient]);

  React.useEffect(() => {
    if (formState.isSubmitted) {
      trigger();
    }
  }, [fields, formState.isSubmitted, trigger]);

  const getIsTaxValueValid = () => {
    if (!taxId || !taxValue) {
      return true;
    }
    return Boolean(taxValue.toUpperCase().match(TAX_REGEX_VALUES[taxId]));
  };

  const getPayload = (formData: FormTypes) => {
    const taxIdPayload =
      taxId && taxValue
        ? {
            type: TAX_TYPE,
            value: `${(formData[FORM_NAMES.tax_id] as SelectOption)?.value}${(formData[
              FORM_NAMES.tax_value
            ] as string).toUpperCase()}`,
          }
        : null;

    return {
      name: formData[FORM_NAMES.name],
      address: {
        line1: formData[FORM_NAMES.address_line_1] || '',
        line2: formData[FORM_NAMES.address_line_2] || '',
        country: country || undefined,
        city: formData[FORM_NAMES.city] || '',
        postal_code: formData[FORM_NAMES.postal_code],
        state: (formData[FORM_NAMES.state] as SelectOption)?.value,
      },
      tax_id: taxIdPayload,
    };
  };

  const onSubmit = async (formData: FormTypes) => {
    if (!getIsTaxValueValid()) {
      toast.error(addSupportEmailToMessage(t('errors.invalid_tax_value')));
      return;
    }

    const payload = getPayload(formData);

    setIsUpdating(true);
    const {data, error} = await api.payments.patchBillingDetails(payload);

    if (!isMounted.current) {
      return;
    }

    if (data) {
      await queryClient.refetchQueries('billingDetails');
      toast.success(t('billing_details_updated'));
    }
    if (error) {
      toastResponseError(error);
    }

    setIsUpdating(false);
  };

  return (
    <Section title={t('billing_details')}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormWrapper>
          <FormPartWrapper>
            <FormItemWrapper>
              <FormTextInfo>{t('tax_id')}</FormTextInfo>
            </FormItemWrapper>
            <FormItemWrapper>
              <InputController
                {...register(FORM_NAMES.name, {
                  required: fields.required[FORM_NAMES.name],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('commercial_name'),
                  fields.required[FORM_NAMES.name],
                )}
                error={errors[FORM_NAMES.name]?.message}
                placeholder={t('enter_name')}
              />
            </FormItemWrapper>
            <FormItemWrapper>
              <Controller
                control={control}
                name={FORM_NAMES.tax_id}
                rules={{
                  required: fields.required[FORM_NAMES.tax_id],
                }}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={getRequiredOrOptionalFieldLabel(
                        t('id_type'),
                        fields.required[FORM_NAMES.tax_id],
                      )}
                      options={TAX_COUNTRIES}
                      placeholder={t('enter_type')}
                      error={error?.message}
                      {...field}
                    />
                  );
                }}
              />
            </FormItemWrapper>
            <FormItemWrapper>
              <InputController
                {...register(FORM_NAMES.tax_value, {
                  required: fields.required[FORM_NAMES.name],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('fiscal_code_billing'),
                  fields.required[FORM_NAMES.tax_value],
                )}
                error={errors[FORM_NAMES.tax_value]?.message}
                placeholder={t('enter_code')}
              />
            </FormItemWrapper>
          </FormPartWrapper>
          <FormPartWrapper>
            <FormItemWrapper>
              <FormTextInfo>{t('invoicing_address')}</FormTextInfo>
            </FormItemWrapper>
            <FormItemWrapper>
              <Controller
                control={control}
                name={FORM_NAMES.country}
                rules={{required: fields.required[FORM_NAMES.country]}}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={getRequiredOrOptionalFieldLabel(
                        t('country'),
                        fields.required[FORM_NAMES.country],
                      )}
                      options={countriesOptions}
                      placeholder={t('enter_country')}
                      error={error?.message}
                      {...field}
                    />
                  );
                }}
              />
            </FormItemWrapper>
            <FormItemWrapper>
              <InputController
                {...register(FORM_NAMES.address_line_1, {
                  required: fields.required[FORM_NAMES.address_line_1],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('street_1'),
                  fields.required[FORM_NAMES.address_line_1],
                )}
                error={errors[FORM_NAMES.address_line_1]?.message}
                placeholder={t('enter_street')}
              />
            </FormItemWrapper>
            <FormItemWrapper>
              <InputController
                {...register(FORM_NAMES.address_line_2, {
                  required: fields.required[FORM_NAMES.address_line_2],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('street_2'),
                  fields.required[FORM_NAMES.address_line_2],
                )}
                error={errors[FORM_NAMES.address_line_2]?.message}
                placeholder={t('enter_street')}
              />
            </FormItemWrapper>
          </FormPartWrapper>
          <FormPartWrapper>
            <FormItemWrapper>
              <CityFormItemWrapper>
                <InputController
                  {...register(FORM_NAMES.city, {
                    required: fields.required[FORM_NAMES.city],
                  })}
                  control={control}
                  label={getRequiredOrOptionalFieldLabel(
                    t('city'),
                    fields.required[FORM_NAMES.city],
                  )}
                  error={errors[FORM_NAMES.city]?.message}
                  placeholder={t('enter_city')}
                />
              </CityFormItemWrapper>
            </FormItemWrapper>
            <FormItemWrapper>
              <Controller
                control={control}
                name={FORM_NAMES.state}
                rules={{required: fields.required[FORM_NAMES.state]}}
                render={({field, fieldState: {error}}) => (
                  <Select
                    label={getRequiredOrOptionalFieldLabel(
                      t('province'),
                      fields.required[FORM_NAMES.state],
                    )}
                    options={getProvincesAsOptions(provinces, country)}
                    error={error?.message}
                    placeholder={t('enter_province')}
                    {...field}
                  />
                )}
              />
            </FormItemWrapper>
            <FormItemWrapper>
              <InputController
                {...register(FORM_NAMES.postal_code, {
                  required: fields.required[FORM_NAMES.postal_code],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('postal_code'),
                  fields.required[FORM_NAMES.postal_code],
                )}
                inputMode="numeric"
                error={errors[FORM_NAMES.postal_code]?.message}
                placeholder={t('enter_postal_code')}
              />
            </FormItemWrapper>
          </FormPartWrapper>
        </FormWrapper>
        {isLoading ? (
          <LoaderWrapper>
            <Loader width={30} height={30} />
          </LoaderWrapper>
        ) : (
          <SubmitButtonWrapper>
            <Button
              type="submit"
              disabled={isUpdating}
              label={
                <ButtonLabelWrapper>
                  <ButtonLabelText>{t('save_billing_info')}</ButtonLabelText>
                </ButtonLabelWrapper>
              }
            />
          </SubmitButtonWrapper>
        )}
      </Form>
    </Section>
  );
}

export {BillingDetailsSection};
