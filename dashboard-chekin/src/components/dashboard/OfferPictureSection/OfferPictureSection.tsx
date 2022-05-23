import React from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext, useWatch} from 'react-hook-form';
import {useModalControls} from '../../../utils/hooks';
import {FORM_NAMES} from '../../../utils/upselling';
import {FormTypes} from '../OfferDetails/types';
import {getFileImageSrc, getFileSizeMB} from '../../../utils/common';
import PictureLibraryModal from '../PictureLibraryModal';
import Section from '../Section';
import Button from '../Button';
import {OfferPicture} from '../PictureLibraryModal/PictureLibraryModal';
import {ErrorMessage} from '../../../styled/common';
import {ButtonsWrapper, Image, StyledFileInputButton, FileSizeText} from './styled';

const acceptableFileExtensions = '.jpg, .jpeg, .png';
const maxFileSize = 2.5;

function getOfferPictureSrc(props: Pick<FormTypes, FORM_NAMES.picture>) {
  const picture = props[FORM_NAMES.picture];

  if (picture instanceof File) {
    return getFileImageSrc(picture);
  }

  return picture?.image;
}

type OfferPictureSectionProps = {
  disabled: boolean;
  children: (pictureSrc: string | undefined) => React.ReactNode;
};

function OfferPictureSection({disabled, children}: OfferPictureSectionProps) {
  const {t} = useTranslation();
  const {
    setValue,
    formState: {errors},
    control,
    setError,
    clearErrors,
  } = useFormContext<FormTypes>();
  const {
    isOpen: isPictureLibraryOpen,
    openModal: openPictureLibrary,
    closeModal: closePictureLibrary,
  } = useModalControls();

  const errorMessage =
    (errors[FORM_NAMES.picture] as any)?.types?.maxLength ||
    (errors[FORM_NAMES.picture] as any)?.message;
  const maxFileSizeText = t('max_file_size_is_number_mb', {number: maxFileSize});
  const isMaxFileSizeTextVisible = errorMessage !== maxFileSizeText;

  const picture = useWatch({name: FORM_NAMES.picture, control});
  const pictureSrc = React.useMemo(() => {
    return getOfferPictureSrc({
      [FORM_NAMES.picture]: picture,
    });
  }, [picture]);

  React.useEffect(() => {
    return () => {
      if (picture instanceof File && pictureSrc) {
        URL.revokeObjectURL(pictureSrc);
      }
    };
  }, [picture, pictureSrc]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileSize = getFileSizeMB(file);
    if (fileSize > maxFileSize) {
      setValue(FORM_NAMES.picture, undefined, {
        shouldDirty: true,
      });
      setError(FORM_NAMES.picture, {
        type: 'maxLength',
        message: maxFileSizeText,
      });
      return;
    }

    clearErrors(FORM_NAMES.picture);
    setValue(FORM_NAMES.picture, file, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleLibraryPictureClick = (picture: OfferPicture) => {
    setValue(FORM_NAMES.picture, picture, {
      shouldDirty: true,
      shouldValidate: true,
    });
    closePictureLibrary();
  };

  return (
    <Section title={t('picture')} subtitle={t('upload_picture_that_will_be_at_header')}>
      <PictureLibraryModal
        open={isPictureLibraryOpen}
        onClose={closePictureLibrary}
        onPictureClick={handleLibraryPictureClick}
      />
      {pictureSrc && <Image src={pictureSrc} alt="Offer background" />}
      {children(pictureSrc)}
      <ButtonsWrapper>
        <div>
          <StyledFileInputButton
            secondary
            disabled={disabled}
            danger={Boolean(errorMessage)}
            icon={null}
            label={t('upload_picture')}
            onChange={handleFileChange}
            accept={acceptableFileExtensions}
          />
          {<ErrorMessage>{errorMessage}</ErrorMessage>}
          {isMaxFileSizeTextVisible && (
            <FileSizeText>
              {t('max_file_size_is_number_mb', {number: maxFileSize})}
            </FileSizeText>
          )}
        </div>
        <Button
          disabled={disabled}
          label={t('select_from_library')}
          onClick={openPictureLibrary}
          contentAlign="center"
        />
      </ButtonsWrapper>
    </Section>
  );
}

export {OfferPictureSection};
