import styled, {css} from 'styled-components';
import Input from '../Input';
import Select from '../Select';
import {DisplayIcon as BaseDisplayIcon} from '../Select/styled';
import {ErrorMessage as BaseErrorMessage} from '../../../styled/common';
import {Name as InputName} from '../Input/styled';
import {MRZModalTrigger} from '../QuestionMarkButton/styled';

export const DisplayIcon = styled(BaseDisplayIcon)`
  position: absolute;
  right: 7px;
  top: 8px;
  z-index: 1;
`;

type WrapperProps = {
  disabled?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  width: 293px;
  min-height: 48px;

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;

      & ${DisplayIcon}, & ${InputName} {
        opacity: 0.3;
      }
    `};
`;

export const FieldsWrapper = styled.div`
  grid-template-columns: 1fr 133px 1fr;
  grid-column-gap: 10px;
  display: grid;
`;

export const DateInput = styled(Input)`
  width: auto;
  min-height: auto;
`;

export const DateSelectWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

export const DateSelect = styled(Select)`
  width: 133px;

  & .select__menu,
  & .select__menu-list {
    width: 213px;
  }
`;

export const ErrorMessage = styled(BaseErrorMessage)`
  padding-top: 1px;
`;

export const LabelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  ${MRZModalTrigger} {
    position: relative;
    top: -2px;
  }
`;
