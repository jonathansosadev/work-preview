import styled from 'styled-components';

type WrapperProps = {
  disabled?: boolean;
};
export const Label = styled.div`
  margin-left: 12px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #161643;
  user-select: none;
`;

export const Wrapper = styled.div<WrapperProps>`
  display: inline-flex;
  align-items: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  & .react-switch-handle {
    box-shadow: 0 0 3px #0000002c;
    background: transparent
      radial-gradient(closest-side at 50% 50%, #ffffff 0%, #f2f2f2 100%) 0 0 no-repeat
      padding-box !important;
  }
`;
