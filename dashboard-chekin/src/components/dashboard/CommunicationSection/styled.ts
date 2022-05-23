import styled from 'styled-components';
import {Link} from 'react-router-dom';
import Button from '../Button';

export const HeaderWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, max-content);
  column-gap: 20px;
  align-items: center;
`;

export const Container = styled.div``;

export const Title = styled.div`
  margin-bottom: 20px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #161643;
`;

export const NewTemplateButton = styled(Button)`
  min-width: 190px;
  height: 53px;
  justify-content: center;
`;

export const RouterLink = styled(Link)`
  display: flex;
  width: 190px;
  margin-top: 27px;
`;
