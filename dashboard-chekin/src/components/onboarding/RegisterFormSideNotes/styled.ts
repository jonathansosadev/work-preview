import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 270px;
  position: absolute;
  left: 20px;
  top: 188px;
  cursor: default;
  z-index: -1;

  @media (max-width: 1260px) {
    display: none;
  }
`;

export const NoteContainer = styled.div`
  width: 250px;
  min-height: 63px;
  padding-left: 37px;
  position: relative;
  margin-bottom: 15px;
`;

export const NoteTitle = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  text-align: left;
  font-size: 18px;
  font-weight: 500;
  color: #161643;
`;

export const NoteDetails = styled(NoteTitle)`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 14px;
  font-weight: 300;
`;

export const NoteIcon = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  height: 23px;
  width: 23px;
`;
