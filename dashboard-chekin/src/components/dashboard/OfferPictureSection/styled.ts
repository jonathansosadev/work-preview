import styled from 'styled-components';
import FileInputButton from '../FileInputButton';

export const ButtonsWrapper = styled.div`
  display: grid;
  max-width: fit-content;
  grid-template-columns: 1fr 1fr;

  > * {
    margin-right: 10px;
  }
`;

export const StyledFileInputButton = styled(FileInputButton)`
  justify-content: center;
  width: 100%;
`;

export const Image = styled.img`
  margin-bottom: 25px;
  max-width: 300px;
  max-height: 150px;
  box-shadow: 0 3px 4px #0000001a;
  border: 1px solid #505077;
  border-radius: 5px;
`;

export const FileSizeText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 13px;
  color: #6b6b95;
  margin-top: 8px;
`;
