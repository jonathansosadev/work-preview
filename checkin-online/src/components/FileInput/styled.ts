import styled, {css} from 'styled-components';
import {inputStyles} from '../Input/styled';
import {device} from '../../styled/device';

export const ClipContainer = styled.div`
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  background-color: #385cf8;
  border-radius: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 4px #0002032b;

  & > img {
    width: 22px;
    height: 22px;
  }
`;

export const ClearButton = styled.button`
  background-color: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin-left: 15px;
`;

export const ClearIcon = styled.img`
  height: 15px;
  width: 15px;
  border-radius: 3px;
  cursor: pointer;
  vertical-align: middle;

  &:active {
    opacity: 0.95;
  }

  &:hover {
    box-shadow: 0 3px 3px #0f477734;
    transition: box-shadow 0.15s ease-in-out;
  }
`;

export const HiddenFileUploader = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  position: absolute;
`;

export const Placeholder = styled.span`
  font-size: 18px;
  position: relative;
  font-family: ProximaNova-Medium, sans-serif;
  opacity: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: rgb(129, 129, 163);

  @media (max-width: ${device.mobileL}) {
    font-size: 20px;
  }
`;

export const FileInputBox = styled.div`
  ${inputStyles};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FileNameContainer = styled.div`
  height: 24px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  max-width: 85%;
  background-color: #f0f0f8;
  padding-left: 8px;
  padding-right: 4px;
  border: 1px solid #acacd5;
  border-radius: 4px;

  &:hover {
    cursor: default;

    &&& + ${ClipContainer} {
      opacity: 1;
    }
  }
`;

export const FileName = styled.span`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  color: #161643;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

type FileInputLabelProps = {
  disabled?: boolean;
  invalid?: boolean;
};

export const FileInputLabel = styled.label<FileInputLabelProps>`
  outline: none;
  display: inline-block;
  font-family: ProximaNova-Medium, sans-serif;
  width: 327px;
  cursor: pointer;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.07s ease-in-out;
  text-align: left;
  position: relative;

  &:hover ${ClipContainer} {
    opacity: 0.88;
  }

  &:active {
    opacity: 1;
  }

  ${props =>
    props.invalid &&
    css`
      & ${FileInputBox} {
        border-color: #ff2467;
      }
    `};

  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.3;

      &:hover,
      &:active {
        opacity: 0.3;

        & ${ClearIcon} {
          cursor: not-allowed;
          opacity: 1;
          box-shadow: none;
        }

        & ${FileNameContainer} {
          cursor: not-allowed;
        }
      }
    `};

  @media (max-width: ${device.mobileS}) {
    width: 293px;
  }
`;
