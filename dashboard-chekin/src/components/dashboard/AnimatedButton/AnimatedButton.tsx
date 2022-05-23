import React, {useRef, useState, MouseEvent} from 'react';
import {animated, useChain, useSpring, useSpringRef, useSprings} from 'react-spring';
import {useTranslation} from 'react-i18next';
import arrowIcon from '../../../assets/union-arrow.svg';
import surfaceUpIcon from '../../../assets/surface-up.svg';
import {Button, ButtonProps} from '../Button/Button';
import {
  BlockAnimation,
  ImageArrowAnimation,
  IconsBlockAnimation,
  ButtonWrapper,
  Title,
} from './styled';

const animationDurationMs = 850;

export type AnimatedButtonProps = ButtonProps;

function AnimatedButton({onClick, ...props}: AnimatedButtonProps) {
  const {t} = useTranslation();
  const [isAnimation, setIsAnimation] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const imagesAnimatedStyles = [
    {top: -2, left: 0},
    {top: -30, left: 30},
    {top: -10, left: 55},
  ];

  const blockAnimatedRef = useSpringRef();
  const blockAnimatedSpring = useSpring({
    from: {
      opacity: 0,
      display: 'none',
    },
    to: {opacity: isAnimation ? 1 : 0, display: isAnimation ? 'flex' : 'none'},
    immediate: !isAnimation,
    ref: blockAnimatedRef,
  });

  const iconAnimatedRef = useSpringRef();
  const iconAnimatedSpring = useSpring({
    from: {
      transform: 'rotate(0.25turn)',
    },
    to: {transform: isAnimation ? 'rotate(0turn)' : 'rotate(0.25turn)'},
    ref: iconAnimatedRef,
    immediate: !isAnimation,
  });

  const arrowsAnimatedRef = useSpringRef();
  const arrowsAnimatedSprings = useSprings(
    imagesAnimatedStyles.length,
    imagesAnimatedStyles.map((item) => ({
      from: {top: 8, left: 30, opacity: 0},
      to: {
        top: isAnimation ? item.top : 8,
        left: isAnimation ? item.left : 30,
        opacity: isAnimation ? 1 : 0,
      },
      immediate: !isAnimation,
    })),
  );

  useChain(
    isAnimation
      ? [blockAnimatedRef, iconAnimatedRef, arrowsAnimatedRef]
      : [blockAnimatedRef, iconAnimatedRef, arrowsAnimatedRef],
    [0, 0.2, 0.4],
  );

  const handleClickApprove = (e: MouseEvent<HTMLButtonElement>) => {
    setIsAnimation(true);
    timeout.current = setTimeout(() => {
      setIsAnimation(false);
      if (onClick) onClick(e);
    }, animationDurationMs);
  };

  React.useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <ButtonWrapper style={{position: 'relative'}}>
      <BlockAnimation style={blockAnimatedSpring}>
        <IconsBlockAnimation>
          {arrowsAnimatedSprings.map((arrowItem, idx) => (
            <ImageArrowAnimation style={arrowItem} src={arrowIcon} alt="" key={idx} />
          ))}
          <animated.img src={surfaceUpIcon} style={iconAnimatedSpring} alt="" />
        </IconsBlockAnimation>
        <Title>{t('approved') + '!'}</Title>
      </BlockAnimation>
      <Button {...props} onClick={handleClickApprove} />
    </ButtonWrapper>
  );
}

export {AnimatedButton};
