import React from 'react';
import {useQueryClient} from 'react-query';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import api from '../../../../api';
import {ACCOUNT_LINKS} from '../../AccountSections';
import {CustomEmail} from './TemplatesList';
import {CustomEmailSendingSettings} from '../../CustomEmail/CustomEmail';
import {CUSTOM_FORMS_REMINDER_OPTIONS} from '../../../../utils/emailReminders';
import {useAsyncOperation} from '../../../../utils/hooks';
import {useSwitchSectionActive} from '../../Switch';
import Switch from '../../Switch';
import {
  ItemContainer,
  ItemWrapper,
  ItemTitle,
  TimingOption,
  TimingOptions,
} from './styled';

function getTimingOptionsLabels(source: CustomEmailSendingSettings) {
  const timingOptions = Object.keys(source)
    .filter((key) => source[key as keyof CustomEmailSendingSettings])
    .reduce((acc, option) => {
      const allReminderOptions = Object.values(CUSTOM_FORMS_REMINDER_OPTIONS).reduce(
        (acc, options) => ({...acc, ...options}),
        {},
      );

      const timingOption = Object.entries(allReminderOptions).find(([_, value]) => {
        return value.endsWith(option);
      });

      if (timingOption) {
        const [label] = timingOption;
        return [...acc, label];
      }

      return acc;
    }, [] as string[]);

  return timingOptions;
}

type TemplateListItemProps = {
  customEmailItem: CustomEmail;
  removeButton: React.ReactNode;
};

function TemplatesListItem({customEmailItem, removeButton}: TemplateListItemProps) {
  const queryClient = useQueryClient();
  const {id, ...payload} = customEmailItem;
  const {name, sending_settings} = payload;
  const {isLoading, asyncOperation} = useAsyncOperation();
  const {t} = useTranslation();

  const {isSectionActive, toggleIsSectionActive} = useSwitchSectionActive(
    sending_settings.is_sending_enabled,
  );

  const toggleCustomEmailActive = () => {
    const customEmailPayload = {
      ...payload,
      sending_settings: {
        ...sending_settings,
        is_sending_enabled: !isSectionActive,
      },
    };

    asyncOperation(() => api.customEmails.updateCustomEmails(id, customEmailPayload), {
      onSuccess: toggleIsSectionActive,
    });
  };

  const goToEditCustomEmail = () => {
    queryClient.setQueryData(['customEmailItem', id], customEmailItem);

    return {
      pathname: ACCOUNT_LINKS.editCustomEmail.replace(':id', id),
      state: {customEmailItem},
    };
  };

  return (
    <ItemContainer>
      <ItemWrapper>
        <Link to={goToEditCustomEmail}>
          <ItemTitle>{name}</ItemTitle>
          <TimingOptions>
            {getTimingOptionsLabels(sending_settings).map((option, i) => {
              return <TimingOption key={i}>{t(option)}</TimingOption>;
            })}
          </TimingOptions>
        </Link>
        <Switch
          onChange={toggleCustomEmailActive}
          checked={isSectionActive}
          disabled={isLoading}
        />
      </ItemWrapper>
      {removeButton}
    </ItemContainer>
  );
}

export {TemplatesListItem};
