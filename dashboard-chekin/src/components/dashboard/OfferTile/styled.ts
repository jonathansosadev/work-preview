import styled from 'styled-components';
import Button from '../Button';

const minHeight = '163px';

export const Container = styled.div<{backgroundURL: string}>`
  width: 246px;
  min-height: ${minHeight};
  box-shadow: 0 0 10px #00000033;
  border-radius: 6px;
  background: url(${(props) => props.backgroundURL}) center center no-repeat;
  background-size: cover;
  overflow-x: hidden;
`;

export const Content = styled.div`
  padding: 66px 13px 15px;
  box-sizing: border-box;
  background: linear-gradient(transparent, rgba(22, 22, 66, 0.77));
  min-height: ${minHeight};
`;

export const Title = styled.div`
  color: #ffffff;
  text-shadow: 0 3px 4px #0000006f;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 20px;
  min-height: 24px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Description = styled(Title)`
  font-size: 14px;
  margin-bottom: 10px;
  text-shadow: 0 3px 4px #0000009f;
  min-height: 17px;
`;

export const PriceAndButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Price = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 28px;
  color: #ffffff;
  max-width: 120px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  & .currency {
    font-size: 13px;
  }
`;

export const BookButton = styled(Button)`
  justify-content: center;
  min-width: auto;
  padding: 0 22px;
  height: 30px;
  pointer-events: none;
`;
