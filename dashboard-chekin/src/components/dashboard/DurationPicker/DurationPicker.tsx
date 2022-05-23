import React from 'react';
import {useTranslation} from 'react-i18next';
import {useModalControls} from '../../../utils/hooks';
import {DAY_NAMES, DAY_TRANSLATIONS} from '../../../utils/constants';
import {SelectOption} from '../../../utils/types';
import displayIcon from 'assets/display-icn.svg';
import Modal from '../Modal';
import {ErrorMessage} from '../../../styled/common';
import {
  AvailabilityContainer,
  Container,
  contentStyle,
  DayCheckboxWrapper,
  DisplayIcon,
  GridRow,
  Hr,
  SmallSelect,
  StyledCheckbox,
  SubmitButton,
  Text,
  TimeContainer,
  TimeText,
  Preview,
  PreviewAvailability,
  AndMorePreviewText,
  RightSideContainerArea,
  ContainerWrapper,
} from './styled';

const timePlaceholder = '00:00';

function buildTimeOptions() {
  const timeOptions: {value: string; label: string}[] = [];

  let hours = 0;
  let minutes = 0;

  for (let i = 0; i < 24 * (60 / 15); i++) {
    const result = `${hours >= 10 ? hours : `0${hours}`}:${
      minutes >= 10 ? minutes : `0${minutes}`
    }`;
    timeOptions.push({value: result, label: result});

    if (minutes === 45 && hours !== 24) {
      hours += 1;
      minutes = 0;
    } else {
      minutes += 15;
    }
  }

  return timeOptions;
}

export const AVAILABILITY_TIME_OPTIONS = buildTimeOptions();
const midnight = AVAILABILITY_TIME_OPTIONS[0];
const daysList = Object.values(DAY_NAMES) as DAY_NAMES[];

export type State = Record<
  DAY_NAMES,
  {
    isAllDay: boolean;
    isChecked: boolean;
    startTime: SelectOption | null;
    endTime: SelectOption | null;
    startOptions: SelectOption[];
    endOptions: SelectOption[];
  }
>;

type Action =
  | {type: 'TOGGLE_ALL_DAY'; day: DAY_NAMES}
  | {type: 'SELECT_START_TIME'; day: DAY_NAMES; time: SelectOption}
  | {
      type: 'SELECT_END_TIME';
      day: DAY_NAMES;
      time: SelectOption;
    }
  | {
      type: 'INIT_STATE';
      state: State;
    }
  | {
      type: 'SET_STATE';
      state: State;
    };

function updateDay(
  state: State,
  day: DAY_NAMES,
  payload: Partial<State[keyof State]>,
): State {
  return {
    ...state,
    [day]: {
      ...state[day],
      ...payload,
    },
  };
}

function updateAllDays(payload: State[keyof State]): State {
  const nextState: State = {} as any;

  daysList.forEach((day) => {
    nextState[day] = payload;
  });
  return nextState;
}

function keepEverydayIsAllDayUpdated(state: State, nextIsAllDay: boolean): State {
  if (!state[DAY_NAMES.everyday].isChecked && nextIsAllDay) {
    const isAllChecked = daysList.every((day) => {
      if (day === DAY_NAMES.everyday) {
        return true;
      }
      return state[day].isAllDay;
    });

    if (isAllChecked) {
      return updateDay(state, DAY_NAMES.everyday, {
        isChecked: true,
        isAllDay: true,
      });
    }
  }

  if (state[DAY_NAMES.everyday].isChecked && !nextIsAllDay) {
    return updateDay(state, DAY_NAMES.everyday, {
      isChecked: false,
      isAllDay: false,
    });
  }

  return state;
}

function keepEverydayTimeUpdated(
  state: State,
  {
    startTime,
    endTime,
  }: {
    startTime: SelectOption | null;
    endTime: SelectOption | null;
  },
): State {
  if (startTime || endTime) {
    const isSameTime = daysList.every((day) => {
      if (day === DAY_NAMES.everyday) {
        return true;
      }

      return (
        state[day].startTime?.value === startTime?.value &&
        state[day].endTime?.value === endTime?.value
      );
    });

    if (isSameTime) {
      const isAllDay =
        startTime?.value === midnight.value && endTime?.value === midnight.value;

      return updateAllDays({
        isAllDay,
        startTime,
        endTime,
        endOptions: state[DAY_NAMES.monday].endOptions,
        startOptions: state[DAY_NAMES.monday].startOptions,
        isChecked: true,
      });
    }

    if (state[DAY_NAMES.everyday].isChecked) {
      return updateDay(state, DAY_NAMES.everyday, {
        startTime: null,
        endTime: null,
        isChecked: false,
        endOptions: AVAILABILITY_TIME_OPTIONS,
        startOptions: AVAILABILITY_TIME_OPTIONS,
      });
    }
  }

  return state;
}

