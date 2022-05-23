import React from 'react';
import Tooltip from '../../Tooltip';
import {FlexWrapper, Title} from './styled';
import {ReactEntity} from '../../../../utils/types';

type SubsectionProps = {
  label: string;
  children: React.ReactNode;
  tooltip?: ReactEntity;
  isVisible?: boolean;
};

function Subsection({label, tooltip, children, isVisible = true}: SubsectionProps) {
  if (!isVisible) return <></>;
  return (
    <div>
      <FlexWrapper>
        <Title className="label">{label}</Title>
        {Boolean(tooltip) && <Tooltip content={tooltip} />}
      </FlexWrapper>
      {children}
    </div>
  );
}

export {Subsection};
