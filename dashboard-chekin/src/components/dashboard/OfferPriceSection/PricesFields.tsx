import React from 'react';
import {Control, Controller, useWatch} from 'react-hook-form';
import i18n from 'i18next';
import {useTranslation} from 'react-i18next';
import {useUser} from '../../../context/user';
import {PRICE_UNITS_OPTIONS, PRICES_FIELD} from '../../../utils/upselling';
import Tooltip from '../Tooltip';
import {Input, RevenueInput, StyledCheckbox, UnitSelect} from './styled';

const minPrice = 1;
const maxPrice = 10000;
const maxDescriptionLength = 512;

const wideWidth = 293;

const getRevenueFromPrice = (price: number, commission: number) => {
  const total = price - (price * commission) / 100;
  if (total) return Number(total.toFixed(2));
  return 0;
};

const REGISTER_OPTIONS = {
  [PRICES_FIELD.name]: {
    required: i18n.t('required') as string,
    maxLength: {
      value: maxDescriptionLength,
      message: i18n.t('max_length', {length: maxDescriptionLength}),
    },
  },
  [PRICES_FIELD.price]: {
    required: i18n.t('required') as string,
    min: {
      value: minPrice,
      message: i18n.t('min_number_is', {number: minPrice}),
    },
    max: {
      value: maxPrice,
      message: i18n.t('max_number_is', {number: maxPrice}),
    },
  },
};

type ControllerType = {
  name: string;
  control: Control;
  width?: number;
  disabled?: boolean;
};

const ItemNameController = ({name, control, disabled}: ControllerType) => {
  const {t} = useTranslation();

  return (
    <Controller
      render={({field, fieldState: {error}}) => (
        <Input
          disabled={disabled}
          control={control}
          label={t('item_name')}
          placeholder={t('enter_item_name')}
          error={error?.message}
          width={wideWidth}
          {...field}
        />
      )}
      name={name}
      rules={REGISTER_OPTIONS[PRICES_FIELD.name]}
    />
  );
};

type PriceControllerType = ControllerType & {
  row?: boolean;
};
const PriceController = ({name, width, row, control, disabled}: PriceControllerType) => {
  const {t} = useTranslation();

  return (
    <Controller
      render={({field, fieldState: {error}}) => (
        <Input
          row={row}
          control={control}
          label={t('price')}
          placeholder={t('enter_number')}
          inputMode="numeric"
          type="number"
          step="0.01"
          error={error?.message}
          width={width}
          disabled={disabled}
          {...field}
        />
      )}
      name={name}
      rules={REGISTER_OPTIONS[PRICES_FIELD.price]}
    />
  );
};

type RevenueControllerType = {
  currentPriceName: string;
  row?: boolean;
  width?: number;
  disabled?: boolean;
};
const RevenueController = ({
  width,
  currentPriceName,
  row,
  disabled,
}: RevenueControllerType) => {
  const {t} = useTranslation();
  const user = useUser();
  const upsellingCommission = user?.upselling_commission;
  const [revenueValue, setRevenueValue] = React.useState<number>(0);
  const priceWatch = useWatch({
    name: currentPriceName as any,
  });

  React.useEffect(() => {
    if (typeof priceWatch === 'undefined' || !upsellingCommission) return;
    const newRevenueValue = getRevenueFromPrice(priceWatch, upsellingCommission);
    setRevenueValue(newRevenueValue);
  }, [priceWatch, upsellingCommission]);

  return (
    <RevenueInput
      readOnly
      row={row}
      value={revenueValue}
      empty={!revenueValue}
      label={t('revenue')}
      placeholder="- -"
      tooltip={
        <Tooltip
          content={t('chekin_commission_is', {
            commission: `${upsellingCommission}%`,
          })}
        />
      }
      width={width}
      disabled={disabled}
    />
  );
};

const UnitController = ({name, disabled}: Pick<ControllerType, 'name' | 'disabled'>) => {
  const {t} = useTranslation();

  return (
    <Controller
      render={({field, fieldState: {error}}) => (
        <UnitSelect
          label={t('unit')}
          placeholder={t('select_unit')}
          error={error?.message}
          options={Object.values(PRICE_UNITS_OPTIONS)}
          disabled={disabled}
          {...field}
        />
      )}
      name={name}
      rules={{required: t('required') as string}}
    />
  );
};

type DayControllerType = ControllerType & {
  label: string;
};
const DayController = ({name, label, disabled}: DayControllerType) => {
  const {t} = useTranslation();

  return (
    <Controller
      render={({field, fieldState: {error}}) => (
        <StyledCheckbox label={label} disabled={disabled} {...field} />
      )}
      name={name}
      rules={{required: t('required') as string}}
    />
  );
};

export {
  ItemNameController,
  PriceController,
  RevenueController,
  UnitController,
  DayController,
};
