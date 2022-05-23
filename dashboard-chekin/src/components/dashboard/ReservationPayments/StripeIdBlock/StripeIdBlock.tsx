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

const StripePaymentsLink = 'https://dashboard.stripe.com/payments/';

type StripeIdBlockProps = {
  id?: string | null;
  link?: string;
  className?: string;
};

function StripeIdBlock({id, link, className}: StripeIdBlockProps) {
  const {t} = useTranslation();
  const [visibleStripeId, setVisibleStripeId] = React.useState(false);
  const defaultLink = `${StripePaymentsLink}${id}`;
  const transitions = useTransition(visibleStripeId, {
    from: {opacity: 0},
    enter: {opacity: 1},
    leave: {opacity: 0},
    reverse: visibleStripeId,
    config: config.wobbly,
  });

  return (
    <AnimatedContainer className={className} hidden={!id}>
      {transitions(({opacity}, isActive) =>
        isActive ? (
          <StripeIdText $isActive={true} style={{opacity}}>
            <span>
              {t('stripe_id')}:
              <LinkStripeId
                target="_blank"
                referrerPolicy="no-referrer"
                href={link || defaultLink}
              >
                {id}
                <img src={externalLinkIcon} alt="" />
              </LinkStripeId>
            </span>
            <CloseStripeIdButton onClick={() => setVisibleStripeId(false)}>{`(${t(
              'close',
            )})`}</CloseStripeIdButton>
          </StripeIdText>
        ) : (
          <StripeIdText
            onClick={() => setVisibleStripeId(true)}
            $isActive={false}
            style={{opacity}}
          >
            <span>{t('see_stripe_id')}</span>
          </StripeIdText>
        ),
      )}
    </AnimatedContainer>
  );
}

export {StripeIdBlock};
