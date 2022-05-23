import styled, {css} from 'styled-components';
import BaseButton from '../Button';
import {VALIDATION_STATUSES} from '../../../utils/constants';

type ButtonProps = {
  status?: string;
  disabled?: boolean;
};

export const Button = styled(BaseButton)<ButtonProps>`
  transition: all 0.25s ease-in-out;

  ${(props) =>
    props.status === VALIDATION_STATUSES.complete &&
    css`
      border-color: transparent;
      cursor: default;

      &:hover {
        box-shadow: none;
        opacity: 1;
      }
    `};

  ${(props) =>
    props.status === VALIDATION_STATUSES.inProgress &&
    css`
      color: #9696b9;
      border-color: transparent;
      cursor: default;

      &:hover {
        box-shadow: none;
        opacity: 1;
      }
    `};

  ${(props) =>
    props.status === VALIDATION_STATUSES.error &&
    css`
      color: #ff2467;
      border-color: transparent;
      cursor: default;

      &:hover {
        box-shadow: none;
        opacity: 1;
      }
    `};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 1;
    `};
`;
