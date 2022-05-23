import React from 'react';
import Loader from '../../common/Loader';
import i18n from '../../../i18n';
import {Wrapper, Label} from './styled';

type TableLoaderProps = {
  label?: string;
  className?: string;
  hideBorder?: boolean;
  [key: string]: any;
};

const defaultProps: TableLoaderProps = {
  label: i18n.t('loading'),
  className: undefined,
  hideBorder: false,
};

function TableLoader({label, className, hideBorder, ...props}: TableLoaderProps) {
  return (
    <Wrapper className={className} hideBorder={hideBorder}>
      <Loader height={45} width={45} {...props} />
      <Label>{label}</Label>
    </Wrapper>
  );
}

TableLoader.defaultProps = defaultProps;
export {TableLoader};
