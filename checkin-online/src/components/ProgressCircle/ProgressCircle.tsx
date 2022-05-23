import React from 'react';
import {animated, config as springConfig, useSpring} from 'react-spring';
import {
  Figure,
  Svg,
  AnimatedText,
  ProgressSymbol,
  Text,
  ErrorText,
  WarningText,
} from './styled';

const CONFIG = {
  viewBox: '0 0 36 36',
  x: '18',
  y: '18',
  radio: '15.91549430918954',
  strokeWidth: '1',
  fill: '#161643',
  stroke: '#15153c',
};

const COLORS = {
  red: '#b41c52',
  green: '#35E5BC',
  orange: '#FFC400',
};

type ProgressCircleProps = {
  progress: number;
  label?: string;
  config?: typeof CONFIG;
  className?: string;
  errorText?: string;
  warningText?: string;
};

const defaultProps: ProgressCircleProps = {
  progress: 0,
  className: undefined,
  label: '',
  config: CONFIG,
  errorText: '',
  warningText: '',
};

function ProgressCircle({
  progress,
  className,
  label,
  config,
  errorText,
  warningText,
}: ProgressCircleProps) {
  const spring = useSpring({
    number: progress,
    dashArray: `${progress} ${100 - progress}`,
    from: {
      number: 0,
      dashArray: '0 100',
    },
    config: springConfig.molasses,
  });
  const actualConfig = config || CONFIG;
  const hasText = errorText || warningText;

  return (
    <Figure className={className}>
      <Svg preserveAspectRatio="xMidYMid meet" viewBox={actualConfig.viewBox}>
        <circle
          fill={actualConfig.fill}
          stroke={actualConfig.stroke}
          cx={actualConfig.x}
          cy={actualConfig.y}
          r={actualConfig.radio}
          strokeWidth={actualConfig.strokeWidth}
        />
        <animated.circle
          className="path"
          fill="transparent"
          strokeDashoffset="25"
          cx={actualConfig.x}
          cy={actualConfig.y}
          r={actualConfig.radio}
          stroke={spring.number
            .interpolate({
              range: [0, 65, 95],
              output: [COLORS.red, COLORS.orange, COLORS.green],
            } as any)
            .interpolate(c => c as string)}
          strokeDasharray={spring.dashArray}
          strokeWidth={actualConfig.strokeWidth}
        />
        <g textAnchor="middle">
          {hasText ? (
            <text x="50%" y="56%">
              {errorText ? (
                <ErrorText>{errorText}</ErrorText>
              ) : (
                <WarningText>{warningText}</WarningText>
              )}
            </text>
          ) : (
            <>
              <text x="50%" y="60%">
                <AnimatedText x="52%" y="58%">
                  {spring.number.interpolate(n => n.toFixed(0))}
                </AnimatedText>
                <ProgressSymbol>%</ProgressSymbol>
              </text>
              <Text x="50%" y="68%">
                {label}
              </Text>
            </>
          )}
        </g>
      </Svg>
    </Figure>
  );
}

ProgressCircle.defaultProps = defaultProps;
export {ProgressCircle};
