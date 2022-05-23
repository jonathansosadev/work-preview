import styled from 'styled-components';
import ModalButton from '../ModalButton';

export const SelectPropsModalContent = styled.div`
  width: 330px;
  margin-top: 35px;
  margin-bottom: 40px;
`;

export const SubmitButton = styled(ModalButton)`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;

  .label {
    text-transform: uppercase;
  }
`;

export const CancelButton = styled(SubmitButton)`
  margin-bottom: 20px;
`;

export const OrSelectText = styled.span`
  margin-bottom: 25px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 21px;
  margin-bottom: 18px;
`;

export const SearchIcon = styled.img`
  height: 21px;
  width: 21px;
  margin-right: 12px;
`;

export const SearchInput = styled.input`
  align-self: flex-end;
  height: 21px;
  padding: 0;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 18px;
  border: none;
  outline: none;

  &::placeholder {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 18px;
    color: #9696b9;
  }
`;
