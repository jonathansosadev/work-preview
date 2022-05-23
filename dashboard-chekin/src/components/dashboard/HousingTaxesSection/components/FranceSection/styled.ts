import styled from 'styled-components';
import Selectors from '../../../Selectors';

export const Section = styled.div`
  display: flex;
  grid-gap: 42px;
  margin-top: 29px;
  flex-wrap: wrap;
`;

export const FieldColumn = styled.div``;

export const FieldTitle = styled.div`
  margin-bottom: 15px;
  font-weight: 500;
  font-size: 17px;
`;

export const SelectorsStyled = styled(Selectors)`
  width: 180px;
  & > label {
    width: 90px;
    justify-content: center;
  }
`;
