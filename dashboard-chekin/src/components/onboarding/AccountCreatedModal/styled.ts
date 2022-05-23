import styled from 'styled-components';

export const PromptText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 15px;
  color: rgb(45, 80, 142);
  margin: 14px 25px 24px;
  text-align: center;
  overflow-y: auto;
  max-height: 121px;
`;
export const PromptTitle = styled.div`
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 19px;
  color: #182e56;
  margin-top: 20px;
  text-transform: uppercase;
`;

export const BoldText = styled.div`
  font-weight: bold;
`;

export const ModalContent = styled.div`
  text-align: center;
`;

export const SuccessImgWrapper = styled.div`
  text-align: center;

  & > img {
    width: 90px;
  }
`;
