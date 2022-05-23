import styled from 'styled-components';
import OfferItems from '../OffersItems';

export const Grid = styled.div`
  display: grid;
  grid-template-areas:
    'counter filters'
    'list list';
`;

export const CounterArea = styled.div<{blue: boolean}>`
  color: ${(props) => (props.blue ? '#385cf8' : '#6b6b95')};
  grid-area: counter;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  padding-right: 10px;
  transition: color 0.12s ease-in-out;
`;

export const FiltersArea = styled.div`
  grid-area: filters;
`;

export const ListArea = styled.div`
  grid-area: list;
  margin-top: 29px;
`;

export const LoaderWrapper = styled.div`
  margin-top: 120px;
  display: flex;
  grid-column: 1/3;
  justify-content: center;
`;

export const StyledOfferItems = styled(OfferItems)``;
