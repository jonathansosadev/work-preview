import styled from 'styled-components';
import Input from '../Input';
import Switch from '../Switch';
import {ContentWrapper} from '../Tooltip/styled';
import {BaseButton} from '../../../styled/common';

export const Container = styled.div`
  width: 670px;
  height: 91px;
  border: 1px solid #d7d8e4;
  padding: 20px 40px 20px;
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 295px 1fr 83px;
  grid-template-rows: 1fr;
  align-items: center;
  box-sizing: border-box;
  border-radius: 3px;
  margin-bottom: 10px;
  position: relative;
  background-color: white;
`;

export const MandatoryLabel = styled.div`
  background: #f0f0f8;
  border: 1px solid #d7d8e4;
  border-radius: 3px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #9696b9;
  font-size: 16px;
  padding: 3px 14px;
  margin-left: 65px;
  min-width: 104px;
  height: 26px;
  text-align: center;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  user-select: none;
`;

export const StyledInput = styled(Input)`
  min-height: auto;
`;

export const Dots = styled.div`
  position: absolute;
  top: 6px;
  right: 2px;
  padding: 10px;

  & > img {
    user-select: none;
    width: 23px;
    height: 14px;
  }
`;

export const StyledSwitch = styled(Switch)`
  margin-left: 65px;
`;

export const DeleteButton = styled(BaseButton)`
  width: 30px;
  height: 30px;
  border: 1px solid #d7d8e4;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  border-radius: 2px;

  > img {
    width: 12px;
    height: 16px;
  }
`;

export const EditButton = styled(DeleteButton)`
  > img {
    width: 16px;
    height: 16px;
  }
`;

export const CustomFieldsTooltipTrigger = styled.div`
  color: #385cf8;
  font-size: 13px;
  position: absolute;
  right: 0;
  top: 2px;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const CustomFieldsTooltipWrapper = styled.div`
  ${ContentWrapper} {
    left: 103%;
  }
`;

export const GuestLeaderIconTooltipTrigger = styled.img`
  margin-left: 20px;
  margin-right: 16px;
  width: 35px;
  height: 14px;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const GuestLeaderTooltipWrapper = styled.div`
  ${ContentWrapper} {
    left: 72%;
    top: -45px;
  }
`;

export const DefaultFieldContentWrapper = styled.div`
  display: flex;
  align-items: center;
`;
