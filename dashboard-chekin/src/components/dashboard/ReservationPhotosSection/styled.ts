import styled from 'styled-components';

export const HeaderCell = styled.th`
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 13px;
  padding: 0 5px;
  text-align: center;
  font-weight: normal;
`;

export const NameCell = styled.td`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  padding: 5px 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
`;

export const Table = styled.table`
  ${HeaderCell} {
    :nth-child(1) {
      width: 200px;
      text-align: left;
    }
  }
`;

export const ButtonTD = styled.td`
  text-align: center;
`;

export const IconButton = styled.button`
  height: 20px;
  width: 20px;
  padding: 5px;
  outline: none;
  border: none;
  background-color: transparent;
  box-sizing: content-box;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const GuestModalContent = styled.div`
  margin: 33px 69px;
`;

export const ModalContent = styled.div`
  display: flex;
  max-width: 867px;
  flex-wrap: wrap;
  box-sizing: border-box;
  padding: 37px 4px 36px;
  text-align: center;
  position: relative;
`;

type GuestImageProps = {
  url?: string;
};

export const GuestImage = styled.div<GuestImageProps>`
  width: 281px;
  height: 280px;
  margin-bottom: 16px;
  border-radius: 20px;
  background: center / cover no-repeat url(${(props) => props.url});
`;

export const ImageName = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  color: #161643;
  margin-bottom: 16px;
`;

export const DownloadButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: #385cf8;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;
