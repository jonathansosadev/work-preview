import styled from 'styled-components';
import { baseContentStyle } from '../Modal';
import ModalButton from '../ModalButton';


export const contentStyle: React.CSSProperties = {
    ...baseContentStyle,
    width: 376,
    minHeight: 481,
    padding: '35px 20px 34px 33px',
    boxSizing: 'border-box',
    position: 'relative',
    textAlign: 'left',
    cursor: 'default',
    boxShadow: '0px 10px 10px #2148ff1a',
  };

export const ModalContent = styled.div`
  display:block
`


export const FirstText = styled.div`
  display:block;
  margin-top: 25px;
  text-align: center;

`

export const ValidationText = styled.div`
  display:block;
  margin-top: 25px;
  text-align: center;
`

export const Note =styled.div`
  font-weight: bold;
  display: inline;
`

export const SupegHogModalButton = styled(ModalButton)`
  margin-top: 20px;
`