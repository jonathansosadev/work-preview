import React from 'react';
import {isMobile, isFirefox} from 'react-device-detect';
import {Trans} from 'react-i18next';
import * as Sentry from '@sentry/react';
import {isMobileOrTablet} from '../../utils/mobile';
import scanAreaImage from '../../assets/scan-area.svg';
import {
  StyledWebcam,
  Wrapper,
  ScanArea,
  CameraAccessText,
  CameraAccessLink,
} from './styled';

const SCREENSHOT_FORMAT = 'image/jpeg';
const MEDIA_CONSTRAINTS = {
  audio: false,
  video: {
    width: {ideal: 4096},
    height: {ideal: 2160},
  },
};

function getMobileOrDesktopVideoConstraints() {
  if (isMobileOrTablet()) {
    return {
      width: {min: 576, ideal: 1700, max: 2160},
      height: {min: 1024, ideal: 3200, max: 4096},
      facingMode: {
        exact: 'environment',
      },
    };
  }
  return {
    facingMode: 'user',
  };
}

export interface WebcamRefTypes extends HTMLVideoElement {
  getScreenshot: () => string;
}

type WebcamProps = {
  onUserMedia?: () => void;
  onUserMediaError?: () => void;
  audio?: boolean;
  imageSmoothing?: boolean;
  mirrored?: boolean;
  screenshotQuality?: number;
  videoConstraints?: any;
  children?: React.ReactNode | JSX.Element;
  hideScanArea?: boolean;
  className?: string;
  minScreenshotH?: number;
  minScreenshotW?: number;
};

const defaultProps: WebcamProps = {
  audio: false,
  mirrored: undefined,
  imageSmoothing: false,
  screenshotQuality: 1,
  children: null,
  videoConstraints: undefined,
  hideScanArea: false,
  className: undefined,
};

const Webcam = React.forwardRef<WebcamRefTypes, WebcamProps>(
  (
    {
      onUserMedia,
      onUserMediaError,
      audio,
      imageSmoothing,
      screenshotQuality,
      children,
      videoConstraints,
      hideScanArea,
      className,
      mirrored,
      minScreenshotH,
      minScreenshotW,
    },
    ref,
  ) => {
    const [minScreenshotHeight, setMinScreenshotHeight] = React.useState<
      undefined | number
    >(undefined);
    const [minScreenshotWidth, setMinScreenshotWidth] = React.useState<
      undefined | number
    >(undefined);
    const constraints = videoConstraints || getMobileOrDesktopVideoConstraints();
    const isMirroredInCSS = mirrored === undefined && !isMobileOrTablet();

    React.useEffect(() => {
      if (!isMobile) {
        try {
          window.navigator?.mediaDevices
            ?.getUserMedia(MEDIA_CONSTRAINTS)
            ?.then(stream => {
              const track = stream.getVideoTracks()[0];
              const aspectRatio = !isFirefox && track?.getCapabilities();

              if (aspectRatio) {
                setMinScreenshotHeight(aspectRatio?.height?.max);
                setMinScreenshotWidth(aspectRatio?.width?.max);
              }
              track.stop();
            });
        } catch (err) {
          Sentry.captureException(err);
        }
      } else {
        setMinScreenshotWidth(minScreenshotW);
        setMinScreenshotHeight(minScreenshotH);
      }
    }, [constraints, minScreenshotW, minScreenshotH]);

    return (
      <>
        <Wrapper className={className} isMirroredInCSS={isMirroredInCSS}>
          {!hideScanArea && <ScanArea src={scanAreaImage} alt="Scan area" />}
          <StyledWebcam
            ref={ref}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            audio={audio}
            imageSmoothing={imageSmoothing}
            mirrored={mirrored}
            screenshotQuality={screenshotQuality}
            videoConstraints={constraints}
            screenshotFormat={SCREENSHOT_FORMAT}
            minScreenshotHeight={minScreenshotHeight}
            minScreenshotWidth={minScreenshotWidth}
          />
        </Wrapper>
        <CameraAccessText>
          <Trans i18nKey="camera_permissions_denied">
            The camera doesn't open? Make sure to{' '}
            <CameraAccessLink
              href="https://support.chekin.com/knowledge/allow-access-to-camera-on-your-browser"
              target="_blank"
              rel="noopener noreferrer"
            >
              allow the browser permission
            </CameraAccessLink>{' '}
            to use the camera.
          </Trans>
        </CameraAccessText>
      </>
    );
  },
);

Webcam.defaultProps = defaultProps;
export {Webcam};
