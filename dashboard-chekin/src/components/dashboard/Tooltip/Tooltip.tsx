import React from 'react';
import {ReactEntity} from '../../../utils/types';
import closeIcon from '../../../assets/close.svg';
import blueCloseIcon from '../../../assets/close-blue.svg';
import {useOutsideClick} from '../../../utils/hooks';
import {CloseIcon, ContentWrapper, Trigger, Wrapper} from './styled';

const DEFAULT_TRIGGER = '(?)';

export type TooltipAlignment = 'right' | 'left' | 'bottom';

type TooltipProps = {
  content: ReactEntity;
  trigger?: ReactEntity;
  className?: string;
  isMouseOver?: boolean;
  position?: TooltipAlignment;
};

const defaultProps: TooltipProps = {
  content: '',
  trigger: DEFAULT_TRIGGER,
  className: undefined,
  isMouseOver: false,
  position: 'right',
};

function Tooltip({content, trigger, className, isMouseOver, position}: TooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState<TooltipAlignment>(
    position || 'right',
  );

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const toggleShowTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip((currentShowTooltip) => !currentShowTooltip);
  };

  const closeTooltip = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCloseButtonHovered(false);
    setShowTooltip(false);
  }, []);
  useOutsideClick(wrapperRef, closeTooltip);
  React.useLayoutEffect(() => {
    if (showTooltip && contentRef.current) {
      const isOverflown =
        contentRef.current.getBoundingClientRect().right > window.innerWidth;

      if (isOverflown) {
        setTooltipPosition('left');
      }
    }
  }, [showTooltip]);

  return (
    <Wrapper
      ref={wrapperRef}
      className={`${className} tooltip`}
      isMouseOver={isMouseOver}
    >
      <ContentWrapper
        ref={contentRef}
        alignment={tooltipPosition}
        show={showTooltip && Boolean(content)}
        isMouseOver={isMouseOver}
        className="content"
      >
        {!isMouseOver && (
          <CloseIcon
            alt="Cross"
            onMouseOver={() => setIsCloseButtonHovered(true)}
            onMouseOut={() => setIsCloseButtonHovered(false)}
            src={isCloseButtonHovered ? blueCloseIcon : closeIcon}
            onClick={closeTooltip}
          />
        )}
        {content}
      </ContentWrapper>
      <Trigger
        className={'tooltip_trigger'}
        onClick={toggleShowTooltip}
        active={showTooltip}
      >
        {trigger}
      </Trigger>
    </Wrapper>
  );
}

Tooltip.defaultProps = defaultProps;
export {Tooltip};
