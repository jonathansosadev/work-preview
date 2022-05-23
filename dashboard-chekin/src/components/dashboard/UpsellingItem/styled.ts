import styled from 'styled-components';
import AnimatedButton from '../AnimatedButton';
import Loader from '../../common/Loader';

export const Container = styled.div`
  border-left: 0.5px solid rgb(210 211 225);
  max-width: 200px;
  padding: 0 50px;
`;

export const ContainerUpsellingLastItem = styled(Container)`
  max-width: none;
`;

export const TitleLastItem = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  word-break: break-word;
`;

export const Title = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  margin-bottom: 10px;
  word-break: break-word;
`;

export const SubtitleLastItem = styled.h2`
  font-size: 46px;
  margin: 8px 0;
  font-family: ProximaNova-Medium, sans-serif;
  word-break: break-word;
`;

export const LoaderTotalRevenueStyled = styled(Loader)`
  display: flex;
  justify-content: center;
  padding-top: 10px;
`;

export const Currency = styled.span`
  font-size: 16px;
  margin-left: 3px;
`;

export const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

export const LiItem = styled.li`
  word-break: break-word;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  color: #9696b9;
  margin-bottom: 12px;
`;

export const GroupButtons = styled.div`
  margin-top: 10px;
  display: flex;
  & button {
    width: auto;
    height: 27px;
    min-width: auto;
  }
`;

export const BlockContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const AnimatedButtonStyled = styled(AnimatedButton)`
  margin-right: 10px;
`;
