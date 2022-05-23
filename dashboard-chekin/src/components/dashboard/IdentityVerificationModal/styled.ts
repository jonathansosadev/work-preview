import styled from 'styled-components';
import Button from '../Button';

export const ModalHeader = styled.div<{
  isDocumentAndSelfie: boolean;
}>`
  padding: 31px 0
    ${(props) => {
      return props.isDocumentAndSelfie ? '20px' : '25px';
    }};
`;

export const ModalTitle = styled.div`
  font-size: 18px;
  margin-bottom: 16px;
  font-family: ProximaNova-Bold, sans-serif;
`;

export const ModalText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
`;

export const ModalContent = styled.div`
  display: flex;
  padding: 0 56px;
  column-gap: 31px;
  min-width: 500px;
`;

export const ModalFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 43px 0;
`;

export const ButtonApprove = styled(Button)`
  height: 48px;
  padding: 0 42px;
  font-size: 16px;
`;

export const ApprovedWord = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 19px;

  & img {
    position: relative;
    top: 2px;
    width: 17px;
    height: 17px;
  }
`;

export const GroupButtons = styled.div`
  margin-top: 37px;
  display: flex;
`;

export const Text = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
  max-width: 244px;
  margin: 20px auto 0;
  box-sizing: border-box;
  text-align: center;
  cursor: default;

  & > b {
    font-family: ProximaNova-Bold, sans-serif;
    font-weight: normal;
  }
`;
