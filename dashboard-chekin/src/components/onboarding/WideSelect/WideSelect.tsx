import React from 'react';
import ReactSelect from 'react-select';
import displayIcon from '../../../assets/display-icn-darken.svg';
import {SelectOption} from '../../../utils/types';
import {CollapseIcon, DisplayIcon, Hint, Label, Wrapper} from './styled';

const HAS_VALUE_CLASSNAME = 'has-value';

type WideSelectProps = {
  onChange: (option: any) => void;
  value: SelectOption | null;
  options: SelectOption[];
  hint?: string;
  label?: string;
  className?: string;
};

const defaultProps: Partial<WideSelectProps> = {
  value: null,
  options: [],
  hint: '',
  label: '',
  className: undefined,
};

function WideSelect({
  options,
  value,
  onChange,
  hint,
  label,
  className,
  ...props
}: WideSelectProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = Boolean(value) || isFocused;
  const hasValueClassName = value ? HAS_VALUE_CLASSNAME : '';

  return (
    <Wrapper className={className}>
      <Hint active={isActive}>{hint}</Hint>
      <Label>{label}</Label>
      {isMenuOpen ? (
        <CollapseIcon src={displayIcon} alt="Collapse" />
      ) : (
        <DisplayIcon src={displayIcon} alt="Display" />
      )}
      <ReactSelect
        className={`onboarding-select ${hasValueClassName}`}
        classNamePrefix="onboarding-select"
        placeholder="- -"
        value={value}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        options={options}
        onChange={onChange}
        isSearchable={false}
        {...props}
      />
    </Wrapper>
  );
}

WideSelect.defaultProps = defaultProps;
export {WideSelect};
