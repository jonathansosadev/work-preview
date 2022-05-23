import React from 'react';
import {useTranslation} from 'react-i18next';
import {breakIntoLines} from '../../../utils/translations';
import ReactSignatureCanvas from 'react-signature-canvas';
import fingerIcon from '../../../assets/sign-finger.svg';
import {
  Wrapper,
  SignaturePlaceholder,
  SignatureWrapper,
  ClearButton,
  ClearButtonWrapper,
  SignatureIcon,
  SignatureText,
} from './styled';

const CANVAS_PROPS = {
  width: 250,
  height: 174,
};
const SIGNATURE_PROPS = {
  penColor: '#161643',
  minWidth: 1.5,
  maxWidth: 1.5,
  dotSize: 1,
};

type SignatureCanvasProps = {
  onClear?: () => void;
  onEnable?: () => void;
  hasSignature?: boolean;
  onEnd?: () => void;
  onStart?: () => void;
  className?: string;
  enabled?: boolean;
};

const defaultProps: SignatureCanvasProps = {
  onEnd: () => {},
  onEnable: () => {},
  onStart: () => {},
  onClear: () => {},
  hasSignature: false,
  className: '',
  enabled: false,
};

const SignatureCanvas = React.forwardRef<ReactSignatureCanvas, SignatureCanvasProps>(
  ({onClear, hasSignature, onEnd, onStart, onEnable, className, enabled}, ref) => {
    const {t} = useTranslation();

    const enableSignature = () => {
      if (onEnable) {
        onEnable();
      }
    };

    return (
      <Wrapper className={className}>
        {!enabled && (
          <SignaturePlaceholder data-testid="signature-placeholder">
            <SignatureIcon src={fingerIcon} alt="Finger" />
            <SignatureText>
              {breakIntoLines(t('signature_placeholder_text'))}
            </SignatureText>
          </SignaturePlaceholder>
        )}
        <SignatureWrapper>
          <ReactSignatureCanvas
            ref={ref}
            onBegin={enableSignature}
            data-testid="canvas"
            {...SIGNATURE_PROPS}
            canvasProps={CANVAS_PROPS}
            onEnd={onEnd}
          />
        </SignatureWrapper>
        <ClearButtonWrapper visible={enabled && hasSignature}>
          <ClearButton secondary onClick={onClear} label={t('clear')} />
        </ClearButtonWrapper>
      </Wrapper>
    );
  },
);

SignatureCanvas.defaultProps = defaultProps;
export {SignatureCanvas};
