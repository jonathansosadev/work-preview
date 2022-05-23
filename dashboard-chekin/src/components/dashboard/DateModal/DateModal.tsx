import React from 'react';
import {Moment} from 'moment';
import {useTranslation} from 'react-i18next';
import {preloadDefaultDate} from '../../../utils/date';
import searchByDateIcon from '../../../assets/icon-search-by-date-new.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import DateRangePicker from '../DateRangePicker';
import {ButtonsWrapper, FieldWrapper} from './styled';

export type SearchDates = {
  from: Moment | null;
  to: Moment | null;
};

type DateModalProps = {
  open?: boolean;
  onClose: () => void;
  onSubmit: (dates: SearchDates) => void;
  defaultStartDate: Moment | null;
  defaultEndDate: Moment | null;
};

const defaultProps: DateModalProps = {
  open: false,
  onClose: () => {},
  onSubmit: () => {},
  defaultStartDate: null,
  defaultEndDate: null,
};

function DateModal({
  open,
  onClose,
  onSubmit,
  defaultStartDate,
  defaultEndDate,
}: DateModalProps) {
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
    onClose();
    const payload: SearchDates = {
      from: startDate || null,
      to: endDate || null,
    };
    onSubmit(payload);
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
      title={t('select_date_range')}
      iconProps={{
        height: 108,
        width: 108,
      }}
    >
      <FieldWrapper>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          startDateId="start-date"
          endDateId="end-date"
          focusedInput={focusedInput}
          label={t('from_to')}
          onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
          onDatesChange={({startDate, endDate}) => {
            setStartDate(startDate);
            setEndDate(endDate);
          }}
        />
      </FieldWrapper>
      <ButtonsWrapper>
        <ModalButton primary label={t('search')} onClick={handleSubmit} />
        <ModalButton link label={t('cancel')} onClick={onClose} />
      </ButtonsWrapper>
    </Modal>
  );
}

DateModal.defaultProps = defaultProps;

export {DateModal};
