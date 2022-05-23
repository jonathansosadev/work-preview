import React from 'react';
import {ReactEntity} from '../../../utils/types';
import Tooltip from '../Tooltip';
import {
  Wrapper,
  Title,
  TitleTooltip,
  SubtitleWrapper,
  Subtitle,
  TooltipWrapper,
  TitleLink,
} from './styled';

export type SectionProps = {
  children: ReactEntity;
  title?: ReactEntity;
  titleTooltip?: ReactEntity | string;
  subtitle?: ReactEntity;
  subtitleTooltip?: ReactEntity;
  className?: string;
  titleLink?: {
    name: string;
    to: string;
    target?: string;
  };
};

const defaultProps: SectionProps = {
  children: null,
  title: '',
  subtitle: '',
  subtitleTooltip: '',
  className: '',
};

function Section({
  children,
  title,
  subtitle,
  subtitleTooltip,
  className,
  titleTooltip,
  titleLink,
}: SectionProps) {
  return (
    <Wrapper className={`${className} section`}>
      {title && (
        <Title className="title">
          {title}
          {titleTooltip && (
            <TitleTooltip>
              <Tooltip content={titleTooltip} />
            </TitleTooltip>
          )}
          {titleLink && (
            <TitleLink to={titleLink.to} target={titleLink.target}>
              {titleLink.name}
            </TitleLink>
          )}
        </Title>
      )}
      {subtitle && (
        <SubtitleWrapper>
          <Subtitle>{subtitle}</Subtitle>
          {subtitleTooltip && (
            <TooltipWrapper>
              <Tooltip content={subtitleTooltip} />
            </TooltipWrapper>
          )}
        </SubtitleWrapper>
      )}
      {children}
    </Wrapper>
  );
}

Section.defaultProps = defaultProps;
export {Section};
