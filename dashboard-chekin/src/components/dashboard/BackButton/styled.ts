import styled from 'styled-components';

export const Button = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  padding: 3px 5px 3px 0;
  transition: all 0.15s ease-in-out;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  user-select: none;


  & > img {
    width: 18px;
    height: 18px;
    margin-right: 6px;
  }
`;
