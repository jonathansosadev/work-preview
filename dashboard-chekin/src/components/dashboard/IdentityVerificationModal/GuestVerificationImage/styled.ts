import styled from 'styled-components';
import {IconButton} from '../../../../styled/buttons';

export const GroupButton = styled.div`
  display: flex;
  column-gap: 10px;
`;

export const IconButtonStyled = styled(IconButton)`
  border: 1px solid #2148ff;
  border-radius: 6px;
  width: 19px;
  height: 19px;
`;

type GuestImageProps = {
  url?: string;
  isApproved: boolean;
};
export const GuestImage = styled.div<GuestImageProps>`
  width: 281px;
  height: 280px;
  margin-bottom: 16px;
  border-radius: 6px;
  border: 5px solid ${(props) => (props.isApproved ? '#35E5BC' : '#FF2467')};
  background: center / cover no-repeat url(${(props) => props.url});
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  & p {
    margin: 0;
    font-family: ProximaNova-Regular, sans-serif;
  }
`;
