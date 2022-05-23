import React, {InputHTMLAttributes} from 'react';
import {isMobile} from 'react-device-detect';
import {useScreenResize} from '../../utils/hooks';
import {device} from '../../styled/device';
import minusIcon from '../../assets/minus.svg';
import plusIcon from '../../assets/plus.svg';
import QuestionTooltip from '../QuestionTooltip';
import {ErrorMessage} from '../../styled/common';
import {
  Wrapper,
  StyledInput,
  Label,
  SpinnerButton,
  SpinnerButtonsWrapper,
  SpinnerIcon,
  InpitSpinnerButtonsWrapper,
  RelativeWrapper,
} from './styled';

type SpinnerButtonsProps = {
  onIncrement?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDecrement?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

function SpinnerButtons({onDecrement, onIncrement, className}: SpinnerButtonsProps) {
  return (
    <SpinnerButtonsWrapper className={className}>
      <SpinnerButton onClick={onDecrement as any} type="button">
        <SpinnerIcon src={minusIcon} alt="Increment" />
      </SpinnerButton>
      <SpinnerButton onClick={onIncrement as any} type="button">
        <SpinnerIcon src={plusIcon} alt="Decrement" />
      </SpinnerButton>
    </SpinnerButtonsWrapper>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> &
  SpinnerButtonsProps & {
    label?: string;
    invalid?: boolean;
    error?: any;
    hideNumberButtons?: boolean;
    labelTooltip?: string;
  };

const defaultProps: InputProps = {
  onChange: undefined,
  onIncrement: () => {},
  onDecrement: () => {},
  label: '',
  invalid: undefined,
  error: '',
  hideNumberButtons: false,
  autoComplete: 'chrome-off',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      onChange,
      className,
      label,
      invalid,
      defaultValue,
      disabled,
      name,
      type,
      onIncrement,
      onDecrement,
      max,
      error,
      hideNumberButtons,
      autoComplete,
      labelTooltip,
      ...props
    },
    ref,
  ) => {
    const {isMatch} = useScreenResize(device.tablet);
    const isMobileMode = isMatch || isMobile;
    const position = isMobileMode ? 'top center' : 'left';

    return (
      <Wrapper className={className} disabled={disabled}>
        <Label>
          {label}
          {labelTooltip && <QuestionTooltip position={position} content={labelTooltip} />}
        </Label>
        <RelativeWrapper>
          <StyledInput
            ref={ref}
            type={type}
            data-testid="input"
            value={value}
            onChange={onChange}
            invalid={invalid || Boolean(error)}
            disabled={disabled}
            defaultValue={defaultValue}
            aria-label={name}
            name={name}
            max={max}
            hideNumberButtons={hideNumberButtons}
            autoComplete={autoComplete}
            {...props}
          />
          {type === 'number' && !hideNumberButtons && (
            <InpitSpinnerButtonsWrapper>
              <SpinnerButtons onDecrement={onDecrement} onIncrement={onIncrement} />
            </InpitSpinnerButtonsWrapper>
          )}
        </RelativeWrapper>

        {error && (
          <ErrorMessage className="error-message" data-testid={`${name}-error`}>
            {error}
          </ErrorMessage>
        )}
      </Wrapper>
    );
  },
);

Input.defaultProps = defaultProps;
export {Input, SpinnerButtons};
