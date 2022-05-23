import React from 'react';
import Popup from 'reactjs-popup';
import blueQuestionMark from '../../../assets/blue_question_mark.svg';
import {contentStyle, TooltipTrigger, Wrapper} from './styled';

type TooltipProps = {
  children: any;
  label: any;
  position:
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
  [key: string]: any;
};

const defaultProps: TooltipProps = {
  children: <TooltipTrigger src={blueQuestionMark} alt="Question mark" />,
  position: 'center center',
  label: '',
};

function Tooltip({position, label, children, className, ...props}: TooltipProps) {
  return (
    <Wrapper className={className}>
      <Popup
        closeOnDocumentClick
        closeOnEscape
        contentStyle={contentStyle}
        trigger={children}
        position={position}
        on="hover"
        {...props}
      >
        {label}
      </Popup>
    </Wrapper>
  );
}

Tooltip.defaultProps = defaultProps;
export {Tooltip};
