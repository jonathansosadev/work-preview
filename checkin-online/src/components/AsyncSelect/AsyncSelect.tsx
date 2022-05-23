import React from 'react';
import {SelectComponents} from 'react-select/src/components';
import {createFilter} from 'react-select';
import {useTranslation} from 'react-i18next';
import {SelectOptionType} from '../../utils/types';
import {
  AsyncReactSelect,
  Control,
  DropdownIndicator,
  LoadingIndicator,
  Input,
  styles,
} from '../Select';

type AsyncSelectProps = {
  onChange?: (option: any, info: any) => void;
  loadOptions: (value: any, callback: any) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  label?: string;
  invalid?: boolean;
  disabled?: boolean;
  value?: SelectOptionType | null;
  name?: string;
  placeholder?: string;
  className?: string;
  cacheOptions?: boolean;
  defaultValues?: [] | boolean;
  components?: Partial<SelectComponents<any>>;
};

const defaultProps: AsyncSelectProps = {
  onChange: () => {},
  onMenuOpen: () => {},
  onMenuClose: () => {},
  loadOptions: () => {},
  value: null,
  label: '',
  invalid: false,
  disabled: false,
  name: '',
  placeholder: '- -',
  className: undefined,
  cacheOptions: false,
  defaultValues: false,
};

function AsyncSelect({
  onChange,
  value,
  label,
  invalid,
  disabled,
  name,
  placeholder,
  className,
  onMenuOpen,
  onMenuClose,
  loadOptions,
  cacheOptions,
  defaultValues,
  components,
  ...props
}: AsyncSelectProps) {
  const {t} = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [hasQuery, setHasQuery] = React.useState(false);
  const onChangeHandler = disabled ? undefined : onChange;

  const handleMenuOpen = React.useCallback(() => {
    setIsMenuOpen(true);
    onMenuOpen!();
  }, [onMenuOpen]);

  const handleMenuClose = React.useCallback(() => {
    setIsMenuOpen(false);
    onMenuClose!();
  }, [onMenuClose]);

  const handleChange = (value: string) => {
    setHasQuery(Boolean(value));
  };

  return (
    <AsyncReactSelect
      autoComplete="chrome-off"
      className={`${className} select`}
      classNamePrefix="select"
      noOptionsMessage={() => (hasQuery ? t('no_options') : t('start_typing'))}
      onInputChange={handleChange}
      loadOptions={loadOptions}
      onMenuOpen={handleMenuOpen}
      onMenuClose={handleMenuClose}
      isMenuOpen={isMenuOpen}
      value={value}
      onChange={onChangeHandler}
      placeholder={placeholder}
      aria-label={name}
      name={name}
      label={label}
      isDisabled={disabled}
      cacheOptions={cacheOptions}
      defaultValues={defaultValues}
      filterOption={createFilter({ignoreAccents: false})}
      components={{
        Control,
        IndicatorSeparator: null,
        DropdownIndicator,
        LoadingIndicator,
        Input,
        ...components,
      }}
      styles={styles}
      {...props}
    />
  );
}

AsyncSelect.defaultProps = defaultProps;
export {AsyncSelect};
