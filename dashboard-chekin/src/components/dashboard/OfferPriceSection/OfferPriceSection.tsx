import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFieldArray, useFormContext} from 'react-hook-form';
import {DAY_NAMES, DAY_TRANSLATIONS} from '../../../utils/constants';
import {PriceItemType} from './types';
import {SelectOption} from '../../../utils/types';
import {
  FORM_NAMES,
  PRICES_FIELD,
  PRICE_TYPES,
  PRICE_TYPE_OPTIONS,
} from '../../../utils/upselling';
import plusIcon from '../../../assets/plus-blue.svg';
import deleteIcon from '../../../assets/close-icon-gray.svg';
import Select from '../Select';
import Section from '../Section';
import {
  DayController,
  ItemNameController,
  PriceController,
  RevenueController,
  UnitController,
} from './PricesFields';
import {
  AddButton,
  OfferPriceGridLayout,
  PriceTypeListWrapper,
  PriceTypeRowWrapper,
  RemoveButton,
} from './styled';

const narrowWidth = 130;
const mediumWidth = 146;
const daysList = Object.values(DAY_NAMES) as DAY_NAMES[];

const DefaultPriceObject: PriceItemType = {
  [PRICES_FIELD.price]: undefined,
  [PRICES_FIELD.name]: '',
  [PRICES_FIELD.unit]: undefined,
};
const DefaultDateTimePriceObject = {
  [PRICES_FIELD.price]: undefined,
};

type PriceProps = {
  index: number;
  remove: (index?: number | number[] | undefined) => void;
  priceItem: Record<string, string>;
  disabled?: boolean;
};

function SinglePrice({index, disabled}: Pick<PriceProps, 'index' | 'disabled'>) {
  const {control} = useFormContext();
  const priceItemName = `${FORM_NAMES.pricesItems}.${index}` as const;
  const currentPrice = `${priceItemName}.${PRICES_FIELD.price}` as const;
  const currentPriceUnit = `${priceItemName}.${PRICES_FIELD.unit}` as const;

  return (
    <PriceTypeRowWrapper width={608} gap={30}>
      <PriceController
        name={currentPrice}
        width={mediumWidth}
        disabled={disabled}
        control={control}
      />
      <RevenueController
        width={mediumWidth}
        currentPriceName={currentPrice}
        disabled={disabled}
      />
      <UnitController name={currentPriceUnit} disabled={disabled} />
    </PriceTypeRowWrapper>
  );
}

function MultiPriceField({index, remove, disabled}: PriceProps) {
  const {control} = useFormContext();
  const priceItemName = `${FORM_NAMES.pricesItems}.${index}` as const;
  const currentPrice = `${priceItemName}.${PRICES_FIELD.price}` as const;
  const currentPriceUnit = `${priceItemName}.${PRICES_FIELD.unit}` as const;
  const currentPriceName = `${priceItemName}.${PRICES_FIELD.name}` as const;

  return (
    <PriceTypeRowWrapper gap={15}>
      <ItemNameController name={currentPriceName} disabled={disabled} control={control} />
      <PriceController
        name={currentPrice}
        control={control}
        width={narrowWidth}
        disabled={disabled}
      />
      <RevenueController
        width={narrowWidth}
        currentPriceName={currentPrice}
        disabled={disabled}
      />
      <UnitController name={currentPriceUnit} disabled={disabled} />
      <RemoveButton
        isHidden={index === 0}
        onClick={() => remove(index)}
        disabled={disabled}
      >
        <img src={deleteIcon} alt="Close" />
      </RemoveButton>
    </PriceTypeRowWrapper>
  );
}

function DateRangePricesField({index, priceItem, disabled}: PriceProps) {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const priceItemName = `${FORM_NAMES.pricesItems}.${index}` as const;
  const dayName = `${priceItemName}.${priceItem.day}` as const;
  const currentPrice = `${priceItemName}.${PRICES_FIELD.price}` as const;

  return (
    <PriceTypeRowWrapper gap={15}>
      <DayController
        control={control}
        label={t(DAY_TRANSLATIONS[priceItem.day as DAY_NAMES])}
        name={dayName}
        disabled={disabled}
      />
      <PriceController control={control} row name={currentPrice} disabled={disabled} />
      <RevenueController row currentPriceName={currentPrice} disabled={disabled} />
    </PriceTypeRowWrapper>
  );
}

type PriceFieldProps = {
  remove: (index?: number | number[] | undefined) => void;
  fields: Record<string, string>[];
  type?: PRICE_TYPES;
  disabled?: boolean;
};
function PriceFields({type, fields, remove, disabled}: PriceFieldProps) {
  switch (type) {
    case PRICE_TYPES.single:
      return <SinglePrice index={0} disabled={disabled} />;
    case PRICE_TYPES.multiple:
      const multiFields = fields.map((priceItem, index) => (
        <MultiPriceField
          priceItem={priceItem}
          key={priceItem.id}
          index={index}
          remove={remove}
          disabled={disabled}
        />
      ));
      return <>{multiFields}</>;
    case PRICE_TYPES.dateTime:
      const dateTimeFields = fields.map((priceItem, index) => (
        <DateRangePricesField
          priceItem={priceItem}
          key={priceItem.id}
          index={index}
          remove={remove}
          disabled={disabled}
        />
      ));
      return <>{dateTimeFields}</>;
    default:
      return null;
  }
}

type OfferPriceSectionProps = {
  disabled: boolean;
};
const OfferPriceSection = React.memo(({disabled}: OfferPriceSectionProps) => {
  const {t} = useTranslation();
  const {fields, append, replace, remove} = useFieldArray({name: FORM_NAMES.pricesItems});
  const {watch} = useFormContext();
  const priceType = watch(FORM_NAMES.priceType)?.value;

  React.useEffect(() => {
    if (priceType === PRICE_TYPES.multiple && !fields.length) {
      append(DefaultPriceObject);
    }
  }, [append, priceType, fields]);

  React.useEffect(() => {
    if (priceType === PRICE_TYPES.dateTime) {
      const fields = daysList.map((day) => ({
        ...DefaultDateTimePriceObject,
        day,
      }));
      replace(fields);
    }
  }, [replace, priceType]);

  const handleAddClick = () => {
    append(DefaultPriceObject);
  };

  const handlePriceTypeChange = React.useCallback(
    (onChange: (a: any) => void) => (option: SelectOption) => {
      if (option.value !== PRICE_TYPES.multiple) remove();
      onChange(option);
    },
    [remove],
  );

  return (
    <Section title={t('price')} subtitle={t('deal_price_subtitle')}>
      <OfferPriceGridLayout>
        <Controller
          render={({field: {ref, onChange, ...restField}, fieldState: {error}}) => {
            return (
              <Select
                disabled={disabled}
                label={t('price_type')}
                placeholder={t('select_type')}
                error={error?.message}
                options={Object.values(PRICE_TYPE_OPTIONS)}
                onChange={handlePriceTypeChange(onChange)}
                {...restField}
              />
            );
          }}
          name={FORM_NAMES.priceType}
          rules={{required: t<string>('required')}}
        />

        <PriceTypeListWrapper>
          <PriceFields
            fields={fields}
            remove={remove}
            type={priceType}
            disabled={disabled}
          />
        </PriceTypeListWrapper>

        {priceType === PRICE_TYPES.multiple && (
          <AddButton
            onClick={handleAddClick}
            label={t('add_item')}
            icon={<img src={plusIcon} alt="Plus" />}
            link
          />
        )}
      </OfferPriceGridLayout>
    </Section>
  );
});

export {OfferPriceSection};
