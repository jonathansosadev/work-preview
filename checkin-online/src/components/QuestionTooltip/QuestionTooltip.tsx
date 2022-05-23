import React from 'react';
import closeIcon from '../../assets/close.svg';
import blueCloseIcon from '../../assets/close-blue.svg';
import {useOutsideClick} from '../../utils/hooks';
import {CloseIcon, ContentWrapper, Trigger, Wrapper} from './styled';

const DEFAULT_TRIGGER = '(?)';

export type TooltipAlignment = 'right' | 'left' | 'bottom' | 'top center' | 'center';

type TooltipProps = {
  content: React.ReactNode | JSX.Element | string;
  trigger?: React.ReactNode | JSX.Element | string;
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

function QuestionTooltip({
  content,
  trigger,
  className,
  isMouseOver,
  position,
}: TooltipProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [isCloseButtonHovered, setIsCloseButtonHovered] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState<TooltipAlignment>(
    position || 'right',
  );

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const toggleShowTooltip = () => {
    setShowTooltip(currentShowTooltip => !currentShowTooltip);
  };

  const closeTooltip = React.useCallback(() => {
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

  React.useEffect(() => {
    position && setTooltipPosition(position);
  }, [position]);

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
      <Trigger onClick={toggleShowTooltip} active={showTooltip}>
        {trigger}
      </Trigger>
    </Wrapper>
  );
}

QuestionTooltip.defaultProps = defaultProps;
export {QuestionTooltip};
