import styled from 'styled-components';
import CopyLinkButton from '../CopyLinkButton';
import {SendEmailBtnView} from '../SendEmailBtn';

export const PaymentLinkTitle = styled.div`
  margin-top: 47px;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
`;

export const PaymentSubtitle = styled.div`
  margin: 20px 0;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
`;

export const CopyLinkBtn = styled(CopyLinkButton)`
  width: 170px;
  min-width: 170px;
`;

export const SendEmailBtn = styled(SendEmailBtnView)`
  margin-top: 10px;
`;
