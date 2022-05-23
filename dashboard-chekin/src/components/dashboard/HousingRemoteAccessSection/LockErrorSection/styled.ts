import styled from 'styled-components';
import {baseContentStyle} from '../../Modal';
import ModalButton from '../../ModalButton';

export const contentStyle = {
  ...baseContentStyle,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '50vw',
  minHeight: 200,
};

export const LockErrorContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60%;
  height: 100%;
  padding: 20px 0;
`;

export const Text = styled.div`
  margin-bottom: 25px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 18px;
  text-align: center;
  color: #161643;
`;

export const ButtonsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(170px, 1fr));
  column-gap: 50px;
`;

export const CustomModalButton = styled(ModalButton)`
  flex-shrink: 0;
`;
