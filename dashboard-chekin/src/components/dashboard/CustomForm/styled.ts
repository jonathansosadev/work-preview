import styled, {css} from 'styled-components';
import Button from '../Button';
import FormHeader from '../FormHeader';
import {BaseButton} from '../../../styled/common';
import ModalButton from '../ModalButton';
import removeIcon from '../../../assets/remove.svg';

export const Header = styled(FormHeader)`
  margin-top: 0;
`;

export const PageTitle = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const Subsection = styled.section`
  margin: 40px 0;
`;

export const SectionTitle = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  margin-bottom: 25px;
`;

export const FieldWrapper = styled.div`
  margin-bottom: 25px;
`;

export const SectionDescription = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  margin-top: 20px;
  margin-bottom: 25px;
  max-width: 670px;
  position: relative;
  padding-right: 82px;
  box-sizing: border-box;
`;

export const PlusButton = styled(BaseButton)`
  background: #ffffff;
  border: 1px solid #d7d8e4;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  right: 0;
  bottom: 0;
  position: absolute;
  width: 40px;
  height: 40px;

  ${(props) =>
    !props.disabled &&
    css`
      &:hover {
        box-shadow: 0 4px 4px #2148ff1a;
      }
    `}

  > img {
    width: 14px;
    height: 14px;
  }
`;

export const AddCustomFieldButton = styled(Button)`
  min-width: 203px;
  margin-top: 26px;
`;

export const SaveButtonWrapper = styled.div`
  margin-top: 40px;
  border-top: 1px solid #d7d8e4;
  padding-top: 40px;
`;

export const SaveButton = styled(Button)`
  min-width: 247px;
  height: 54px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 18px;
  justify-content: center;

  img {
    width: 19px;
    height: 19px;
  }
`;

export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 19px;
`;

export const RetryButton = styled(Button)`
  min-height: auto;
  min-width: auto;
  margin-top: 15px;
`;

export const NotFoundImage = styled.img`
  height: 50px;
  width: 50px;
  margin-bottom: 30px;
`;

export const SelectPropertyButton = styled(ModalButton)`
  width: max-content;
  font-size: 15px;
`;

export const SelectedPropsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 220px);
  grid-auto-rows: 38px;
  gap: 10px;
  margin-bottom: 30px;
`;

export const SelectedPropItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 8px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  background-color: #f0f0f8;
  border: 1px solid #acacd5;
  border-radius: 4px;
  margin: 5px;
`;

export const SelectedPropText = styled.span`
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TinyDeleteBtn = styled.button`
  width: 15px;
  min-width: 15px;
  height: 15px;
  background: #9696b9 url(${removeIcon}) no-repeat 50%/100%;
  border-radius: 3px;
`;
