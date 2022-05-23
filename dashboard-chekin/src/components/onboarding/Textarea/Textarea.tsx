import React from 'react';
import {ErrorMessage} from '../../../styled/onboarding';
import {Label, StyledTextarea, Wrapper} from './styled';

type TextareaProps = {
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  label?: string;
  invalid?: boolean;
  className?: string;
  empty?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
  error?: string;
  [key: string]: any;
};

const defaultProps: TextareaProps = {
  onChange: undefined,
  className: undefined,
  value: undefined,
  empty: undefined,
  label: '',
  defaultValue: undefined,
  invalid: false,
  disabled: false,
  rows: 3,
  placeholder: '',
  error: '',
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      rows,
      placeholder,
      error,
      ...props
    },
    ref,
  ) => {
    const isEmpty = typeof empty === 'undefined' ? !Boolean(value) : empty;

    return (
      <Wrapper className={className}>
        <Label>{label}</Label>
        <StyledTextarea
          ref={ref}
          data-testid="textarea"
          value={value}
          onChange={onChange}
          empty={!invalid && isEmpty}
          invalid={Boolean(invalid || error)}
          defaultValue={defaultValue}
          aria-label={label}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Wrapper>
    );
  },
);

Textarea.defaultProps = defaultProps;
export {Textarea};
