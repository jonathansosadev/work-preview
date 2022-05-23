import React from 'react';
import {useTranslation} from 'react-i18next';
import {Field} from '../CustomForm/CustomForm';
import {FIELD_TYPES} from '../../../utils/guestFields';
import {getRequiredOrOptionalFieldLabel} from '../../../utils/common';
import phoneMockup from '../../../assets/custom-fields-account-iphone-mockup.svg';
import paperClipIcon from '../../../assets/paper-clip.svg';
import {RelativeWrapper} from '../../../styled/common';
import {
  Wrapper,
  ContainerImage,
  Content,
  Background,
  PreviewInput,
  FieldWrapper,
  PreviewSelect,
  PreviewDatepicker,
  ContentMessage,
  FilePreviewUploadImageContainer,
  PreviewPhone,
  PreviewFileInput,
} from './styled';

function useElementDrag<RefType = any>() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [transform, setTransform] = React.useState(`translate3d(0, 0, 0)`);
  const ref = React.useRef<RefType>(null);
  const initialCoords = React.useRef({x: 0, y: 0});
  const currentCoords = React.useRef({x: 0, y: 0});
  const offset = React.useRef({x: 0, y: 0});

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      let initialX;
      let initialY;

      if (event.type === 'touchstart') {
        const touchEvent = event as React.TouchEvent;
        initialX = touchEvent.touches[0].clientX - offset.current.x;
        initialY = touchEvent.touches[0].clientY - offset.current.y;
      } else {
        event.preventDefault();

        const mouseEvent = event as React.MouseEvent;
        initialX = mouseEvent.clientX - offset.current.x;
        initialY = mouseEvent.clientY - offset.current.y;
      }

      initialCoords.current = {x: initialX, y: initialY};
      setIsDragging(true);
    },
    [],
  );

  const handleMouseUp = React.useCallback(() => {
    initialCoords.current = {x: currentCoords.current.x, y: currentCoords.current.y};
    setIsDragging(false);
  }, []);

  const handleMouseMove = React.useCallback(
    (event: any) => {
      if (!isDragging) {
        return;
      }

      let currentX;
      let currentY;

      if (event.type === 'touchmove') {
        const touchEvent = event as React.TouchEvent;
        currentX = touchEvent.touches[0].clientX - initialCoords.current.x;
        currentY = touchEvent.touches[0].clientY - initialCoords.current.y;
      } else {
        event.preventDefault();

        const mouseEvent = event as React.MouseEvent;
        currentX = mouseEvent.clientX - initialCoords.current.x;
        currentY = mouseEvent.clientY - initialCoords.current.y;
      }

      currentCoords.current = {
        x: currentX,
        y: currentY,
      };
      offset.current = {
        x: currentX,
        y: currentY,
      };
      setTransform(`translate3d(${currentX}px, ${currentY}px,0)`);
    },
    [isDragging],
  );

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchend', handleMouseUp, false);
      document.addEventListener('touchmove', handleMouseMove, false);

      document.addEventListener('mouseup', handleMouseUp, false);
      document.addEventListener('mousemove', handleMouseMove, false);
    } else {
      document.removeEventListener('touchend', handleMouseUp, false);
      document.removeEventListener('touchmove', handleMouseMove, false);

      document.removeEventListener('mouseup', handleMouseUp, false);
      document.removeEventListener('mousemove', handleMouseMove, false);
    }
    return () => {
      document.removeEventListener('touchend', handleMouseUp, false);
      document.removeEventListener('touchmove', handleMouseMove, false);

      document.removeEventListener('mouseup', handleMouseUp, false);
      document.removeEventListener('mousemove', handleMouseMove, false);
    };
  }, [handleMouseMove, handleMouseUp, isDragging]);

  return {
    ref,
    isDragging,
    transform,
    handleMouseDown,
  };
}

type CustomFormPreviewProps = {
  fields: Field[];
};

function CustomFormPreview({fields}: CustomFormPreviewProps) {
  const {t} = useTranslation();
  const {ref, isDragging, transform, handleMouseDown} = useElementDrag<
    HTMLImageElement
  >();

  return (
    <Wrapper
      style={{
        transform,
      }}
    >
      <RelativeWrapper>
        <Background isDragging={isDragging} />
        <ContainerImage
          alt=""
          src={phoneMockup}
          ref={ref}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        />
        <Content>
          {fields.length ? (
            <div>
              {isDragging ? (
                <ContentMessage>{t('form_preview_drag_text')}</ContentMessage>
              ) : (
                <div>
                  {fields.map((field) => {
                    if (!field?.label) {
                      return null;
                    }

                    if (field.type === FIELD_TYPES.date) {
                      return (
                        <FieldWrapper key={field.id}>
                          <PreviewDatepicker
                            tabIndex={-1}
                            label={getRequiredOrOptionalFieldLabel(
                              field.label,
                              field.required,
                            )}
                          />
                        </FieldWrapper>
                      );
                    }

                    if (
                      field.type === FIELD_TYPES.select ||
                      field.type === FIELD_TYPES.time
                    ) {
                      return (
                        <FieldWrapper key={field.id}>
                          <PreviewSelect
                            tabIndex={-1}
                            placeholder={field.placeholder}
                            label={getRequiredOrOptionalFieldLabel(
                              field.label,
                              field.required,
                            )}
                          />
                        </FieldWrapper>
                      );
                    }

                    if (field.type === FIELD_TYPES.file) {
                      return (
                        <FieldWrapper key={field.id}>
                          <PreviewFileInput
                            tabIndex={-1}
                            placeholder={field?.placeholder}
                            label={getRequiredOrOptionalFieldLabel(
                              field.label,
                              field.required,
                            )}
                          />
                          <FilePreviewUploadImageContainer>
                            <img alt="" src={paperClipIcon} />
                          </FilePreviewUploadImageContainer>
                        </FieldWrapper>
                      );
                    }

                    if (field.type === FIELD_TYPES.phone) {
                      return (
                        <FieldWrapper key={field.id}>
                          <PreviewPhone
                            tabIndex={-1}
                            placeholder={t('enter_your_number')}
                            label={getRequiredOrOptionalFieldLabel(
                              field.label,
                              field.required,
                            )}
                          />
                        </FieldWrapper>
                      );
                    }

                    return (
                      <FieldWrapper key={field.id}>
                        <PreviewInput
                          tabIndex={-1}
                          placeholder={field?.placeholder}
                          label={getRequiredOrOptionalFieldLabel(
                            field.label,
                            field.required,
                          )}
                        />
                      </FieldWrapper>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <ContentMessage>{t('form_preview_start_text')}</ContentMessage>
          )}
        </Content>
      </RelativeWrapper>
    </Wrapper>
  );
}

export {CustomFormPreview};
