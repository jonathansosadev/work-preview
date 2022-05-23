import React from 'react';
import questionMarkIcon from '../../assets/question-mark.svg';
import {MRZModalTrigger} from './styled';

type QuestionMarkButtonProps = {
  onClick: () => void;
  className?: string;
};

const defaultProps: Partial<QuestionMarkButtonProps> = {
  className: undefined,
};

function QuestionMarkButton({onClick, className}: QuestionMarkButtonProps) {
  return (
    <MRZModalTrigger type="button" className={className} onClick={onClick} tabIndex={-1}>
      <img src={questionMarkIcon} alt="Question mark" />
    </MRZModalTrigger>
  );
}

QuestionMarkButton.defaultProps = defaultProps;

export {QuestionMarkButton};
