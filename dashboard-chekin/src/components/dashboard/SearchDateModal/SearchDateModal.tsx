import React from 'react';
import {useTranslation} from 'react-i18next';
import {Moment} from 'moment';
import {DatepickerDate} from '../../../utils/types';
import {preloadDefaultDate} from '../../../utils/date';
import searchByDateIcon from '../../../assets/icon-search-by-date.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import DateRangePicker from '../DateRangePicker';
import {ButtonsWrapper, FieldsWrapper} from './styled';

export type SearchDates = {
  from?: DatepickerDate;
  to?: DatepickerDate;
};

type SearchByDateModalProps = {
  open?: boolean;
  onClose: () => void;
  onSubmit: (dates: SearchDates) => void;
  defaultStartDate: DatepickerDate;
  defaultEndDate: DatepickerDate;
};

const defaultProps: SearchByDateModalProps = {
  open: false,
  onClose: () => {},
  onSubmit: () => {},
  defaultStartDate: null,
  defaultEndDate: null,
};

function SearchDateModal({
  open,
  onClose,
  onSubmit,
  defaultStartDate,
  defaultEndDate,
}: SearchByDateModalProps) {
  const {t} = useTranslation();
  const [startDate, setStartDate] = React.useState<Moment | null>(() =>
    preloadDefaultDate(defaultStartDate),
  );
  const [endDate, setEndDate] = React.useState<Moment | null>(() =>
    preloadDefaultDate(defaultEndDate),
  );

  const [focusedInput, setFocusedInput] = React.useState<'startDate' | 'endDate' | null>(
    null,
  );

  const handleSubmit = () => {
    onSubmit({
      from: startDate?.toDate(),
      to: endDate?.toDate(),
    });
    onClose();
  };

  return (
    <Modal
      closeOnEscape
      closeOnDocumentClick
      open={open}
      onClose={onClose}
      iconSrc={searchByDateIcon}
      iconAlt="Calendar"
      title={t('search_by_date')}
      iconProps={{
        height: 84,
        width: 84,
      }}
    >
      <FieldsWrapper>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          startDateId="start-date"
          endDateId="end-date"
          focusedInput={focusedInput}
          label={t('from_to')}
          minimumNights={0}
          onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
          onDatesChange={({startDate, endDate}) => {
            setStartDate(startDate);
            setEndDate(endDate);
          }}
        />
      </FieldsWrapper>
      <ButtonsWrapper>
        <ModalButton
          disabled={!startDate && !endDate}
          label={t('search')}
          onClick={handleSubmit}
        />
        <ModalButton secondary label={t('cancel')} onClick={onClose} />
      </ButtonsWrapper>
    </Modal>
  );
}

SearchDateModal.defaultProps = defaultProps;
export {SearchDateModal};
