import styled, {css} from 'styled-components';
import Input from '../Input';
import Select from '../Select';
import Datepicker from '../Datepicker';
import PhoneInput from '../PhoneInput';
import {ClipContainer} from '../FormFileInput/styled';
import {
  SelectedCountryCodeContainer,
  DisplayIcon as PhoneMenuDisplayIcon,
  Menu as PhoneMenu,
  LoaderWrapper as PhoneLoaderWrapper,
  FieldsWrapper as PhoneFieldsWrapper,
} from '../PhoneInput/styled';
import {FieldsWrapper} from '../Datepicker/styled';
import {Label as SelectLabel, DisplayIcon} from '../Select/styled';
import {Name as InputLabel, Label as InputWrapper} from '../Input/styled';

const previewStyles = css`
  width: 179px;
  height: auto;
  min-height: auto;
  min-width: auto;
  pointer-events: none;
`;

export const Wrapper = styled.div`
  position: fixed;
  top: 192px;
  right: 54px;
  z-index: 99;
  width: 247px;
  height: 496px;
  will-change: transform;
  cursor: move;
  user-select: none;

  @media (min-width: 1920px) {
    right: 10%;
  }
`;

type BackgroundProps = {
  isDragging: boolean;
};

export const Background = styled.div<BackgroundProps>`
  position: absolute;
  z-index: -1;
  background-color: white;
  top: 0;
  right: 3px;
  height: 496px;
  width: 242px;
  transition: box-shadow 0.1s ease-in-out;
  box-shadow: ${(props) =>
    props.isDragging ? '0' : '16px 16px 31px rgb(199 199 199 / 65%)'};
  border-radius: 36px;
`;

export const ContainerImage = styled.img`
  width: 247px;
  height: 496px;
  position: absolute;
  top: 0;
  right: 0;
`;

export const Content = styled.div`
  position: absolute;
  overflow-y: auto;
  top: 88px;
  right: 18px;
  width: 211px;
  height: 390px;
  background-color: transparent;
  padding: 16px 16px 50px;
  box-sizing: border-box;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  cursor: default;
`;

export const ContentMessage = styled.div`
  position: absolute;
  top: 0;
  bottom: 73px;
  right: 0;
  left: 0;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 25px;
  color: #9696b9;
  padding: 20px;
  text-align: center;
`;

export const FilePreviewUploadImageContainer = styled(ClipContainer)`
  width: 18px;
  height: 18px;
  position: absolute;
  right: 8px;
  top: 25px;
  min-width: auto;
  min-height: auto;

  & > img {
    width: 14px;
    height: 14px;
  }
`;

export const FieldWrapper = styled.div`
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  position: relative;
`;

const inputStyles = css`
  & ${InputLabel} {
    min-height: auto;
    font-size: 13px;
    margin-bottom: 3px;
  }

  & input {
    padding: 4px 7px;
    text-overflow: ellipsis;

    &::placeholder {
      font-size: 13px;
    }
  }
`;

export const PreviewInput = styled(Input)`
  ${previewStyles};
  ${inputStyles};
`;

export const PreviewFileInput = styled(PreviewInput)`
  font-size: 13px;

  & input {
    padding-right: 27px;
  }
`;

const selectStyles = css`
  .control-wrapper {
    grid-template-rows: 19px 30px auto;
  }

  & ${SelectLabel} {
    min-height: auto;
    font-size: 13px;
  }

  & ${DisplayIcon} {
    height: 18px;
    width: 18px;
    right: 7px;
  }

  & .select {
    height: 30px;
  }

  & .select__placeholder {
    font-size: 13px;
  }

  & .select__control {
    min-height: auto;
  }

  & .select__value-container {
    padding: 0 8px;
  }
`;

export const PreviewSelect = styled(Select)`
  ${previewStyles};
  ${selectStyles};
`;

export const PreviewDatepicker = styled(Datepicker)`
  ${previewStyles};
  ${selectStyles};
  ${inputStyles};

  .select {
    width: 82px;
  }

  .control-wrapper {
    grid-template-rows: 0 30px auto;
  }

  & ${FieldsWrapper} {
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 5px;
  }
`;

export const PreviewPhone = styled(PhoneInput)`
  ${previewStyles};

  & ${InputWrapper} {
    ${previewStyles};
    width: auto;
    display: flex;

    & input {
      ${previewStyles};
      width: 100%;
      padding: 4px 7px;
      &::placeholder {
        font-size: 13px;
      }
    }
  }

  & ${InputLabel} {
    font-size: 13px;
  }

  & ${SelectedCountryCodeContainer} {
    color: #9696b9;
    width: 50px;
    height: 30px;
    padding-top: 0;
    padding-left: 6px;
  }

  & ${PhoneMenuDisplayIcon} {
    top: 5px;
    right: 2px;
    width: 17px;
    height: 17px;
  }

  & ${PhoneMenu}, & ${PhoneLoaderWrapper} {
    display: none;
  }

  & ${PhoneFieldsWrapper} {
    display: flex;
    gap: 5px;
    height: 30px;
  }
`;
