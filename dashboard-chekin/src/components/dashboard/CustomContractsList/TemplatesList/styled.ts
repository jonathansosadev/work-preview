import styled from 'styled-components';
import Loader from '../../../common/Loader';
import GridSingleItem from '../../GridSingleItem';

export const GridSingleItemStyled = styled(GridSingleItem)``;

export const TemplateListLoader = styled(Loader)`
  margin: 30px auto;
`;

export const Subtitle = styled.div`
  margin-bottom: 26px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
`;

export const NewTemplateLink = styled.a`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #385cf8;
`;

export const Container = styled.div`
  display: grid;
  grid-auto-rows: 85px;
  grid-template-columns: repeat(auto-fill, 386px);
  gap: 12px 45px;
`;
