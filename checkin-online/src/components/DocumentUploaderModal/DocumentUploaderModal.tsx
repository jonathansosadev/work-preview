import React from 'react';
import {useTranslation} from 'react-i18next';
import {useErrorModal} from '../../utils/hooks';
import {useReservation} from '../../context/reservation';
import {getHousingCountryCode} from '../../utils/reservation';
import {COUNTRY_CODES} from '../../utils/constants';
import {getBase64} from '../../utils/common';
import xIcon from '../../assets/x_black.svg';
import plusBlueIcon from '../../assets/plus-blue.svg';
import Modal from '../Modal';
import {
  CloseButton,
  FileTypes,
  InputZone,
  ModalButtonStyled,
  ModalContent,
  ModalTitle,
  SelectFileInputZoneContainer,
  UploadedImageWrapper,
  UploadedPDFWrapper,
  UploadModalButtonsWrapper,
} from './styled';

const PDF_UPLOADING_ALLOWED_COUNTRIES = [COUNTRY_CODES.uae];

function getAllowedFileTypes(countryCode: string) {
  if (PDF_UPLOADING_ALLOWED_COUNTRIES.includes(countryCode)) {
    return 'image/*, application/pdf';
  }

  return 'image/*';
}

type DocumentUploaderModalProps = {
  open: boolean;
  onSaveFile: (fileBase64: string) => void;
  closeModal: () => void;
  onlyJpg?: boolean;
  title?: React.ReactNode | string;
  description?: React.ReactNode | string;
  className?: string;
};

function DocumentUploaderModal({
  title,
  description,
  open,
  closeModal,
  onSaveFile,
  className,
  onlyJpg,
}: DocumentUploaderModalProps) {
  const {t} = useTranslation();
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const {data: reservation} = useReservation();
  const {ErrorModal, displayError} = useErrorModal();
  const housingCountry = getHousingCountryCode(reservation);

  const removeFile = () => setUploadedFile(null);

  const renderUploadedFile = () => {
    if (!uploadedFile) {
      return null;
    }

    if (/\.pdf/.test(uploadedFile?.name)) {
      return (
        <UploadedPDFWrapper>
          <CloseButton
            onClick={removeFile}
            icon={<img src={xIcon} alt="Close modal" />}
          />
          {uploadedFile.name}
        </UploadedPDFWrapper>
      );
    }

    const url = URL.createObjectURL(uploadedFile);
    return (
      <UploadedImageWrapper>
        <CloseButton onClick={removeFile} icon={<img src={xIcon} alt="Close modal" />} />
        <img src={url} alt="Document" />
      </UploadedImageWrapper>
    );
  };

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target?.files?.[0] as File;

      if (PDF_UPLOADING_ALLOWED_COUNTRIES.includes(housingCountry)) {
        if (onlyJpg && !/(\.jpg|\.jpeg)/i.test(file?.name)) {
          displayError('incorrect_file_type_only_jpg_allowed', true);
          return;
        }

        if (!/(\.jpg|\.jpeg|\.png|\.pdf)/i.test(file?.name)) {
          displayError('incorrect_file_type_only_pdf_and_file_types_allowed', true);
          return;
        }
      }

      if (!/(\.jpg|\.jpeg|\.png)/i.test(file?.name)) {
        displayError('incorrect_file_type_only_file_types_allowed', true);
        return;
      }

      setUploadedFile(file);
    },
    [housingCountry, onlyJpg, displayError],
  );

  const handleSaveDocumentFile = async () => {
    if (!uploadedFile) {
      displayError('Uploaded file is missing. Please contact support.');
      return;
    }

    getBase64(uploadedFile).then(
      file => {
        setUploadedFile(null);
        onSaveFile(file);
        closeModal();
      },
      error => {
        displayError(error);
      },
    );
  };

  const getDescriptionTypes = () => {
    if (PDF_UPLOADING_ALLOWED_COUNTRIES.includes(housingCountry)) {
      if (onlyJpg) return t('only_jpg_files');

      return t('only_pdf_and_doc_file_types');
    }
    return t('only_doc_file_types');
  };

  return (
    <>
      <ErrorModal />
      <Modal
        zIndex={95}
        className={className}
        withCloseButton
        onClose={closeModal}
        open={open}
      >
        <ModalContent>
          <ModalTitle>
            {title || ''}
            <br />
            {description || ''}
          </ModalTitle>
          {uploadedFile ? (
            renderUploadedFile()
          ) : (
            <InputZone>
              <SelectFileInputZoneContainer htmlFor="fileInput">
                <img src={plusBlueIcon} alt="Plus" />
                {t('select_file')}
              </SelectFileInputZoneContainer>
              <input
                type="file"
                id="fileInput"
                multiple={false}
                accept={getAllowedFileTypes(housingCountry)}
                onChange={handleChange}
                hidden
              />
            </InputZone>
          )}
          <FileTypes>{getDescriptionTypes()}</FileTypes>
          <UploadModalButtonsWrapper>
            <ModalButtonStyled
              onClick={handleSaveDocumentFile}
              disabled={!uploadedFile}
              label={t('upload')}
            />
          </UploadModalButtonsWrapper>
        </ModalContent>
      </Modal>
    </>
  );
}

export {DocumentUploaderModal};