function getNextEndTimeAndOptions(state: State, day: DAY_NAMES, startTime: SelectOption) {
  const startTimeIndex = AVAILABILITY_TIME_OPTIONS.findIndex((option) => {
    return option.value === startTime.value;
  });
  const nextEndTimeOptions = [
    ...AVAILABILITY_TIME_OPTIONS.slice(startTimeIndex + 1),
    AVAILABILITY_TIME_OPTIONS[0],
  ];
  const isValidEndTime = nextEndTimeOptions.find((option) => {
    return state[day].endTime?.value === option.value;
  });
  const nextEndTime = isValidEndTime ? state[day].endTime : midnight;

  return {
    nextEndTime,
    nextEndTimeOptions,
  };
}

const initReducerState: State = updateAllDays({
  isAllDay: false,
  startTime: null,
  endTime: null,
  startOptions: AVAILABILITY_TIME_OPTIONS,
  endOptions: AVAILABILITY_TIME_OPTIONS,
  isChecked: false,
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_ALL_DAY': {
      const nextIsAllDay = !state[action.day].isAllDay;
      const payload: State[keyof State] = {
        isAllDay: nextIsAllDay,
        isChecked: nextIsAllDay,
        startTime: null,
        endTime: null,
        startOptions: AVAILABILITY_TIME_OPTIONS,
        endOptions: AVAILABILITY_TIME_OPTIONS,
      };

      if (action.day === DAY_NAMES.everyday) {
        return updateAllDays(payload);
      }

      const nextState = updateDay(state, action.day, payload);
      return keepEverydayIsAllDayUpdated(nextState, nextIsAllDay);
    }
    case 'SELECT_START_TIME': {
      const {nextEndTime, nextEndTimeOptions} = getNextEndTimeAndOptions(
        state,
        action.day,
        action.time,
      );
      const isAllDay =
        action.time.value === midnight.value && nextEndTime?.value === midnight.value;

      const payload: State[keyof State] = {
        isAllDay,
        isChecked: true,
        startTime: action.time,
        endTime: nextEndTime,
        startOptions: AVAILABILITY_TIME_OPTIONS,
        endOptions: nextEndTimeOptions,
      };

      if (action.day === DAY_NAMES.everyday) {
        return updateAllDays(payload);
      }

      const nextState = updateDay(state, action.day, payload);
      const nextStateWithUpdatedEveryday = updateDay(nextState, DAY_NAMES.everyday, {
        ...nextState[DAY_NAMES.everyday],
        isAllDay: false,
        isChecked: false,
      });
      return keepEverydayTimeUpdated(nextStateWithUpdatedEveryday, {
        endTime: nextEndTime,
        startTime: action.time,
      });
    }
    case 'SELECT_END_TIME': {
      const nextStartTime = state[action.day].startTime || midnight;
      const isAllDay =
        action.time.value === midnight.value && nextStartTime?.value === midnight.value;
      const payload: State[keyof State] = {
        isAllDay,
        endTime: action.time,
        isChecked: true,
        startTime: nextStartTime,
        endOptions: state[action.day].endOptions,
        startOptions: state[action.day].startOptions,
      };

      if (action.day === DAY_NAMES.everyday) {
        return updateAllDays(payload);
      }
      const nextState = updateDay(state, action.day, payload);
      const nextStateWithUpdatedEveryday = updateDay(nextState, DAY_NAMES.everyday, {
        ...nextState[DAY_NAMES.everyday],
        isAllDay: false,
        isChecked: false,
      });
      return keepEverydayTimeUpdated(nextStateWithUpdatedEveryday, {
        startTime: nextStartTime,
        endTime: action.time,
      });
    }
    case 'INIT_STATE': {
      const initState = {...action.state};

      daysList.forEach((day) => {
        const dayData = initState[day];

        initState[day] = {
          ...dayData,
          endOptions: AVAILABILITY_TIME_OPTIONS,
          startOptions: AVAILABILITY_TIME_OPTIONS,
        };

        if (dayData.startTime) {
          const {nextEndTime, nextEndTimeOptions} = getNextEndTimeAndOptions(
            state,
            day,
            dayData.startTime,
          );

          initState[day].endOptions = nextEndTimeOptions;
          initState[day].endTime = dayData.endTime || nextEndTime;
        }
      });

      return initState;
    }
    case 'SET_STATE': {
      return action.state;
    }
    default: {
      return state;
    }
  }
}

