import React from 'react';
import {InputEventType, ReactEntity} from '../../../utils/types';
import {usePrevious} from '../../../utils/hooks';
import eyeIcon from '../../../assets/eye.svg';
import eyeActiveIcon from '../../../assets/eye_blue_active.svg';
import {ErrorMessage} from '../../../styled/onboarding';
import {Wrapper, StyledInput, FieldName, RevealPasswordIcon} from './styled';

export type InputProps = {
  onChange?: (e: InputEventType) => void;
  type?: string;
  label?: ReactEntity;
  value?: string;
  empty?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  error?: any;
  inputMode?:
    | 'text'
    | 'none'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search';
};

export const defaultProps: InputProps = {
  onChange: () => {},
  label: '',
  value: undefined,
  empty: undefined,
  disabled: false,
  defaultValue: undefined,
  invalid: undefined,
  className: undefined,
  inputMode: undefined,
  type: 'text',
  error: '',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      onChange,
      className,
      label,
      invalid,
      empty,
      defaultValue,
      disabled,
      name,
      type,
      error,
      placeholder,
      inputMode,
    },
    ref,
  ) => {
    const [inputType, setInputType] = React.useState(type);
    const [isPasswordRevealed, setIsPasswordRevealed] = React.useState(false);
    const prevInputType = usePrevious(inputType);

    const isEmpty = typeof empty === 'undefined' ? !value : empty;
    const isRevealPasswordIconVisible =
      (prevInputType === 'password' || type === 'password') && !isEmpty;

    const revealPassword = () => {
      setInputType('text');
      setIsPasswordRevealed(true);
    };

    const hidePassword = () => {
      setInputType('password');
      setIsPasswordRevealed(false);
    };

    const togglePasswordRevealing = () => {
      if (isPasswordRevealed) {
        hidePassword();
        return;
      }
      revealPassword();
    };

    return (
      <Wrapper className={className} disabled={disabled}>
        <label>
          <FieldName>{label}</FieldName>
          <StyledInput
            ref={ref}
            type={inputType}
            data-testid="input"
            value={value}
            onChange={onChange}
            disabled={disabled}
            defaultValue={defaultValue}
            invalid={invalid || Boolean(error)}
            name={name}
            placeholder={placeholder}
            inputMode={inputMode}
          />
          {isRevealPasswordIconVisible && (
            <RevealPasswordIcon
              src={isPasswordRevealed ? eyeActiveIcon : eyeIcon}
              onClick={togglePasswordRevealing}
              alt="Eye"
            />
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </label>
      </Wrapper>
    );
  },
);

Input.defaultProps = defaultProps;
export {Input};
