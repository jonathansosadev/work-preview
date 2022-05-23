import styled from 'styled-components';

export const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

export enum IconSize {
  Big = 'big',
}

export type LabelIconProps = {
  size?: IconSize;
};

export const LabelIcon = styled.img<LabelIconProps>`
  ${(props) => {
    switch (props.size) {
      case IconSize.Big:
        return `
          width: 16px;
          height: 16px;
          margin-right: 11px;
        `;
      default:
        return `
          width: 12px;
          height: 12px;
          margin-right: 8px;
        `;
    }
  }}
`;

export const LabelText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #ffffff;
`;
