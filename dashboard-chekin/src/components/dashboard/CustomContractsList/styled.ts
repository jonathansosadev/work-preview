import styled from 'styled-components';
import {Link} from 'react-router-dom';
import Button from '../Button';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const NewTemplateButton = styled(Button)`
  min-width: 211px;
  height: 48px;
  justify-content: center;
`;

export const RouterLink = styled(Link)`
  display: flex;
  width: 190px;
  margin-top: 27px;
`;
