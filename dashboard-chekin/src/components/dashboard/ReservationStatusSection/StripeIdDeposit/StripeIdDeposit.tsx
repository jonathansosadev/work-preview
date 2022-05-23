import React from 'react';
import {useTranslation} from 'react-i18next';
import {config, useTransition} from 'react-spring';
import externalLinkIcon from '../../../../assets/surface.svg';
import {
  AnimatedContainer,
  CloseStripeIdButton,
  LinkStripeId,
  StripeIdText,
} from './styled';

type StripeIdDepositProps = {
  id?: string | null;
  link?: string;
  className?: string;
};

function StripeIdDeposit({id, link, className}: StripeIdDepositProps) {
  const {t} = useTranslation();
  const [visibleStripeId, setVisibleStripeId] = React.useState(false);
  const defaultLink = `${link}${id}`;
  const transitions = useTransition(visibleStripeId, {
    from: {opacity: 0},
    enter: {opacity: 1},
    leave: {opacity: 0},
    reverse: visibleStripeId,
    config: config.wobbly,
  });

  return (
    <AnimatedContainer className={className} hidden={!id} isActive={visibleStripeId}>
      {transitions(({opacity}, isActive) =>
        isActive ? (
          <StripeIdText isActive style={{opacity}}>
            <span>
              {t('stripe_id')}:
              <CloseStripeIdButton onClick={() => setVisibleStripeId(false)}>{`(${t(
                'close',
              )})`}</CloseStripeIdButton>
            </span>
            <LinkStripeId
              target="_blank"
              referrerPolicy="no-referrer"
              href={link || defaultLink}
            >
              {id}
              <img src={externalLinkIcon} alt="" />
            </LinkStripeId>
          </StripeIdText>
        ) : (
          <StripeIdText onClick={() => setVisibleStripeId(true)} style={{opacity}}>
            <span>{t('see_stripe_id')}</span>
          </StripeIdText>
        ),
      )}
    </AnimatedContainer>
  );
}

export {StripeIdDeposit};
