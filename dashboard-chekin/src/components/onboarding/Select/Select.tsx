import React from 'react';
import ReactSelect from 'react-select';
import type {SelectOption} from '../../../utils/types';
import Loader from '../../common/Loader';
import displayArrowIcon from '../../../assets/display-icn-darken.svg';
import {ErrorMessage} from '../../../styled/onboarding';
import {Wrapper, DisplayIcon, Label, LoaderWrapper} from './styled';

const SELECT_CLASSNAME = 'form-select';
const SELECT_CLASSNAME_PREFIX = 'form-select';
const SELECT_INVALID_CLASSNAME = 'invalid';
const SELECT_PLACEHOLDER = '- -';

type SelectProps = {
  onChange?: (option: any) => void;
  label?: string;
  value?: SelectOption | null;
  options?: SelectOption[];
  name?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  placeholder?: string;
};

const defaultProps: Partial<SelectProps> = {
  value: null,
  options: [],
  label: '',
  name: '',
  disabled: false,
  loading: false,
  error: '',
  placeholder: SELECT_PLACEHOLDER,
};

function Select({
  onChange,
  options,
  value,
  label,
  name,
  disabled,
  loading,
  error,
  placeholder,
}: SelectProps) {
  const selectClassName = Boolean(error)
    ? `${SELECT_CLASSNAME} ${SELECT_INVALID_CLASSNAME}`
    : SELECT_CLASSNAME;

  return (
    <Wrapper disabled={disabled}>
      <Label>
        {label}
        <DisplayIcon alt="display" src={displayArrowIcon} />
      </Label>
      {loading && (
        <LoaderWrapper>
          <Loader height={18} width={18} />
        </LoaderWrapper>
      )}
      <ReactSelect
        className={selectClassName}
        classNamePrefix={SELECT_CLASSNAME_PREFIX}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        ariaLabel={label}
        name={name}
        isDisabled={disabled}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Wrapper>
  );
}

Select.defaultProps = defaultProps;
export {Select};
