import React, {MouseEventHandler} from 'react';
import {ReactEntity} from '../../../utils/types';
import {Filter, RemoveIcon} from './styled';
import removeIcon from '../../../assets/remove.svg';

type TableFilterProps = {
  onRemove: MouseEventHandler<HTMLImageElement>;
  children: ReactEntity;
  onClick?: () => void;
  className?: string;
};

function TableFilter({onRemove, onClick, children, className}: TableFilterProps) {
  return (
    <Filter onClick={onClick} className={className}>
      {children}
      <RemoveIcon onClick={onRemove} src={removeIcon} alt="Cross" />
    </Filter>
  );
}

export {TableFilter};
