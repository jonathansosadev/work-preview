import React from 'react';
import {useHistory} from 'react-router';
import {useMutation, useQuery} from 'react-query';
import {Trans, useTranslation} from 'react-i18next';
import moment from 'moment';
import api, {queryFetcher} from '../../../api';
import {Offer, UpsellingBannersInfo} from '../../../utils/upselling/types';
import {isDateAfterDays} from '../../../utils/common';
import {Paginated} from '../../../utils/types';
import {ENDPOINTS} from '../../../api/housings';
import {UPSELLING_LINKS} from '../../../utils/links';
import pinkImage from '../../../assets/slide-images@2x.png';
import Banner from 'components/dashboard/Banner';
import {TryUpsellingDescription} from './styled';

const refetchIntervalUpsellingBannersInfo = 1000 * 60 * 30;

const fetchHousings = () => {
  return queryFetcher(ENDPOINTS.all(`field_set=id&page=1`));
};

const upsellingBannersInfoMutation = (payload: Partial<UpsellingBannersInfo>) => {
  return payload.id
    ? api.upselling.updateUpsellingBannersInfoMutation({id: payload.id, ...payload})
    : api.upselling.createUpsellingBannersInfoMutation(payload);
};

const TextContent = () => (
  <Trans i18nKey="upselling_is_here">
    <TryUpsellingDescription>
      <h3>UPSELLING is here!</h3>
      <p>
        Hey! You can now activate upselling for free and start getting more money from
        every reservation!
      </p>
    </TryUpsellingDescription>
  </Trans>
);

function TryUpsellingBanner() {
  const {t} = useTranslation();
  const history = useHistory();
  const [open, setOpen] = React.useState(false);

  const {
    data: upsellingBannersInfoList,
    refetch: refetchUpsellingBannersInfo,
    isSuccess: isSuccessUpsellingBannersInfo,
  } = useQuery<void, Error, UpsellingBannersInfo[]>(
    api.upselling.ENDPOINTS.upsellingBannersInfo(),
    {
      refetchOnWindowFocus: false,
      refetchInterval: refetchIntervalUpsellingBannersInfo,
    },
  );
  const upsellingBannersInfo = upsellingBannersInfoList?.[0];
  const isTryNowBannerActive = upsellingBannersInfo?.try_now_banner_status === 'ACTIVE';
  const tryNowBannerLastShownAt = upsellingBannersInfo?.try_now_banner_last_shown_at;

  const {data: offers, isSuccess: isSuccessOffers} = useQuery<Offer[]>(
    api.upselling.ENDPOINTS.offers(),
    {
      enabled: isTryNowBannerActive,
      refetchOnWindowFocus: false,
    },
  );

  const {data: housingsIds} = useQuery<Paginated<{id: string}>>(
    ['housings', upsellingBannersInfo],
    fetchHousings,
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(!isSuccessUpsellingBannersInfo && !upsellingBannersInfo),
    },
  );
  const hasAnyHousing = Boolean(housingsIds && housingsIds.count > 0);

  const hasOffers = offers?.length;
  const {mutate: upsellingBannersInfoMutate} = useMutation<
    void,
    Error,
    Partial<UpsellingBannersInfo>
  >(upsellingBannersInfoMutation);

  const getUpdatePayload = React.useCallback(
    (timestamp: Date, status?): Partial<UpsellingBannersInfo> => {
      return {
        id: upsellingBannersInfo!.id,
        try_now_banner_last_shown_at: timestamp,
        try_now_banner_status: status,
      };
    },
    [upsellingBannersInfo],
  );

  React.useEffect(
    function createUpsellingBannersInfoIfNot() {
      if (isSuccessUpsellingBannersInfo && !upsellingBannersInfo && hasAnyHousing) {
        const payload = {
          try_now_banner_last_shown_at: moment().subtract(7, 'd'),
        };

        upsellingBannersInfoMutate(payload, {
          onSuccess: () => {
            refetchUpsellingBannersInfo();
          },
        });
      }
    },
    [
      hasAnyHousing,
      isSuccessUpsellingBannersInfo,
      refetchUpsellingBannersInfo,
      upsellingBannersInfo,
      upsellingBannersInfoMutate,
    ],
  );

  React.useEffect(
    function deactivateBannerIfNeed() {
      if (isTryNowBannerActive && hasOffers) {
        const payload = getUpdatePayload(new Date(), 'INACTIVE');
        upsellingBannersInfoMutate(payload);
      }
    },
    [getUpdatePayload, hasOffers, isTryNowBannerActive, upsellingBannersInfoMutate],
  );

  React.useEffect(
    function showBannerIfPassedDays() {
      if (isTryNowBannerActive && isSuccessOffers && !hasOffers) {
        const isNeedShow = isDateAfterDays(tryNowBannerLastShownAt, 7);
        if (isNeedShow) setOpen(true);
      }
    },
    [hasOffers, isSuccessOffers, isTryNowBannerActive, tryNowBannerLastShownAt],
  );

  const updateTimestamp = () => {
    const payload = getUpdatePayload(new Date());
    upsellingBannersInfoMutate(payload);
  };

  const goToUpselling = () => {
    updateTimestamp();
    history.push(UPSELLING_LINKS.root);
  };

  return (
    <Banner
      isOpen={open}
      imageSrc={pinkImage}
      imageProps={{width: 196, height: 123}}
      text={<TextContent />}
      onButtonClick={goToUpselling}
      onClose={updateTimestamp}
      buttonText={t('try_now')}
    />
  );
}

export {TryUpsellingBanner};
