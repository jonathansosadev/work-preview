import React from 'react';
import {HoverTooltipStyled, Wrapper} from './styled';

export type HoverTooltipProps = {
  children: Element | React.ReactNode;
  tooltipText?: string;
  widthTooltip?: number;
  className?: string;
};
const HoverTooltip = ({
  children,
  className,
  tooltipText,
  widthTooltip,
}: HoverTooltipProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  return (
    <Wrapper
      className={className}
      onMouseOver={(e: React.MouseEvent) => setIsTooltipOpen(true)}
      onMouseLeave={(e: React.MouseEvent) => setIsTooltipOpen(false)}
    >
      {children}
      <HoverTooltipStyled
        width={widthTooltip}
        className={'tooltip'}
        onClick={(e) => e.stopPropagation()}
        onMouseOver={(e) => e.stopPropagation()}
        open={isTooltipOpen}
      >
        {tooltipText}
      </HoverTooltipStyled>
    </Wrapper>
  );
};

export {HoverTooltip};
