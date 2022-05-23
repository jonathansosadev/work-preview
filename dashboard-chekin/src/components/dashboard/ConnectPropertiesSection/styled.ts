import styled from 'styled-components';
import Button from '../Button';

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  font-size: 21px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const DoneButton = styled(Button)`
  width: 148px;
  border: 1px solid #385cf8;
  margin-left: auto;
  div {
    margin: 0 auto;
  }
`;

export const TextInfoWrapper = styled.div`
  margin: 57px 0 25px;
`;

export const TextInfoItem = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 5px;
  }
`;

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonLabelIcon = styled.img`
  height: 12px;
  width: 12px;
  margin-right: 11px;
  margin-left: 5px;
`;

export const ButtonLabelText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #161643;
  margin-right: 6px;
`;

export const DotsWrapper = styled.div`
  margin: 30px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 72px;
`;

export const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eeeeee;
`;

export const ListItemHeaderText = styled.div`
  font-size: 15px;
  font-family: Bold, sans-serif;
  text-decoration: underline;
`;

export const LeftListItem = styled.div`
  min-width: 250px;
  margin-right: 164px;
  color: #161643;
`;

export const CenterListItem = styled.div`
  min-width: 264px;
  margin-right: 103px;
  display: flex;
  align-items: center;
`;

export const ListItem = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 70px;

  &:last-child {
    margin-bottom: 33px;
  }

  &:last-child {
    margin-bottom: 50px;
  }
`;

export const TooltipWrapper = styled.div`
  margin-left: 8px;
`;

export const PropertyNameText = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
`;

export const TooltipContentItem = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #dee4ed;
  margin-bottom: 43px;
`;

export const BottomDoneWrapper = styled.div`
  width: fit-content;
`;

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