function getIsAnyDayActive(state: State) {
  return daysList.some((day) => {
    return state[day].isChecked;
  });
}

type DurationPickerProps = {
  onChange: (state: State) => void;
  initState?: State;
  error?: string;
  disabled?: boolean;
};

function DurationPicker({
  onChange,
  error,
  disabled,
  initState = initReducerState,
}: DurationPickerProps) {
  const {t} = useTranslation();
  const {isOpen, closeModal, openModal} = useModalControls();
  const [state, dispatch] = React.useReducer(reducer, initState);
  const [prevState, setPrevState] = React.useState<State | null>(null);

  const canSubmit = React.useMemo(() => {
    return getIsAnyDayActive(state);
  }, [state]);

  React.useEffect(() => {
    if (initState) {
      dispatch({
        type: 'INIT_STATE',
        state: initState,
      });
    }
  }, [initState]);

  const displayDays = React.useMemo(() => {
    return daysList.filter((day) => {
      return state[day].isChecked;
    });
  }, [state]);
  const displayDay = displayDays[0];

  const handleModalOpen = () => {
    setPrevState(state);
    openModal();
  };

  const handleModalClose = () => {
    if (prevState) {
      dispatch({
        type: 'SET_STATE',
        state: prevState,
      });
    }
    closeModal();
  };

  const handleSave = () => {
    onChange(state);
    setPrevState(null);
    closeModal();
  };

  return (
    <div>
      <Modal
        closeOnDocumentClick
        closeOnEscape
        withCloseButton
        contentStyle={contentStyle}
        open={isOpen}
        onClose={handleModalClose}
      >
        <AvailabilityContainer>
          {daysList.map((day, index) => {
            const isFirstItem = index === 0;

            return (
              <React.Fragment key={day}>
                {!isFirstItem && <Hr />}
                <GridRow>
                  <DayCheckboxWrapper>
                    <StyledCheckbox
                      label={t(DAY_TRANSLATIONS[day])}
                      onChange={() => {
                        dispatch({
                          type: 'TOGGLE_ALL_DAY',
                          day,
                        });
                      }}
                      checked={state[day].isChecked}
                    />
                  </DayCheckboxWrapper>
                  <StyledCheckbox
                    label={t('all_day')}
                    onChange={() => {
                      dispatch({
                        type: 'TOGGLE_ALL_DAY',
                        day,
                      });
                    }}
                    checked={state[day].isAllDay}
                  />
                  <TimeContainer>
                    <TimeText>{t('or_starts_at')}:</TimeText>
                    <SmallSelect
                      placeholder={timePlaceholder}
                      options={state[day].startOptions}
                      value={state[day].startTime}
                      onChange={(option: SelectOption) => {
                        dispatch({
                          day,
                          type: 'SELECT_START_TIME',
                          time: option,
                        });
                      }}
                    />
                    <TimeText>{t('ends_at')}:</TimeText>
                    <SmallSelect
                      placeholder={timePlaceholder}
                      options={state[day].endOptions}
                      value={state[day].endTime}
                      onChange={(option: SelectOption) => {
                        dispatch({
                          day,
                          type: 'SELECT_END_TIME',
                          time: option,
                        });
                      }}
                    />
                  </TimeContainer>
                </GridRow>
              </React.Fragment>
            );
          })}
        </AvailabilityContainer>
        <SubmitButton disabled={!canSubmit} label={t('save')} onClick={handleSave} />
      </Modal>
      <ContainerWrapper>
        <Container
          disabled={disabled}
          invalid={Boolean(error)}
          onClick={handleModalOpen}
          type="button"
        >
          {displayDay ? (
            <>
              <Preview>
                {t(DAY_TRANSLATIONS[displayDay])}
                <PreviewAvailability>
                  {state[displayDay].isAllDay
                    ? t('all_day')
                    : `${state[displayDay].startTime?.label} - ${state[displayDay].endTime?.label}`}
                </PreviewAvailability>
              </Preview>
            </>
          ) : (
            <Text>{t('enter_days_and_hours')}</Text>
          )}
          <RightSideContainerArea>
            <AndMorePreviewText>
              {displayDays.length > 1 &&
                displayDay !== DAY_NAMES.everyday &&
                t('and_number_more', {number: displayDays.length - 1})}
            </AndMorePreviewText>
            <DisplayIcon src={displayIcon} alt="Open duration modal" />
          </RightSideContainerArea>
        </Container>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </ContainerWrapper>
    </div>
  );
}

export {DurationPicker};
