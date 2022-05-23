import React from 'react';
import i18n from 'i18next';
import {useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import api from '../../../api';
import {useModalControls} from 'utils/hooks';
import {SelectOption} from '../../../utils/types';
import {
  calcNetFeeWithCommissions,
  checkTemplateIsWaivo,
  EXTRA_PRICE_FORM_NAMES,
  FORM_NAMES,
  OFFER_CONFIRM_TYPE_OPTIONS,
  OfferTemplate,
  WAIVO_NET_FEE,
  WAIVO_REVENUE_HOST_MINIMUM,
} from '../../../utils/upselling';
import {FormTypes} from '../OfferDetails/types';
import {Supplier} from '../../../utils/upselling/types';
import Section from '../Section';
import Select from '../Select';
import {InputController} from '../Input';
import SupplierDetailsModal from '../SupplierDetailsModal';
import OfferDescriptionModal from './OfferDescriptionModal';
import {
  ButtonActivateModal,
  OfferInfoGridLayout,
  SupplierLabel,
  TitleLink,
  TypeContainerWrapper,
} from './styled';

const minPrice = 1;
const maxPrice = 10000;
const maxDescriptionLength = 512;
const maxTitleLength = 128;
const addSupplierSelectOption: SelectOption = {
  value: 'add_supplier',
  label: i18n.t('add_supplier'),
};

const TypeContainer = ({type, description}: {type: string; description: string}) => {
  return (
    <TypeContainerWrapper>
      <b>{type}</b>: <span>{description}</span>
    </TypeContainerWrapper>
  );
};

const ConfirmationTypeTooltip = () => {
  const {t} = useTranslation();

  return (
    <>
      {t('deal_confirmation_type_tooltip_title')}
      <TypeContainer
        type={t('auto')}
        description={t('deal_confirmation_type_tooltip_auto')}
      />
      <TypeContainer
        type={t('manual')}
        description={t('deal_confirmation_type_tooltip_manual')}
      />
    </>
  );
};

type OfferInformationSectionProps = {
  disabled: boolean;
  suppliersOptions: SelectOption[];
  offerTemplate: OfferTemplate;
  openWaivoCompanyRegistrationModal?: () => void;
  hasBusinessInformation?: boolean;
};

function OfferInformationSection({
  disabled,
  suppliersOptions,
  offerTemplate,
  openWaivoCompanyRegistrationModal,
  hasBusinessInformation,
}: OfferInformationSectionProps) {
  const {t} = useTranslation();
  const {
    register,
    control,
    setValue,
    trigger,
    formState: {errors},
  } = useFormContext<FormTypes>();
  const isWaivoTemplate = checkTemplateIsWaivo(offerTemplate.value);

  const {
    isOpen: isSupplierDetailsModalOpen,
    openModal: openSupplierDetailsModal,
    closeModal: closeSupplierDetailsModal,
  } = useModalControls();
  const {
    isOpen: isOfferDescriptionModalOpen,
    openModal: openOfferDescriptionModal,
    closeModal: closeOfferDescriptionModal,
  } = useModalControls();

  const {data: waivoTermsLink} = useQuery<{link: string}>(
    api.documents.ENDPOINTS.waivoTermsPdf(),
    {
      enabled: isWaivoTemplate,
      refetchOnWindowFocus: false,
    },
  );

  const closeSupplierModalAndSelectNewSupplier = (newSupplier?: Supplier) => {
    if (newSupplier?.id && newSupplier?.name) {
      setValue(FORM_NAMES.supplier, {label: newSupplier.name, value: newSupplier.id});
    }
    closeSupplierDetailsModal();
  };

  const handleSupplierChange = (onChange: (a: SelectOption) => void) => (
    e: SelectOption,
  ) => {
    if (e.value === addSupplierSelectOption.value) {
      openSupplierDetailsModal();
      // After "Add supplier" selected - change selected item to the first supplier
      setValue(FORM_NAMES.supplier, suppliersOptions[0]);
    } else {
      onChange(e);
    }
  };

  const calculateFeeToGuest = React.useCallback(
    (value: number) => {
      const netFeeWithoutCommissions = WAIVO_NET_FEE[offerTemplate.value] || 0;
      const netFee =
        calcNetFeeWithCommissions(netFeeWithoutCommissions) - WAIVO_REVENUE_HOST_MINIMUM;
      if (value) {
        const amount = value + netFee;
        const newValue = (amount < 0 ? 0 : amount).toFixed(2);
        setValue(EXTRA_PRICE_FORM_NAMES.feeToGuest, newValue, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [offerTemplate.value, setValue],
  );

  const handleChangePricesForWaivo = (
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isWaivoTemplate) {
      calculateFeeToGuest(Number(e.target.value));
    }
    onChange(e);
    trigger(EXTRA_PRICE_FORM_NAMES.revenueToHost);
  };

  const templateFields = offerTemplate.fields;

  const Subtitle = () => {
    const subtitleText =
      offerTemplate?.templateDescription?.text || t('deal_information_subtitle');

    return (
      <>
        {subtitleText}{' '}
        {isWaivoTemplate && (
          <ButtonActivateModal
            label={t('learn_more')}
            onClick={openOfferDescriptionModal}
            link
          />
        )}
      </>
    );
  };

  return (
    <Section
      title={
        <>
          {t('deal_information')}{' '}
          {isWaivoTemplate && (
            <TitleLink
              label={i18n.t('waivo_damage_protection_tc')}
              to={waivoTermsLink?.link}
            />
          )}
        </>
      }
      subtitle={<Subtitle />}
    >
      <OfferInfoGridLayout>
        {(!offerTemplate || templateFields?.[FORM_NAMES.title]) && (
          <InputController
            disabled={disabled}
            label={t('title')}
            placeholder={t('enter_name')}
            readOnly={templateFields?.[FORM_NAMES.title]?.readonly}
            error={errors[FORM_NAMES.title]?.message}
            {...register(FORM_NAMES.title, {
              required:
                templateFields?.[FORM_NAMES.title]?.required ?? t<string>('required'),
              maxLength: {
                value: maxTitleLength,
                message: t('max_length', {length: maxTitleLength}),
              },
            })}
            control={control}
          />
        )}
        {(!offerTemplate || templateFields?.[FORM_NAMES.highlight]) && (
          <InputController
            disabled={disabled}
            label={t('highlight')}
            placeholder={t('enter_highlight')}
            readOnly={templateFields?.[FORM_NAMES.highlight]?.readonly}
            error={errors[FORM_NAMES.highlight]?.message}
            {...register(FORM_NAMES.highlight, {
              required:
                templateFields?.[FORM_NAMES.highlight]?.required ?? t<string>('required'),
            })}
            control={control}
          />
        )}
        {(!offerTemplate || templateFields?.[FORM_NAMES.description]) && (
          <InputController
            disabled={disabled}
            label={t('description')}
            placeholder={t('enter_description')}
            readOnly={templateFields?.[FORM_NAMES.description]?.readonly}
            error={errors[FORM_NAMES.description]?.message}
            {...register(FORM_NAMES.description, {
              required:
                templateFields?.[FORM_NAMES.description]?.required ??
                t<string>('required'),
              maxLength: {
                value: maxDescriptionLength,
                message: t('max_length', {length: maxDescriptionLength}),
              },
            })}
            control={control}
          />
        )}
        {(!offerTemplate || templateFields?.[EXTRA_PRICE_FORM_NAMES.revenueToHost]) && (
          <Controller
            name={EXTRA_PRICE_FORM_NAMES.revenueToHost}
            render={({field: {onChange, ...restField}, fieldState: {error}}) => {
              return (
                <InputController
                  control={control}
                  disabled={disabled}
                  label={t('revenue_to_host')}
                  readOnly={
                    templateFields?.[EXTRA_PRICE_FORM_NAMES.revenueToHost]?.readonly
                  }
                  placeholder={t('enter_revenue_to_host')}
                  inputMode="numeric"
                  type="number"
                  step="0.01"
                  error={error?.message}
                  onChange={handleChangePricesForWaivo(onChange)}
                  {...restField}
                />
              );
            }}
            rules={{
              required:
                templateFields?.[EXTRA_PRICE_FORM_NAMES.revenueToHost]?.required ??
                t<string>('required'),
              min: {
                value:
                  templateFields?.[EXTRA_PRICE_FORM_NAMES.revenueToHost]?.min || minPrice,
                message: t('min_number_is', {
                  number: templateFields?.[EXTRA_PRICE_FORM_NAMES.revenueToHost]?.min,
                }),
              },
              max: {
                value:
                  templateFields?.[EXTRA_PRICE_FORM_NAMES.revenueToHost]?.max || maxPrice,
                message: t('max_number_is', {
                  number: templateFields?.[EXTRA_PRICE_FORM_NAMES.revenueToHost]?.max,
                }),
              },
            }}
          />
        )}
        {(!offerTemplate || templateFields?.[FORM_NAMES.supplier]) && (
          <Controller
            render={({field: {onChange, ...restField}, fieldState: {error}}) => {
              return (
                <Select
                  disabled={disabled}
                  label={
                    <SupplierLabel>
                      <div>{t('supplier')}</div>
                      {isWaivoTemplate && !hasBusinessInformation && (
                        <ButtonActivateModal
                          label={t('add_business_information')}
                          onClick={openWaivoCompanyRegistrationModal}
                          link
                        />
                      )}
                    </SupplierLabel>
                  }
                  placeholder={t('select_supplier')}
                  readOnly={templateFields?.[FORM_NAMES.supplier]?.readonly}
                  error={error?.message}
                  options={[addSupplierSelectOption, ...suppliersOptions]}
                  onChange={handleSupplierChange(onChange)}
                  defaultInputValue={suppliersOptions[0]?.value}
                  {...restField}
                />
              );
            }}
            name={FORM_NAMES.supplier}
            rules={{
              required:
                templateFields?.[FORM_NAMES.supplier]?.required ?? t<string>('required'),
            }}
          />
        )}
        {(!offerTemplate || templateFields?.[FORM_NAMES.confirmation_type]) && (
          <Controller
            render={({field, fieldState: {error}}) => {
              return (
                <Select
                  disabled={disabled}
                  label={t('confirmation_type')}
                  tooltip={<ConfirmationTypeTooltip />}
                  placeholder={t('select_confirmation_type')}
                  readOnly={templateFields?.[FORM_NAMES.confirmation_type]?.readonly}
                  error={error?.message}
                  options={Object.values(OFFER_CONFIRM_TYPE_OPTIONS)}
                  {...field}
                />
              );
            }}
            name={FORM_NAMES.confirmation_type}
            rules={{
              required:
                templateFields?.[FORM_NAMES.confirmation_type]?.required ??
                t<string>('required'),
            }}
          />
        )}
        {(!offerTemplate || templateFields?.[FORM_NAMES.category]) && (
          <Controller
            render={({field, fieldState: {error}}) => {
              return (
                <Select
                  disabled={disabled}
                  label={t('category')}
                  placeholder={t('select_category')}
                  readOnly={templateFields?.[FORM_NAMES.category]?.readonly}
                  error={error?.message}
                  options={offerTemplate?.categories}
                  {...field}
                />
              );
            }}
            name={FORM_NAMES.category}
            rules={{
              required:
                templateFields?.[FORM_NAMES.category]?.required ?? t<string>('required'),
            }}
          />
        )}
        {(!offerTemplate || templateFields?.[EXTRA_PRICE_FORM_NAMES.feeToGuest]) && (
          <Controller
            name={EXTRA_PRICE_FORM_NAMES.feeToGuest}
            render={({field, fieldState: {error}}) => {
              return (
                <InputController
                  disabled={disabled}
                  control={control}
                  label={t('fee_to_guest')}
                  readOnly={templateFields?.[EXTRA_PRICE_FORM_NAMES.feeToGuest]?.readonly}
                  placeholder={t('--')}
                  inputMode="numeric"
                  type="number"
                  step="0.01"
                  error={error?.message}
                  {...field}
                />
              );
            }}
          />
        )}
      </OfferInfoGridLayout>
      {isSupplierDetailsModalOpen && (
        <SupplierDetailsModal open onClose={closeSupplierModalAndSelectNewSupplier} />
      )}
      <OfferDescriptionModal
        open={isOfferDescriptionModalOpen}
        onClose={closeOfferDescriptionModal}
      />
    </Section>
  );
}

export {OfferInformationSection};
