import React from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {useIsFormTouched} from '../../../utils/hooks';
import i18n from '../../../i18n';
import Section from '../Section';
import Switch from '../Switch';
import Input from '../Input';
import Pagination from '../Pagination';
import {InputEventType, Room} from '../../../utils/types';
import {
  Content,
  RoomsCountInputWrapper,
  RoomsList,
  RoomsListHeader,
  TooltipContentItem,
} from './styled';
import {getRequiredOrOptionalFieldLabel} from '../../../utils/common';

export enum FORM_NAMES {
  number_of_spaces = 'number_of_spaces',
}

const displayFields = {
  [FORM_NAMES.number_of_spaces]: true,
};

const defaultValues = {
  [FORM_NAMES.number_of_spaces]: 0,
};

const PAGE_SIZE = 9;
const MIN_ROOMS_NUMBER = 0;
const MAX_ROOMS_NUMBER = 999;

const TOOLTIP_CONTENT = (
  <>
    <TooltipContentItem>{i18n.t('your_property_can_be_divided')}</TooltipContentItem>
    <TooltipContentItem>{i18n.t('this_procedure_will_be_useful')}</TooltipContentItem>
  </>
);

type HousingSpacesSectionProps = {
  disabled: boolean;
  initSpaces?: Array<any>;
  setIsSectionTouched?: (isTouched: boolean) => void;
  setRooms: (rooms: any | Room[]) => void;
  rooms: Room[];
};

const defaultProps: Partial<HousingSpacesSectionProps> = {
  disabled: false,
  initSpaces: [],
};

const HousingSpacesSection = React.forwardRef(
  (
    {
      disabled,
      initSpaces,
      setIsSectionTouched,
      setRooms,
      rooms,
    }: HousingSpacesSectionProps,
    ref,
  ) => {
    const {t} = useTranslation();
    const [activeSpaces, setActiveSpaces] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState<number>(0);
    const {
      register,
      setValue,
      watch,
      formState: {errors},
    } = useFormContext();
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      displayFields,
      defaultValues,
      watch,
    });

    const numberOfSpaces = watch(FORM_NAMES.number_of_spaces);

    React.useEffect(() => {
      if (typeof setIsSectionTouched === 'function') {
        setIsSectionTouched(isFormTouched);
      }
    }, [isFormTouched, setIsSectionTouched]);

    React.useImperativeHandle(ref, () => {
      return {
        active: activeSpaces,
      };
    });

    const loadInitSpaces = React.useCallback(() => {
      if (!initSpaces?.length) {
        return;
      }

      setActiveSpaces(Boolean(initSpaces!.length));
      setRooms(initSpaces!);
      setValue(FORM_NAMES.number_of_spaces, initSpaces!.length);
      setUntouchedValues({
        [FORM_NAMES.number_of_spaces]: initSpaces!.length,
      });
    }, [initSpaces, setRooms, setUntouchedValues, setValue]);

    React.useEffect(() => {
      loadInitSpaces();
    }, [loadInitSpaces]);

    React.useEffect(() => {
      if (activeSpaces && initSpaces) {
        loadInitSpaces();
      }
    }, [initSpaces, activeSpaces, loadInitSpaces]);

    const resetForm = () => {
      setValue(FORM_NAMES.number_of_spaces, 0);
      setRooms([]);
    };

    const setSectionTouched = React.useCallback(() => {
      if (typeof setIsSectionTouched === 'function') {
        setIsSectionTouched(true);
      }
    }, [setIsSectionTouched]);

    const toggleActiveCheckInOnline = () => {
      setActiveSpaces((prevState) => {
        if (prevState) {
          resetForm();
        }
        return !prevState;
      });

      setSectionTouched();
    };

    React.useEffect(() => {
      if (!numberOfSpaces) {
        setCurrentPage(0);
        setRooms([]);
        return;
      }

      setRooms((prevState: Room[]) => {
        setCurrentPage(0);
        if (numberOfSpaces && numberOfSpaces >= MIN_ROOMS_NUMBER) {
          let newRooms: Room[] = [...prevState];

          if (numberOfSpaces > prevState.length) {
            for (let i = prevState.length; i < numberOfSpaces; i++) {
              newRooms[i] = {
                number: '',
                id: initSpaces?.[i]?.id,
                housing_id: initSpaces?.[i]?.housing_id,
              };
            }
          }

          if (numberOfSpaces < prevState.length) {
            newRooms = newRooms.slice(0, numberOfSpaces);
          }
          return newRooms;
        }
        return prevState;
      });
    }, [initSpaces, numberOfSpaces, setRooms]);

    const handleRoomNameChange = (event: InputEventType, index: number) => {
      let newRooms = [...rooms];
      newRooms[PAGE_SIZE * currentPage + index].number = event.target?.value;
      setRooms(newRooms);

      setSectionTouched();
    };

    const getCurrentVisibleRoomsInputs = () => {
      return rooms.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
    };

    const onCurrentPageChange = (page: number) => {
      setCurrentPage(page);
    };

    return (
      <Section
        title={t('spaces_title')}
        subtitle={t('spaces_subtitle')}
        subtitleTooltip={TOOLTIP_CONTENT}
      >
        <Content>
          <Switch
            checked={activeSpaces}
            onChange={toggleActiveCheckInOnline}
            label={t('divide_the_property_into_spaces')}
            disabled={disabled}
          />
          {activeSpaces && (
            <>
              <RoomsCountInputWrapper>
                <Input
                  {...register(FORM_NAMES.number_of_spaces, {
                    min: {
                      value: MIN_ROOMS_NUMBER,
                      message: t('the_hotel_must_have_at_least_number_rooms', {
                        number: MIN_ROOMS_NUMBER,
                      }),
                    },
                    max: {
                      value: MAX_ROOMS_NUMBER,
                      message: t('max_number_is', {
                        number: MAX_ROOMS_NUMBER,
                      }),
                    },
                  })}
                  label={getRequiredOrOptionalFieldLabel(t('number_of_spaces'), false)}
                  type="number"
                  error={errors[FORM_NAMES.number_of_spaces]?.message}
                  placeholder={t('enter_number')}
                  disabled={disabled}
                />
              </RoomsCountInputWrapper>
              {Boolean(rooms.length) && (
                <>
                  <RoomsListHeader>{t('you_can_assign')}</RoomsListHeader>
                  <RoomsList>
                    {getCurrentVisibleRoomsInputs().map((room, index) => {
                      return (
                        <Input
                          key={index}
                          value={room.number}
                          onChange={(event: InputEventType) =>
                            handleRoomNameChange(event, index)
                          }
                          label={`Space ${currentPage * PAGE_SIZE + index + 1}`}
                          placeholder={t('enter_text')}
                          disabled={disabled}
                        />
                      );
                    })}
                  </RoomsList>
                  {numberOfSpaces > PAGE_SIZE && (
                    <Pagination
                      onPageChange={onCurrentPageChange}
                      pages={Math.ceil(Number(numberOfSpaces) / PAGE_SIZE)}
                      page={currentPage}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Content>
      </Section>
    );
  },
);

HousingSpacesSection.defaultProps = defaultProps;
export {HousingSpacesSection};
