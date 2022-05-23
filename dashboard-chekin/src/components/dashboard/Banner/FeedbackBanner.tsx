import React from 'react';
import {Trans, useTranslation} from 'react-i18next';

import purpleImage from '../../../assets/slide-images-purple@2x.png';
import Banner from 'components/dashboard/Banner';
import {FeedbackDescription} from './styled';

const TextContent = () => (
  <Trans i18nKey="answer_3_questions">
    <FeedbackDescription>
      Hi there! Answer 3 simple questions related to your experience and{' '}
      <b>participate to enjoy Chekin for 6 months free of charge!</b>
    </FeedbackDescription>
  </Trans>
);

// const refetchIntervalFeedbackTime = 1000 * 60 * 30;
// const formLinks = {
//   es: 'https://forms.gle/nRckhwsyru1xBW259',
//   en: 'https://forms.gle/8qypb1Vmi45EHURe7',
// };

function FeedbackBanner() {
  const {t} = useTranslation();
  // const user = useUser();
  // const [open, setOpen] = React.useState(false);
  //
  // const {data: feedbackInfoList} = useQuery<void, Error, UserFeedbackInfo[]>(
  //   api.upselling.ENDPOINTS.userFeedbackInfo(),
  //   {
  //     enabled: !!user?.id,
  //     refetchOnWindowFocus: false,
  //     refetchInterval: refetchIntervalFeedbackTime,
  //   },
  // );
  // const feedbackInfo = feedbackInfoList?.[0];
  //
  // const {mutate: updateFeedbackInfo} = useMutation<
  //   void,
  //   Error,
  //   Partial<Omit<UserFeedbackInfo, 'id'>> & Pick<UserFeedbackInfo, 'id'>,
  //   any
  // >((payload) => api.upselling.updateUserFeedbackInfoMutation(payload));
  //
  // React.useEffect(() => {
  //   if (feedbackInfo?.feedback_banner_status === FEEDBACK_BANNER_STATUSES.show) {
  //     const createdAt = feedbackInfo.created_at;
  //     const isPassedDays = isDateAfterDays(createdAt, 7);
  //     if (isPassedDays) setOpen(true);
  //   }
  // }, [feedbackInfo?.created_at, feedbackInfo?.feedback_banner_status]);
  //
  // React.useEffect(() => {
  //   if (feedbackInfo?.feedback_banner_status === FEEDBACK_BANNER_STATUSES.closed) {
  //     const lastShownFeedbackBannerAt = feedbackInfo.last_shown_feedback_banner_at;
  //     const isPassedDays = isDateAfterDays(lastShownFeedbackBannerAt, 2);
  //     if (isPassedDays) setOpen(true);
  //   }
  // }, [feedbackInfo?.feedback_banner_status, feedbackInfo?.last_shown_feedback_banner_at]);
  //
  // const getPayload = (
  //   status: FEEDBACK_BANNER_STATUSES,
  // ): (Partial<Omit<UserFeedbackInfo, 'id'>> & Pick<UserFeedbackInfo, 'id'>) | null => {
  //   const feedbackInfoId = feedbackInfo?.id;
  //   if (!feedbackInfoId) return null;
  //   return {
  //     id: feedbackInfoId,
  //     last_shown_feedback_banner_at: new Date(),
  //     feedback_banner_status: status,
  //   };
  // };
  //
  // const goToForm = () => {
  //   const locale = getCurrentLocale();
  //   const link = locale in formLinks ? formLinks[locale as 'en' | 'es'] : formLinks.en;
  //   const payload = getPayload(FEEDBACK_BANNER_STATUSES.opened);
  //   if (payload) updateFeedbackInfo(payload);
  //
  //   window.open(link, '_blank');
  // };
  //
  // const handleCloseBanner = () => {
  //   const payload = getPayload(FEEDBACK_BANNER_STATUSES.closed);
  //   if (payload) updateFeedbackInfo(payload);
  // };

  return (
    <Banner
      isOpen={false}
      imageSrc={purpleImage}
      text={<TextContent />}
      // onButtonClick={goToForm}
      // onClose={handleCloseBanner}
      buttonText={t('see_questions')}
    />
  );
}

export {FeedbackBanner};
