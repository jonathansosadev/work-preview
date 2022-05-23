import styled, {css} from 'styled-components';

export const FileInputText = styled.div`
  margin-bottom: 7px;
  color: #385cf8;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
`;
export const ClipContainer = styled.div`
  width: 26px;
  height: 26px;
  background-color: #385cf8;
  border-radius: 3px;
  display: inline-flex;
  justify-content: center;
  align-items: center;

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
`;

export const Placeholder = styled.span`
  margin-left: 8px;
`;

export const FileInputBox = styled.div`
  width: 100%;
  border: 1px solid rgb(115 115 142);
  border-radius: 3px;
  height: 40px;
  box-sizing: border-box;
  font-family: ProximaNova-Medium, sans-serif;
  color: #9696b9;
  padding: 7px 7px 7px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FileNameContainer = styled.div`
  height: 30px;
  box-sizing: border-box;
  padding: 6px 4px 6px 9px;
  background-color: #f2f2f2;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  max-width: 85%;

  &:hover {
    cursor: default;

    &&& + ${ClipContainer} {
      opacity: 1;
    }
  }
`;

export const FileName = styled.span`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
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
  width: 284px;
  height: 64px;
  cursor: pointer;
  font-size: 15px;
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

  ${(props) =>
    props.invalid &&
    css`
      & ${FileInputBox} {
        border-color: #ff2467;
      }

      & ${Placeholder} {
        color: #ff2467;
      }
    `};

  ${(props) =>
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
`;
