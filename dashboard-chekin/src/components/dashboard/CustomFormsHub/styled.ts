import styled from 'styled-components';
import BaseButton from '../Button';
import {Link} from 'react-router-dom';

export const AddButton = styled(BaseButton)`
  min-width: 190px;
  height: 53px;
  justify-content: center;
`;

export const FormsHeader = styled.header`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-top: 29px;
  margin-bottom: 20px;
`;

export const FormItem = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

export const FormName = styled.div`
  background-color: #fdfdfd;
  border: 1px solid #d7d8e4;
  border-radius: 3px;
  width: 796px;
  height: 67px;
  line-height: 67px;
  padding-left: 16px;
  box-sizing: border-box;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;

  &:hover {
    border-color: #385cf8;
  }
`;

export const DeleteFormButton = styled.button`
  padding: 0 5px;
  margin-left: 15px;
  border: none;
  background-color: transparent;
  outline: none;
  cursor: pointer;

  > img {
    width: 23px;
    height: 23px;
    border-radius: 4px;
    transition: box-shadow 0.15s ease-in-out 0s;
  }

  &:hover > img {
    box-shadow: rgba(15, 71, 119, 0.204) 0px 3px 3px;
  }

  &:active > img {
    opacity: 0.95;
  }
`;

export const LoaderWrapper = styled.div`
  margin-top: 60px;
  display: flex;
  justify-content: flex-start;
`;

export const AddFormLink = styled(Link)`
  display: inline-block;
  margin-top: 6px;
`;

export const FormItemsContainer = styled.div`
  max-height: 450px;
  width: 875px;
  overflow-y: auto;
`;
