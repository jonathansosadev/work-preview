import styled, {css} from 'styled-components';
import {FileInputProps} from './FileInputButton';

export const FileInputText = styled.div`
  margin-left: 11px;
  margin-right: 10px;
`;

export const FileUploadIcon = styled.img`
  width: 17px;
  height: 14px;
  margin-left: 12px;
`;

export const FileInputLabel = styled.label<
  Pick<FileInputProps, 'secondary' | 'disabled' | 'danger'>
>`
  outline: none;
  font-family: ProximaNova-Medium, sans-serif;
  min-width: 117px;
  height: 40px;
  border-radius: 6px;
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  box-sizing: border-box;
  background-color: #385cf8;
  border: 1px solid #385cf8;
  transition: all 0.07s ease-in-out;
  color: white;
  box-shadow: 0 3px 4px #0002030d;
  padding-right: 12px;

  &:hover {
    opacity: 0.9;
    box-shadow: none;
  }

  &:active {
    opacity: 1;
  }

  ${(props) =>
    props.danger &&
    css`
      background: transparent linear-gradient(164deg, #ff2467 0%, #f21357 100%) 0% 0%
        no-repeat padding-box;
    `}

  ${(props) =>
    props.secondary &&
    css`
      border: 1px solid #2148ff;
      color: #002cfa;
      background: white;
      box-shadow: 0 3px 4px #0002031a;

      ${props.danger &&
      css`
        border-color: #f21357;
      `}
    `};

  ${(props) =>
    props.disabled &&
    css`
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.3;

      &:hover {
        opacity: 0.3;
        box-shadow: none;
      }

      &:active {
        opacity: 0.3;
      }
    `};
`;

export const HiddenFileUploader = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
`;
