import styled, {css} from 'styled-components';
import TextareaAutosize from 'react-textarea-autosize';
import {inputStyles} from '../Input/styled';
import {TextareaProps} from './Textarea';

type WrapperProps = {
  disabled?: boolean;
};

export const Wrapper = styled.label<WrapperProps>`
  position: relative;
  min-height: 48px;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};
`;

export const StyledTextArea = styled(TextareaAutosize)<
  TextareaProps & {$customDisable?: boolean; $empty?: boolean}
>`
  ${inputStyles}

  ${(props) =>
    props.$empty &&
    css`
      border: none;
      color: #8181a3;
      background-color: #f4f6f8;
      &:hover {
        border: none;
      }
    `};

  ${(props) =>
    props.invalid &&
    css`
      border-color: #ff2467;
    `};

  ${(props) =>
    props.readOnly &&
    css`
      cursor: default;
    `};

  ${(props) =>
    props.$customDisable &&
    css`
      cursor: not-allowed;
    `};

  ${(props) =>
    props.$empty &&
    css`
      background: #f4f6f8;
      color: #8181a3;
      border: none;
    `};
`;
