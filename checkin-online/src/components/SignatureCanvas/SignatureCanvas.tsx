import React from 'react';
import {useTranslation} from 'react-i18next';
import ReactSignatureCanvas from 'react-signature-canvas';
import {
  Wrapper,
  SignaturePlaceholder,
  SignatureWrapper,
  ClearButton,
  ClearButtonWrapper,
  SignatureTitle,
  SignatureText,
} from './styled';

const CANVAS_PROPS = {
  width: 319,
  height: 182,
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
        <SignatureTitle>{t('signature_title')}</SignatureTitle>
        {!enabled && (
          <SignaturePlaceholder
            data-testid="signature-placeholder"
            onClick={enableSignature}
          >
            <SignatureText>{t('signature_placeholder_text')}</SignatureText>
          </SignaturePlaceholder>
        )}
        {enabled && (
          <SignatureWrapper>
            <ReactSignatureCanvas
              ref={ref}
              data-testid="canvas"
              {...SIGNATURE_PROPS}
              canvasProps={CANVAS_PROPS}
              onEnd={onEnd}
            />
          </SignatureWrapper>
        )}
        <ClearButtonWrapper visible={enabled && hasSignature}>
          <ClearButton onClick={onClear}>{t('repeat_signature')}</ClearButton>
        </ClearButtonWrapper>
      </Wrapper>
    );
  },
);

SignatureCanvas.defaultProps = defaultProps;
export {SignatureCanvas};
