import React from 'react';
import {Props} from 'react-select/creatable';
import {SelectOption} from '../../../utils/types';
import {
  CreatableReactSelect,
  Control,
  DropdownIndicator,
  LoadingIndicator,
  Input,
  styles,
} from '../Select';

export type CreatableCreatableSelectProps = Props<SelectOption, boolean> & {
  label?: string;
  invalid?: boolean;
  disabled?: boolean;
  name?: string;
  error?: Error;
  className?: string;
  loading?: boolean;
  tooltip?: string | JSX.Element | React.ReactNode;
};

const defaultProps: CreatableCreatableSelectProps = {
  label: '',
  loading: false,
};

const CreatableSelect = React.forwardRef<unknown, CreatableCreatableSelectProps>(
  (
    {
      onChange,
      disabled,
      placeholder,
      className,
      onMenuOpen,
      onMenuClose,
      components,
      ...props
    },
    ref,
  ) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const onChangeHandler = disabled ? undefined : onChange;
    const isEmpty = Boolean(props.empty || !props.value);

    const handleMenuOpen = React.useCallback(() => {
      setIsMenuOpen(true);

      if (onMenuOpen) {
        onMenuOpen();
      }
    }, [onMenuOpen]);

    const handleMenuClose = React.useCallback(() => {
      setIsMenuOpen(false);

    if (onMenuClose) {
      onMenuClose();
    }
  }, [onMenuClose]);
  return (
    <CreatableReactSelect
      isEmpty={!props.value}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        className={`${className} select`}
        classNamePrefix="select"
        onChange={onChangeHandler}
        placeholder={placeholder}
        isDisabled={disabled}
        isMenuOpen={isMenuOpen}
        components={{
          Control,
          IndicatorSeparator: null,
          DropdownIndicator,
          LoadingIndicator,
          Input,
          ...components,
        }}
        styles={styles}
        empty={isEmpty}
        ref={ref}
        {...props}
      />
    );
  },
);

CreatableSelect.defaultProps = defaultProps;
export {CreatableSelect};
