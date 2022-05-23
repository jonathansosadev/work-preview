import React from 'react';
import {Props, createFilter, components, ActionMeta} from 'react-select';
import Loader from '../Loader';
import {ErrorMessage} from '../../styled/common';
import {Wrapper, DisplayIcon, Label, LoaderWrapper, styles, ReactSelect} from './styled';

const Control = (props: any) => {
  const {label, name, error, invalid, isDisabled} = props.selectProps;
  return (
    <Wrapper
      className="control-wrapper"
      invalid={invalid || Boolean(error)}
      disabled={isDisabled}
    >
      {label && <Label>{label}</Label>}
      <components.Control {...props} />
      {error && <ErrorMessage data-testid={`${name}-error`}>{error}</ErrorMessage>}
    </Wrapper>
  );
};

const DropdownIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <DisplayIcon shouldRotate={props.selectProps.isMenuOpen} />
    </components.DropdownIndicator>
  );
};

const LoadingIndicator = () => {
  return (
    <LoaderWrapper>
      <Loader height={18} width={18} />
    </LoaderWrapper>
  );
};

const Input = (props: any) => {
  return <components.Input {...props} autoComplete="chrome-off" />;
};

export type SelectProps = Omit<Props, 'isDisabled' | 'onChange'> & {
  onChange?: (option: any, info: ActionMeta) => void;
  label?: string;
  invalid?: boolean;
  disabled?: boolean;
  error?: any;
  empty?: boolean;
};

const defaultProps: Partial<SelectProps> = {
  label: '',
  invalid: false,
  placeholder: '- -',
  error: '',
  isSearchable: true,
  openMenuOnFocus: true,
};

function Select({
  onChange,
  label,
  invalid,
  error,
  className,
  disabled,
  loading,
  tooltip,
  components,
  onMenuOpen,
  onMenuClose,
  empty,
  ...props
}: SelectProps) {
  const onChangeHandler = disabled ? undefined : onChange;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleMenuOpen = React.useCallback(() => {
    setIsMenuOpen(true);
    onMenuOpen?.();
  }, [onMenuOpen]);

  const handleMenuClose = React.useCallback(() => {
    setIsMenuOpen(false);
    onMenuClose?.();
  }, [onMenuClose]);

  return (
    <ReactSelect
      empty={empty || !props.value}
      autoComplete="chrome-off"
      className={`${className} select`}
      classNamePrefix="select"
      error={error}
      label={label}
      invalid={invalid}
      onChange={onChangeHandler}
      isDisabled={disabled}
      isLoading={loading}
      onMenuOpen={handleMenuOpen}
      onMenuClose={handleMenuClose}
      isMenuOpen={isMenuOpen}
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

Select.defaultProps = defaultProps;
export {Select, Control, DropdownIndicator, LoadingIndicator, Input};
