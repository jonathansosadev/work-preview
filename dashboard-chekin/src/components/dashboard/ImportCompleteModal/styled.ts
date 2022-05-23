import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 34px 21px 41px 20px;
`;

export const StyledIcon = styled.img``;

export const Title = styled.div`
  padding: 17px 0 0 0;

  font-size: 20px;
  font-style: normal;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
`;

export const Warning = styled.div`
  padding: 20px 0 0 0;
  width: 330px;
  font-style: normal;
  font-size: 16px;
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
`;

export const ImportantText = styled.span`
  display: inline-block;
  font-style: normal;
  font-size: 16px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  max-width: 330px;
  margin-right: 5px;
`;

export const ButtonWrapper = styled.div<{isMessageEmpty: boolean}>`
  padding: ${(props) => (!props.isMessageEmpty ? '93px 0 0 0;' : '29px 0 0 0;')}
  text-align: center;
`;

export const LoaderWrapper = styled.div`
  padding: 30px 0 15px;
`;
