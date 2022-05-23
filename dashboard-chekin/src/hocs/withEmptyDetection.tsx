import React from 'react';
import {Control, useWatch} from 'react-hook-form';

type EmptyDetectionProps = {name: string; control: Control<any>};
const withEmptyDetection = <TElement, TProps extends Record<any, any>>(
  Component: React.ElementType,
) =>
  React.forwardRef<TElement, TProps & EmptyDetectionProps>(
    (props: TProps & EmptyDetectionProps, ref) => {
      const value = useWatch({
        name: props.name,
        control: props.control,
      });
      const isEmpty = typeof props.empty === 'undefined' ? !value : props.empty;

      return <Component empty={isEmpty ?? props.readOnly} {...props} ref={ref} />;
    },
  );

export {withEmptyDetection};
