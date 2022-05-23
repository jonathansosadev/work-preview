import React from 'react';
import {Wrapper, Label} from './styled';

import i18n from 'i18next';
import Loader from '../Loader';

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
