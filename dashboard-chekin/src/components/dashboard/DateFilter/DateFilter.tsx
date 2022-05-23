import React, {MouseEventHandler, MouseEvent} from 'react';
import i18n from 'i18next';
import moment, {Moment} from 'moment';
import {useModalControls} from '../../../utils/hooks';
import removeIcon from '../../../assets/remove.svg';
import calendarIcon from '../../../assets/calendar-icon.svg';
import SearchButton from '../SearchButton';
import DateModal from '../DateModal';
import {ArrowSpan, CalendarIcon, Filter, IconsBlock, RemoveIcon, Wrapper} from './styled';

type DatePayloadProps = {
  startDate: Moment | null;
  endDate: Moment | null;
  isDatesNull: boolean;
};
function DatePayload({isDatesNull, startDate, endDate}: DatePayloadProps) {
  const startDateString = startDate
    ? moment(startDate).format('DD-MM-YYYY')
    : '00-00-0000';
  const endDateString = endDate ? moment(endDate).format('DD-MM-YYYY') : '00-00-0000';

  if (isDatesNull) return <>{i18n.t('by_date')}</>;
  return (
    <>
      {startDateString}
      <ArrowSpan>→</ArrowSpan>
      {endDateString}
    </>
  );
}

type DateFilterProps = {
  startDate: Moment | null;
  endDate: Moment | null;
  onRemove: MouseEventHandler<HTMLImageElement>;
  onChange: (changedDates: {from: Moment | null; to: Moment | null}) => void;
};

function DateFilter({startDate, endDate, onRemove, onChange}: DateFilterProps) {
  const isDatesNull = !startDate && !endDate;
  const {
    isOpen: isSearchDateModalOpen,
    openModal: openSearchCustomDateModal,
    closeModal: closeSearchDateModal,
  } = useModalControls();

  const handleRemoveDates = (event: MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
    onRemove(event);
  };

  return (
    <div>
      <Wrapper onClick={openSearchCustomDateModal}>
        <Filter>
          <DatePayload
            isDatesNull={isDatesNull}
            startDate={startDate}
            endDate={endDate}
          />
        </Filter>
        <IconsBlock>
          <RemoveIcon
            onClick={handleRemoveDates}
            src={removeIcon}
            isVisible={!isDatesNull}
            alt="Cross"
          />
          <SearchButton
            onClick={openSearchCustomDateModal}
            icon={<CalendarIcon src={calendarIcon} alt="" />}
          />
        </IconsBlock>
      </Wrapper>
      <DateModal
        open={isSearchDateModalOpen}
        onClose={closeSearchDateModal}
        defaultStartDate={startDate}
        defaultEndDate={endDate}
        onSubmit={onChange}
      />
    </div>
  );
}

export {DateFilter};
