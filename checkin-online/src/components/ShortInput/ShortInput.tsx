import React from 'react';
import {StyledShortInput} from './styled';
import {InputProps} from '../Input/Input';

const ShortInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <StyledShortInput ref={ref} {...props} />;
});

export {ShortInput};
