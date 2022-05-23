import styled from 'styled-components';
import Button from '../Button';

export const CardNotAddedText = styled.div`
  font-size: 16px;
  margin-bottom: 40px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
`;

export const CurrentPaymentCardContent = styled.div`
  display: flex;
  width: 374px;
  border-bottom: 2px solid #dee4ed;
  align-items: center;
  padding-bottom: 8px;
  margin-bottom: 30px;
`;

export const CardNumberLastNumbers = styled.div`
  font-size: 16px;
  margin-right: 25px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
`;

export const ButtonLabelWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ButtonWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  width: 500px;
  justify-content: space-between;
`;

export const LoaderWrapper = styled.div`
  margin-top: 30px;
`;

export const Form = styled.form`
  width: 500px;
`;

export const stripeInputStyle = {
  base: {
    fontSize: '16px',
    color: '#33335A',
    fontFamily: 'SFProDisplay-Regular, sans-serif',
    letterSpacing: 'normal',

    '::placeholder': {
      color: '#B7C3D8',
    },
  },
  invalid: {
    color: '#ff5d8f',
  },
};

export const CardPlaceholderWrapper = styled.div`
  margin-bottom: 30px;
`;

export const MarginTop = styled.div`
  width: 20px;
  height: 30px;
`;

export const PaymentButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const IbanLabel = styled.div`
  margin: 0 0 10px 0;
`;

export const ImportantInfo = styled.div`
  margin: 30px 0 0 0;
  width: 800px;
`;