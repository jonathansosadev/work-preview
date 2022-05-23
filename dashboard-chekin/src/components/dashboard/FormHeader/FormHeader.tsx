import React from 'react';
import {LinkProps} from 'react-router-dom';
import BackButton from '../BackButton';
import {PropertyHeading, Title, Subtitle, TitleWrapper} from './styled';

type FormHeaderProps = {
  isBackDisabled?: boolean;
  title?: string | React.ReactElement;
  subtitle?: string | React.ReactElement;
  linkToBack?: LinkProps['to'];
  //temp needs until we get native solution to block navigation
  clickToBack?: (arg?: any) => void;
  action?: React.ReactElement | boolean;
  className?: string;
};

function FormHeader({
  isBackDisabled,
  className,
  title,
  subtitle,
  linkToBack,
  clickToBack,
  action,
}: FormHeaderProps) {
  return (
    <PropertyHeading className={className}>
      <div>
        <BackButton disabled={isBackDisabled} link={linkToBack} onClick={clickToBack} />
      </div>
      <TitleWrapper className="title">
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </TitleWrapper>
      <div>{action}</div>
    </PropertyHeading>
  );
}

export {FormHeader};
