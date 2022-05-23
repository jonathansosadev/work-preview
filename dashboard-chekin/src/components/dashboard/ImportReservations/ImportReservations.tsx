import React from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {useHistory} from 'react-router-dom';
import i18n from '../../../i18n';
import api from '../../../api';
import {SelectOption} from '../../../utils/types';
import {useOpenModals} from '../../../context/openModals';
import {toastResponseError, getBase64} from '../../../utils/common';
import {useCountriesOptions} from '../../../hooks/useCountriesOptions';
import {useIsMounted} from '../../../utils/hooks';
import {useComputedDetails} from '../../../context/computedDetails';
import {RESERVATION} from '../../../utils/constants';
import {TOAST_AUTO_CLOSE_MS} from '../../../utils/constants';
import importBooking from '../../../assets/import-booking.svg';
import directDownloadIcon from '../../../assets/direct-download.svg';
import downloadTemplatesIcon from '../../../assets/import-bookings-icon.svg';
import importTemplatesIcon from '../../../assets/upload-bookings-icon.svg';
import Select from '../Select';
import Button from '../Button';
import Section from '../Section';
import BackButton from '../BackButton';
import {
  ButtonsWrapper,
  ContentTextWrapper,
  FileInputWrapper,
  HeaderWrapper,
  InputWrapper,
  SelectedFileItemRemoveBtn,
  SelectedFileItemText,
  SelectedFileItemWrapper,
  SelectedFilesList,
  ToastContent,
  ToastImg,
  ToastText,
  Wrapper,
  DirectDownloadIcon,
  FileInputButton,
  FlexWrapper,
  DownloadButton,
  Hr,
  BackBtn,
  HeaderTitle,
} from '../../../styled/imports';

const ENTITY_TYPE = 'RESERVATION';
const DOWNLOAD_TOAST_CONTENT = (
  <ToastContent>
    <ToastImg src={downloadTemplatesIcon} alt="Download icon" />
    <ToastText>{i18n.t('downloading')}</ToastText>
  </ToastContent>
);
const IMPORT_TOAST_CONTENT = (
  <ToastContent>
    <ToastImg src={importTemplatesIcon} alt="Import icon" />
    <ToastText>{i18n.t('importing')}</ToastText>
  </ToastContent>
);

type TemplateObject = {
  link: string;
};

function ImportReservations() {
  const {t} = useTranslation();
  const history = useHistory();
  const isMounted = useIsMounted();
  const {isNeedToAskForSubscription} = useComputedDetails();
  const openModals = useOpenModals();
  const [templateCountryCode, setTemplateCountryCode] = React.useState<SelectOption>();
  const [filesToUpload, setFilesToUpload] = React.useState<File[]>([]);

  const {countriesOptions} = useCountriesOptions({});

  React.useEffect(
    function redirect() {
      if (isNeedToAskForSubscription) {
        history.push('/bookings');
      }
    },
    [history, isNeedToAskForSubscription],
  );

  const handleSelectChange = (option: SelectOption) => {
    setTemplateCountryCode(option);
  };

  const downloadTemplate = async () => {
    const payload = {
      entity_type: ENTITY_TYPE,
      countries: [templateCountryCode?.value],
    };

    toast.info(DOWNLOAD_TOAST_CONTENT, {
      position: 'bottom-right',
      autoClose: TOAST_AUTO_CLOSE_MS,
    });
    const {data, error} = await api.importXLSX.getTemplates(payload);

    if (!isMounted.current) {
      return;
    }

    if (data && data.length) {
      data.map((element: TemplateObject) => (window.location.href = element.link));
    }
    if (error) {
      toastResponseError(error);
    }
  };

  const handleFileSelect = async (event: any) => {
    const {target} = event;
    if (target?.files.length) {
      const nextFiles = [...filesToUpload, ...target.files];
      setFilesToUpload(nextFiles);
    }
  };

  const removeSelectedFile = (fileName: string) => {
    const filteredFiles = filesToUpload.filter((file: File) => {
      return file.name !== fileName;
    });
    setFilesToUpload(filteredFiles);
  };

  const getUploadPayload = async () => {
    let data = [];
    for (let file of filesToUpload) {
      data.push({
        file: await getBase64(file),
        entity_type: ENTITY_TYPE,
      });
    }
    return {requests: data};
  };

  const uploadFiles = async () => {
    const payload = await getUploadPayload();
    toast.info(IMPORT_TOAST_CONTENT, {
      position: 'bottom-right',
      autoClose: TOAST_AUTO_CLOSE_MS,
    });
    await api.importXLSX.uploadTemplates(payload);
    openModals.setImportType(RESERVATION);
    history.push('/bookings');
  };

  return (
    <Wrapper>
      <BackBtn>
        <BackButton link={'/bookings'} />
      </BackBtn>
      <HeaderWrapper>
        <HeaderTitle>{t('import_bookings')}</HeaderTitle>
      </HeaderWrapper>
      <Section>
        <ContentTextWrapper>
          1 - {t('select_the_country_on_which_bookings')}
        </ContentTextWrapper>
        <FlexWrapper>
          <InputWrapper>
            <Select
              label={t('country')}
              options={countriesOptions}
              onChange={handleSelectChange}
              value={templateCountryCode}
              placeholder={t('select_your_country')}
            />
          </InputWrapper>
          <InputWrapper>
            <DownloadButton
              secondary
              disabled={!templateCountryCode}
              label={
                <>
                  <DirectDownloadIcon src={directDownloadIcon} alt="Arrow down" />
                  {t('download_template')}
                </>
              }
              onClick={downloadTemplate}
            />
          </InputWrapper>
        </FlexWrapper>
      </Section>
      <Section>
        <ContentTextWrapper>2 - {t('upload_the_same_template')}</ContentTextWrapper>
        <InputWrapper>
          {Boolean(filesToUpload.length) && (
            <SelectedFilesList>
              {filesToUpload.map((file, index) => {
                return (
                  <SelectedFileItemWrapper key={index}>
                    <SelectedFileItemText>{file.name}</SelectedFileItemText>
                    <SelectedFileItemRemoveBtn
                      onClick={() => removeSelectedFile(file.name)}
                    />
                  </SelectedFileItemWrapper>
                );
              })}
            </SelectedFilesList>
          )}
          <ButtonsWrapper>
            <FileInputButton
              multiple
              secondary
              accept=".xlsx, .xls, .csv"
              label={
                Boolean(filesToUpload.length)
                  ? t('upload_another_template')
                  : t('upload_templates')
              }
              onChange={handleFileSelect}
            />
          </ButtonsWrapper>
        </InputWrapper>
      </Section>
      <Hr />
      {Boolean(filesToUpload.length) && (
        <FileInputWrapper>
          <Button
            onClick={uploadFiles}
            disabled={!filesToUpload.length}
            label={
              <>
                <img src={importBooking} alt="People" />
                {t('import_bookings_now')}
              </>
            }
          />
        </FileInputWrapper>
      )}
    </Wrapper>
  );
}

export {ImportReservations};
