import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  Exemption,
  Season,
  SeasonRule,
  SelectOption,
  ShortHousing,
} from '../../../utils/types';
import {toastResponseError} from '../../../utils/common';
import searchHousingsIcon from '../../../assets/search-house.svg';
import api from '../../../api';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {useErrorModal, useIsMounted, useStatus} from '../../../utils/hooks';
import {ButtonsWrapper, StyledAsyncSelect} from './styled';

function getSearchParams(query = '') {
  return `ordering=name&name=${query}&fields=id,name&season_exists=true`;
}

type SearchTaxesHousingsModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (seasons: any[]) => void;
  housingId?: string;
  strictOptions?: boolean;
};

const defaultProps: Partial<SearchTaxesHousingsModalProps> = {
  open: false,
  strictOptions: false,
  housingId: '',
  onClose: () => {},
  onSubmit: () => {},
};

function ImportTaxesModal({
  open,
  onClose,
  onSubmit,
  strictOptions,
  housingId,
}: SearchTaxesHousingsModalProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
  const {isLoading, setStatus} = useStatus();
  const [isFetchingOptions, setIsFetchingOptions] = React.useState(false);
  const [hasResults, setHasResults] = React.useState(false);
  const [option, setOption] = React.useState<SelectOption | null>(null);

  const loadHousingsOptions = async (value: string) => {
    setIsFetchingOptions(true);
    const {data, error} = await api.housings.get(getSearchParams(value));
    setIsFetchingOptions(false);

    if (data) {
      if (!data.length) {
        setHasResults(false);
      } else {
        setHasResults(true);
      }

      return data
        .filter((h: ShortHousing) => {
          return h.id !== housingId;
        })
        .map((h: ShortHousing) => {
          return {
            label: h.name,
            value: h.id,
          };
        });
    }

    if (error) {
      toastResponseError(error);
    }
  };

  const handleClose = () => {
    setOption(null);
    onClose();
  };

  const fetchHousingSeasons = async (housingId: string) => {
    const result = await api.seasons.get(`housing_id=${housingId}`);

    if (!isMounted.current) {
      return [];
    }

    if (result?.error) {
      displayError(result.error);
      return [];
    }

    return result.data;
  };

  const removeIdsFromRules = (rules: SeasonRule[]) => {
    return rules.map((rule) => {
      return {
        ...rule,
        id: undefined,
        season_id: undefined,
      };
    });
  };

  const removeIdsFromExemptions = (exemptions: Exemption[]) => {
    return exemptions.map((exemption) => {
      return {
        ...exemption,
        id: undefined,
        season_id: undefined,
      };
    });
  };

  const removeIdsFromSeasons = (seasons: Season[]) => {
    return seasons.map((season) => {
      return {
        ...season,
        id: undefined,
        season_links: undefined,
        housings: undefined,
        rules: removeIdsFromRules(season.rules),
        exemptions: removeIdsFromExemptions(season.exemptions),
      };
    });
  };

  const loadSeasons = async (housingId: string) => {
    setStatus('loading');
    const seasons = await fetchHousingSeasons(housingId);
    const seasonsWithoutIds = removeIdsFromSeasons(seasons);

    if (seasonsWithoutIds) {
      setStatus('idle');
      onSubmit(seasonsWithoutIds);
    }
  };

  const handleSubmit = () => {
    if (option) {
      loadSeasons(option.value.toString());
    }
  };

  return (
    <div>
      <ErrorModal />
      <Modal
        zIndex={200}
        closeOnEscape={!isLoading}
        closeOnDocumentClick={!isLoading}
        open={open}
        onClose={onClose}
        title={t('select_property')}
        iconSrc={searchHousingsIcon}
        iconAlt="House magnifier"
      >
        <StyledAsyncSelect
          strictOptions={strictOptions}
          loadOptions={loadHousingsOptions}
          placeholder={t('enter_property_name')}
          loading={isFetchingOptions}
          hasResults={hasResults}
          value={option}
          onChange={(option: SelectOption) => setOption(option)}
        />
        <ButtonsWrapper>
          <ModalButton
            disabled={!option || isLoading}
            onClick={handleSubmit}
            label={t('import_setup')}
          />
          <ModalButton secondary onClick={handleClose} label={t('close')} />
        </ButtonsWrapper>
      </Modal>
    </div>
  );
}

ImportTaxesModal.defaultProps = defaultProps;
export {ImportTaxesModal};
