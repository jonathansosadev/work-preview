import styled, {css} from 'styled-components';
import {default as BaseFileInput} from '../components/dashboard/FileInputButton';
import Button from '../components/dashboard/Button';
export const ContentItemWrapper = styled.div`
  width: 100%;
  padding: 22px 0 29px;
`;
export const FlexWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;
export const Wrapper = styled.div`
  position: relative;
  margin: 28px auto 0;
  cursor: default;
  max-width: 1077px;
  padding: 0 120px;

  & ${ContentItemWrapper}:not(:last-child) {
    border-bottom: 0.5px solid rgba(0, 66, 154, 0.2);
  }
`;

export const HeaderWrapper = styled.div`
  position: relative;
  margin-bottom: 30px;
`;

export const HeaderTitle = styled.div`
  font-weight: 500;
  font-size: 21px;
  font-family: ProximaNova-Bold, sans-serif;
`;

export const InputWrapper = styled.div`
  & > button {
    min-width: 200px;
  }
`;

export const DownloadButton = styled(Button)`
  height: 44px;
  border-color: #2148ff;
  box-shadow: 0 3px 4px #0002031a;
  color: #002cfa;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 28px;

  ${(props) =>
    props.disabled &&
    css`
      &:hover {
        opacity: 0;
      }

      cursor: auto;
      opacity: 0;
    `}
`;

export const FileInputButton = styled(BaseFileInput)`
  min-width: 200px;
  height: 44px;
  border-color: #2148ff;
  box-shadow: 0px 3px 4px #0002031a;
  color: #002cfa;
  border-radius: 6px;
  padding-right: 14px;
`;

export const ContentTextWrapper = styled.div`
  text-align: left;
  font-size: 18px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  margin-bottom: 36px;
  padding-right: 110px;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
`;

export const FileInputWrapper = styled.div`
  margin-right: 10px;
`;

export const SelectedFilesList = styled.div`
  display: flex;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

export const SelectedFileItemWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f2f2f2;
  padding: 11px 14px;
  margin-right: 10px;
  border-radius: 7px;
  min-width: 144px;
  cursor: default;
  margin-bottom: 10px;
  border: 0.5px solid #acacd5;
`;

export const SelectedFileItemRemoveBtn = styled.div`
  width: 15px;
  height: 15px;
  cursor: pointer;
  border-radius: 3px;
  transition: opacity 0.15s ease-in-out;
  position: relative;
  width: 20px;
  height: 20px;
  background: #6b6b95;

  &:hover {
    box-shadow: 0 3px 3px #0f477734;
  }

  &:active {
    opacity: 0.95;
  }

  &::after,
  &::before {
    content: '';
    position: absolute;
    display: block;
    height: 3px;
    width: 17px;
    border-radius: 50px;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%) rotate(45deg);
    background: #fff;
  }

  &::before {
    transform: translateY(-50%) translateX(-50%) rotate(-45deg);
  }
`;

export const Hr = styled.hr`
  margin: 30px 0;
  border: 1px solid #f2f2f6;
`;

export const SelectedFileItemText = styled.div`
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  margin-right: 11px;
`;

export const ToastContent = styled.div`
  display: flex;
  align-items: center;
`;

export const ToastText = styled.div`
  display: flex;
  font-size: 16px;
  margin: 0 9px 0 1px;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #ffffff;
`;

export const ToastImg = styled.img`
  width: 47px;
  height: 29px;
  margin-left: 1px;
  margin-right: 10px;
`;

export const DirectDownloadIcon = styled.img`
  height: 14px;
  width: 18px;
`;

export const BackBtn = styled.div`
  height: 20px;
  width: 20px;
  position: absolute;
  font-size: 0;
  left: 20px;
  transform: translateX(50%);
`;
