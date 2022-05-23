import React, {LinkHTMLAttributes} from 'react';

export type LinkProps = LinkHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  label?: string;
  blank?: boolean;
  children?: React.ReactNode;
};

const defaultProps: LinkProps = {
  label: '',
  to: '',
  blank: true,
};

function Link({label, to, blank, children, ...props}: LinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };
  return (
    <a
      {...props}
      onClick={handleClick}
      href={to}
      target={blank ? '_blank' : ''}
      rel="noreferrer"
    >
      {label}
      {children}
    </a>
  );
}

Link.defaultProps = defaultProps;
export {Link};
