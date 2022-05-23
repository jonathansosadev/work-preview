import React from 'react';
import ReactLoader from 'react-loader-spinner';
import {Wrapper} from './styled';

enum LABEL_PLACEMENT {
  right,
  left,
}

type LoaderProps = {
  height?: number;
  width?: number;
  type?:
    | 'ThreeDots'
    | 'TailSpin'
    | 'Audio'
    | 'BallTriangle'
    | 'Bars'
    | 'Circles'
    | 'Grid'
    | 'Hearts'
    | 'Oval'
    | 'Puff'
    | 'Rings'
    | 'Watch'
    | 'RevolvingDot'
    | 'Triangle'
    | 'Plane'
    | 'MutatingDots'
    | 'None'
    | 'NotSpecified';
  color?: string;
  label?: string;
  className?: string;
  labelPlacement?: LABEL_PLACEMENT;
};

const defaultProps: LoaderProps = {
  type: 'ThreeDots',
  height: 30,
  width: 30,
  color: '#EEEEEE',
  label: '',
  labelPlacement: LABEL_PLACEMENT.right,
};

function Loader({
  height,
  width,
  type,
  color,
  label,
  className,
  labelPlacement,
  ...props
}: LoaderProps) {
  if (label) {
    return (
      <Wrapper className={className}>
        {labelPlacement === LABEL_PLACEMENT.right ? (
          <>
            <ReactLoader
              type={type}
              color={color}
              height={height}
              width={width}
              {...props}
            />
            <div>{label}</div>
          </>
        ) : (
          <>
            <div>{label}</div>
            <ReactLoader
              type={type}
              color={color}
              height={height}
              width={width}
              {...props}
            />
          </>
        )}
      </Wrapper>
    );
  }

  return (
    <div className={className}>
      <ReactLoader type={type} color={color} height={height} width={width} {...props} />
    </div>
  );
}

Loader.defaultProps = defaultProps;
export {Loader, LABEL_PLACEMENT};
