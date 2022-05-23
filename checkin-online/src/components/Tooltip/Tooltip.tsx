import React from 'react';
import Popup from 'reactjs-popup';
import {contentStyle, overlayStyle, Wrapper} from './styled';

type TooltipProps = {
  children: any;
  position?:
    | 'center center'
    | 'top left'
    | 'top center'
    | 'top right'
    | 'right top'
    | 'right center'
    | 'right bottom'
    | 'bottom left'
    | 'bottom center'
    | 'bottom right'
    | 'left top'
    | 'left center'
    | 'left bottom';
  label?: React.ReactNode | JSX.Element | string | null;
  className?: string;
};

const defaultProps: Partial<TooltipProps> = {
  position: 'center center',
  label: '',
  className: undefined,
  children: null,
};

function Tooltip({position, label, children, className}: TooltipProps) {
  return (
    <Wrapper className={className}>
      <Popup
        closeOnDocumentClick
        closeOnEscape
        contentStyle={contentStyle}
        overlayStyle={overlayStyle}
        trigger={children}
        position={position}
        on="hover"
      >
        <>{label}</>
      </Popup>
    </Wrapper>
  );
}

Tooltip.defaultProps = defaultProps;
export {Tooltip};
