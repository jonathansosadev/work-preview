import React, {InputHTMLAttributes} from 'react';
import {withEmptyDetection} from '../../../hocs/withEmptyDetection';
import {usePrevious} from '../../../utils/hooks';
import {ErrorMessage} from '../../../styled/common';
import minusIcon from '../../../assets/minus.svg';
import plusIcon from '../../../assets/plus.svg';
import eyeIcon from '../../../assets/eye.svg';
import pinkEyeIcon from '../../../assets/eye-pink.svg';
import {
  Label,
  StyledInput,
  Name,
  SpinnerButtonsWrapper,
  SpinnerButton,
  SpinnerIcon,
  RevealPasswordIcon,
  LabelWrapper,
  InputWrapper,
  Sign,
} from './styled';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string | React.ReactNode;
  invalid?: boolean;
  error?: any;
  showNumberButtons?: boolean;
  onIncrement?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDecrement?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  inputMode?:
    | 'text'
    | 'none'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search';
  empty?: boolean;
  hideReveal?: boolean;
  tooltip?: React.ReactNode;
  sign?: string;
};

const Input = React.memo(
  React.forwardRef<HTMLInputElement, InputProps>(
    (
      {
        value,
        className,
        label,
        tooltip,
        invalid,
        disabled,
        name,
        type,
        error,
        showNumberButtons,
        onIncrement,
        onDecrement,
        empty,
        hideReveal,
        readOnly,
        sign,
        ...props
      },
      ref,
    ) => {
      const [inputType, setInputType] = React.useState(type);
      const [isPasswordRevealed, setIsPasswordRevealed] = React.useState(false);
      const prevInputType = usePrevious(inputType);

      const isRevealPasswordIconVisible =
        (prevInputType === 'password' || type === 'password') && !empty;

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
        <Label className={`${className} input-wrapper`} disabled={disabled}>
          {label && (
            <LabelWrapper>
              <Name className="label">{label}</Name>
              <span>{tooltip}</span>
            </LabelWrapper>
          )}
          <InputWrapper>
            <StyledInput
              empty={empty}
              className="input"
              ref={ref}
              type={inputType}
              data-testid="input"
              value={value}
              invalid={invalid || Boolean(error)}
              customDisable={disabled}
              aria-label={name}
              name={name}
              readOnly={disabled || readOnly}
              {...props}
            />
            {sign && <Sign>{sign}</Sign>}
          </InputWrapper>
          {type === 'number' && showNumberButtons && (
            <SpinnerButtonsWrapper>
              <SpinnerButton onClick={onDecrement as () => void} type="button">
                <SpinnerIcon src={minusIcon} alt="Minus" />
              </SpinnerButton>
              <SpinnerButton onClick={onIncrement as () => void} type="button">
                <SpinnerIcon src={plusIcon} alt="Plus" />
              </SpinnerButton>
            </SpinnerButtonsWrapper>
          )}
          {!hideReveal && isRevealPasswordIconVisible && (
            <RevealPasswordIcon
              src={isPasswordRevealed ? pinkEyeIcon : eyeIcon}
              onClick={togglePasswordRevealing}
              alt="Show password"
            />
          )}
          {error && (
            <ErrorMessage className="error-message" data-testid={`${name}-error`}>
              {error}
            </ErrorMessage>
          )}
        </Label>
      );
    },
  ),
);

const InputController = withEmptyDetection<HTMLInputElement, InputProps>(Input);

export {Input, InputController};
