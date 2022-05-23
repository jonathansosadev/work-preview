import React from 'react';
import {Props, createFilter, components, ActionMeta} from 'react-select';
import {ReactEntity, SelectOption, LanguageOption} from '../../../utils/types';
import Tooltip from '../Tooltip';
import Loader from '../../common/Loader';
import {
  Wrapper,
  DisplayIcon,
  Label,
  LoaderWrapper,
  ReactSelect,
  TooltipWrapper,
  Error,
  styles,
  IconButtonStyled,
  OptionLabel,
} from './styled';

const Control = (props: any) => {
  const {
    label,
    tooltip,
    name,
    error,
    invalid,
    isDisabled,
    readonly,
    empty,
  } = props.selectProps;
  return (
    <Wrapper
      className="control-wrapper"
      invalid={invalid || Boolean(error)}
      disabled={isDisabled}
      readonly={readonly}
      empty={empty}
    >
      {label && (
        <Label>
          {label}
          {tooltip && (
            <TooltipWrapper>
              <Tooltip content={tooltip} />
            </TooltipWrapper>
          )}
        </Label>
      )}
      <components.Control {...props} />
      {error && <Error data-testid={`${name}-error`}>{error}</Error>}
    </Wrapper>
  );
};

const Option = (props: any) => {
  const iconButton = props.data?.iconButton;

  return (
    <components.Option {...props}>
      <OptionLabel>{props.label}</OptionLabel>
      {iconButton?.iconUrl && (
        <IconButtonStyled
          icon={iconButton?.iconUrl}
          disabled={iconButton?.disabled}
          onClick={iconButton?.onClickIcon}
        />
      )}
    </components.Option>
  );
};

const DropdownIndicator = (props: any) => {
  const {readonly} = props.selectProps;

  return (
    <components.DropdownIndicator {...props}>
      <DisplayIcon shouldRotate={props.selectProps.isMenuOpen} readonly={readonly} />
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
  onChange?: <Option extends (SelectOption | LanguageOption)>(
    option: Option,
    info: ActionMeta<Option>,
  ) => void;
  label?: string | React.ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: any;
  tooltip?: ReactEntity;
  empty?: boolean;
};

const defaultProps: Partial<SelectProps> = {
  label: '',
  invalid: false,
  placeholder: '- -',
  error: '',
  isSearchable: true,
  openMenuOnFocus: true,
  tooltip: '',
};

const Select = React.forwardRef<unknown, SelectProps>(
  (
    {
      onChange,
      label,
      invalid,
      error,
      className,
      disabled,
      readOnly,
      loading,
      tooltip,
      components,
      onMenuOpen,
      onMenuClose,
      empty,
  ...props
},
    ref,
  ) => {
    const isDisabled = disabled || readOnly;
    const onChangeHandler = isDisabled ? undefined : onChange;
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const isEmpty = Boolean(typeof empty === 'undefined' ? !props.value : empty);

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
        empty={isEmpty}
        autoComplete="chrome-off"
        className={`${className} select`}
        classNamePrefix="select"
        error={error}
        label={label}
        tooltip={tooltip}
        invalid={invalid}
        onChange={onChangeHandler}
        isDisabled={isDisabled}
      readonly={!disabled && readOnly}
        isLoading={loading}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        isMenuOpen={isMenuOpen}
        filterOption={createFilter({ignoreAccents: false})}
        components={{
          Control,
          Option,
          IndicatorSeparator: null,
          DropdownIndicator,
          LoadingIndicator,
          Input,
          ...components,
        }}
        styles={styles}
        ref={ref}
        {...props}
      />
    );
  },
);

Select.defaultProps = defaultProps;
export {Select, Control, DropdownIndicator, LoadingIndicator, Input};
