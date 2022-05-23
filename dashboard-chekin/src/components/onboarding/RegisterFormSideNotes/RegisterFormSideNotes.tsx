import React from 'react';
import {useTranslation} from 'react-i18next';
import checkCircleIcon from '../../../assets/check_circle.svg';
import {Wrapper, NoteTitle, NoteContainer, NoteDetails, NoteIcon} from './styled';

type RegisterFormSideNotesProps = {
  className?: string;
  isAPIUser?: boolean;
  isSubscriptionDisabled?: boolean;
};

const defaultProps: RegisterFormSideNotesProps = {
  isAPIUser: false,
  isSubscriptionDisabled: false,
};

function RegisterFormSideNotes({
  className,
  isAPIUser,
  isSubscriptionDisabled,
}: RegisterFormSideNotesProps) {
  const {t} = useTranslation();

  return (
    <Wrapper className={className}>
      <Note title={t('quick_and_free_signup')} details={t('enter_your_personal_data')} />
      {isAPIUser && (
        <Note title={t('simple_integration')} details={t('use_api_to_integrate')} />
      )}
      {!isSubscriptionDisabled && (
        <Note title={t('no_credit_card_required')} details={t('just_enjoy_platform')} />
      )}
    </Wrapper>
  );
}

type NoteProps = {
  title: string;
  details: string;
};

function Note({title, details}: NoteProps) {
  return (
    <NoteContainer>
      <NoteIcon alt="check mark" src={checkCircleIcon} />
      <NoteTitle>{title}</NoteTitle>
      <NoteDetails>{details}</NoteDetails>
    </NoteContainer>
  );
}

RegisterFormSideNotes.defaultProps = defaultProps;
export {RegisterFormSideNotes};
