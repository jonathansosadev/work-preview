import React from 'react';
import ReactLoader from 'react-loader-spinner';
import {Wrapper} from './styled';

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
};

const defaultProps: LoaderProps = {
  type: 'ThreeDots',
  height: 30,
  width: 30,
  color: '#EEEEEE',
  label: '',
};

function Loader({height, width, type, color, label, ...props}: LoaderProps) {
  if (label) {
    return (
      <Wrapper>
        <ReactLoader type={type} color={color} height={height} width={width} {...props} />
        <div>{label}</div>
      </Wrapper>
    );
  }

  return (
    <ReactLoader type={type} color={color} height={height} width={width} {...props} />
  );
}

Loader.defaultProps = defaultProps;
export {Loader};
