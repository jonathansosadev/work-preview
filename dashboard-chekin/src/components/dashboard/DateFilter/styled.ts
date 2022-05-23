import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 150px;
  width: auto;
  height: 100%;
  cursor: pointer;
`;

export const Filter = styled.div`
  width: auto;
  box-sizing: border-box;
  padding: 1px 0 0 0;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const IconsBlock = styled.div`
  display: flex;
  align-items: center;
`;

export const RemoveIcon = styled.img<{isVisible: boolean}>`
  display: ${(props) => (props.isVisible ? 'block' : 'none')};
  height: 15px;
  width: 15px;
  margin: auto 5px auto 15px;
  border-radius: 3px;
  cursor: pointer;

  &:active {
    opacity: 0.95;
  }

  &:hover {
    box-shadow: 0 3px 3px #0f477734;
    transition: box-shadow 0.15s ease-in-out;
  }
`;

export const CalendarIcon = styled.img`
  width: 21px;
  height: 21px;
  box-shadow: 0 3px 4px #0002032b;
  border-radius: 4px;
  top: 2px;
`;

export const ArrowSpan = styled.span`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 18px;
  color: #161643;
  pointer-events: none;
  margin: 0 8px 6px;
`;
