import React from 'react';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';
import {downloadFromLink} from '../../../../utils/common';
import viewIcon from '../../../../assets/view-icon.svg';
import downloadIcon from '../../../../assets/download-icon.svg';
import {IconButtonStyled, GuestImage, Header, GroupButton} from './styled';

type IdentityVerificationModalProps = {
  image: {
    label: string;
    src: string | null;
    srcDownload: string | null;
  };
  isApproved?: boolean;
};

function GuestVerificationImage({
  image,
  isApproved = true,
}: IdentityVerificationModalProps) {
  const {t} = useTranslation();

  const handleViewFullPhoto = (url: string | null) => {
    if (url) {
      downloadFromLink(url);
    }
  };

  const handleDownloadImage = (downloadLink?: string | null) => {
    if (downloadLink) {
      downloadFromLink(downloadLink);
    } else {
      toast.warn(t('photo_download_link_missing'));
    }
  };

  if (!image.src) return null;

  return (
    <div>
      <Header>
        <p>{image.label}</p>
        <GroupButton>
          <IconButtonStyled
            type="button"
            onClick={() => {
              handleViewFullPhoto(image.src);
            }}
          >
            <img src={viewIcon} alt="Eye" />
          </IconButtonStyled>
          <IconButtonStyled
            type="button"
            onClick={() => {
              handleDownloadImage(image.srcDownload);
            }}
          >
            <img src={downloadIcon} alt="Download" />
          </IconButtonStyled>
        </GroupButton>
      </Header>
      <GuestImage url={image.src || ''} isApproved={isApproved} />
    </div>
  );
}

export {GuestVerificationImage};
