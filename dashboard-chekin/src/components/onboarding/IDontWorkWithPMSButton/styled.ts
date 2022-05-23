import styled from 'styled-components';
import {Link} from 'react-router-dom';

export const Button = styled(Link)`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  text-align: center;
  display: block;
  text-transform: uppercase;
  text-decoration: none;
  color: #2960f5;
  padding-bottom: 50px;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }
`;
