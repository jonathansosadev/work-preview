import React from 'react';
import TextareaAutosize, {TextareaAutosizeProps} from 'react-textarea-autosize';
import {withEmptyDetection} from '../../../hocs/withEmptyDetection';
import {ErrorMessage} from '../../../styled/common';
import {Name} from '../Input/styled';
import {Wrapper, StyledTextArea} from './styled';

export type TextareaProps = Omit<TextareaAutosizeProps, 'as' | 'ref'> & {
  label?: string;
  invalid?: boolean;
  error?: any;
  empty?: boolean;
};

const defaultProps: TextareaProps = {
  label: '',
  invalid: false,
  error: '',
  name: '',
  empty: undefined,
};

const Textarea = React.forwardRef<TextareaAutosize, TextareaProps>(
  ({className, label, invalid, error, empty, disabled, readOnly, ...props}, ref) => {
    const isEmpty = typeof empty === 'undefined' ? !props.defaultValue : empty;

    return (
      <Wrapper className={className} disabled={disabled}>
        {label && <Name className="label">{label}</Name>}
        <StyledTextArea
          className="text-area"
          ref={ref}
          invalid={invalid || Boolean(error) || undefined}
          readOnly={disabled || readOnly}
          $empty={isEmpty}
          $customDisable={disabled}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Wrapper>
    );
  },
);

const TextareaController = withEmptyDetection<HTMLTextAreaElement, TextareaProps>(
  Textarea,
);

Textarea.defaultProps = defaultProps;
export {Textarea, TextareaController};
