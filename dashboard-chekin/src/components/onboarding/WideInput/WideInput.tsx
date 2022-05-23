import React from 'react';
import type {InputEventType} from '../../../utils/types';
import {StyledInput, Wrapper, Label, Hint} from './styled';

type WideInputProps = {
  onChange: (e: InputEventType) => void;
  value: string;
  label?: string;
  hint?: string;
  className?: string;
};

const defaultProps: Partial<WideInputProps> = {
  label: '',
  hint: '',
  className: undefined,
};

const WideInput = React.forwardRef<HTMLInputElement, WideInputProps>(
  ({onChange, value, label, className, hint}, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const isActive = isFocused || Boolean(value);

    return (
      <Wrapper
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={className}
      >
        <Hint active={isActive}>{hint}</Hint>
        <Label>{label}</Label>
        <StyledInput
          onChange={onChange}
          value={value}
          active={isActive}
          placeholder="- -"
          ref={ref}
        />
      </Wrapper>
    );
  },
);

WideInput.defaultProps = defaultProps;
export {WideInput};
