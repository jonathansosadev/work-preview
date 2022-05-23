import React from 'react';
import moment from 'moment';
import {FormProvider, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {InfiniteData, useMutation, useQuery, useQueryClient} from 'react-query';
import i18n from '../../../i18n';
import api, {queryFetcher} from 'api';
import {useConfirmLeaveModal} from 'context/openModals';
import {getBase64, getSearchParamFromUrl, toastResponseError} from 'utils/common';
import {useIsMounted, useModalControls, useScrollToTop} from 'utils/hooks';
import {FormTypes} from './types';
import {DAY_NAMES} from 'utils/constants';
import {UPSELLING_LINKS} from '../../../utils/links';
import {Housing, Paginated, SelectOption, UserBusinessInformation} from 'utils/types';
import {
  availabilityDay,
  checkTemplateIsWaivo,
  FORM_NAMES,
  INTERNAL_SUPPLIER_OPTION,
  OFFER_CATEGORIES,
  OFFER_CATEGORIES_OPTIONS,
  OFFER_CONFIRM_TYPE_OPTIONS,
  OFFER_CONFIRM_TYPES,
  OFFER_TEMPLATES,
  OFFER_TEMPLATES_DATA,
  PRICE_TYPE_OPTIONS,
  PRICES_FIELD,
  PRICE_UNITS_OPTIONS,
  SUPPLIER_CATEGORIES,
  EXTRA_PRICE_FORM_NAMES,
} from 'utils/upselling';
import {Offer, Supplier} from '../../../utils/upselling/types';
import {
  OFFER_IMAGE_FILTERS,
  OfferPicture,
} from '../PictureLibraryModal/PictureLibraryModal';
import {
  AVAILABILITY_TIME_OPTIONS,
  State as AvailabilityState,
} from '../DurationPicker/DurationPicker';
import floppyDisc from 'assets/floppy-disk.svg';
import checkIcon from '../../../assets/check-green.svg';
import ModalButton from '../ModalButton';
import Modal from '../Modal';
import OfferInformationSection from '../OfferInformationSection';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import OfferPictureSection from '../OfferPictureSection';
import OfferAvailabilitySection from '../OfferAvailabilitySection';
import OfferSelectHousingsSection from '../OfferSelectHousingsSection';
import OfferPhonePreview from '../OfferPhonePreview';
import IncompleteFormDataModal from '../IncompleteFormDataModal';
import WaivoCompanyRegistrationModal from '../WaivoCompanyRegistrationModal';
import OfferPriceSection from '../OfferPriceSection';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {SubmitButton} from './styled';

export const BusinessInformationQueryKey = 'businessInformationKey';
export const TEMPLATE_URL_PARAM = 'template';

type Params = {
  id?: string;
};

type LocationState = {
  housingURL?: string;
};

function getOfferPayloadTemplate(data: FormTypes, template: OFFER_TEMPLATES) {
  switch (template) {
    case OFFER_TEMPLATES.waivo1500:
    case OFFER_TEMPLATES.waivo2500:
    case OFFER_TEMPLATES.waivo5000:
      return {
        [EXTRA_PRICE_FORM_NAMES.feeToGuest]: undefined,
        [EXTRA_PRICE_FORM_NAMES.revenueToHost]: undefined,
        [FORM_NAMES.pricesItems]: [],
        pricing_policy_values: {
          [EXTRA_PRICE_FORM_NAMES.revenueToHost]:
            data[EXTRA_PRICE_FORM_NAMES.revenueToHost] || undefined,
        },
      };
    default:
      return {};
  }
}

function fetchBusinessInformation() {
  return queryFetcher(api.users.ENDPOINTS.businessInformation());
}

type OfferDetailsProps = {
  setHeaderTitle: React.Dispatch<React.SetStateAction<string>>;
  setHeaderBackLink: React.Dispatch<React.SetStateAction<string>>;
};

function OfferDetails({setHeaderTitle, setHeaderBackLink}: OfferDetailsProps) {
  useScrollToTop();
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const history = useHistory();
  const params = useParams<Params>();
  const location = useLocation<LocationState>();
  const formMethods = useForm<FormTypes>({
    defaultValues: {
      [FORM_NAMES.selectedHousings]: undefined,
      [FORM_NAMES.duration]: undefined,
      [FORM_NAMES.title]: '',
      [FORM_NAMES.description]: '',
      [FORM_NAMES.pricesItems]: [],
      [FORM_NAMES.picture]: undefined,
      [FORM_NAMES.highlight]: '',
      [FORM_NAMES.spots]: '',
      [FORM_NAMES.supplier]: INTERNAL_SUPPLIER_OPTION,
      [FORM_NAMES.confirmation_type]:
        OFFER_CONFIRM_TYPE_OPTIONS[OFFER_CONFIRM_TYPES.auto],
      [FORM_NAMES.category]: OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.others],
      [EXTRA_PRICE_FORM_NAMES.revenueToHost]: '',
      [EXTRA_PRICE_FORM_NAMES.feeToGuest]: '',
    },
  });

  const {
    register,
    reset,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: {dirtyFields},
  } = formMethods;

  const isDirty = Boolean(Object.values(dirtyFields).length);
  const {
    isDoYouWantToSaveModalOpen,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
  } = useConfirmLeaveModal(isDirty);

  const {
    openModal: openIncompleteModal,
    closeModal: closeIncompleteModal,
    isOpen: isIncompleteModalOpen,
  } = useModalControls();
  const {
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
    isOpen: isSuccessModalOpen,
  } = useModalControls();
  const {
    isOpen: isWaivoCompanyRegistrationModalOpen,
    openModal: openWaivoCompanyRegistrationModal,
    closeModal: closeWaivoCompanyRegistrationModal,
  } = useModalControls();
  const [isIncompleteModalShown, setIsIncompleteModalShown] = React.useState(false);
  const [initAvailabilityState, setInitAvailabilityState] = React.useState<
    AvailabilityState
  >();
  const [offerId, setOfferId] = React.useState(params?.id || '');
  const [offer, setOffer] = React.useState<Offer | null>(null);
  const isSubmittedWaivoCompanyInfoRef = React.useRef(false);

  const offerTemplate = React.useMemo(() => {
    if (offer) {
      return OFFER_TEMPLATES_DATA[offer?.template || OFFER_TEMPLATES.custom];
    }
    const template = getSearchParamFromUrl<OFFER_TEMPLATES>(
      TEMPLATE_URL_PARAM,
      location.search,
    );
    if (!template) return OFFER_TEMPLATES_DATA[OFFER_TEMPLATES.custom];

    return OFFER_TEMPLATES_DATA[template];
  }, [location.search, offer]);

  const isWaivoTemplate = checkTemplateIsWaivo(offerTemplate.value);

  const suppliersQueryParams = `?category=${
    offerTemplate.suppliersCategory || SUPPLIER_CATEGORIES.standard
  }`;
  const {data: suppliers = [], isLoading: isLoadingSuppliers} = useQuery<Supplier[]>(
    api.upselling.ENDPOINTS.suppliers(suppliersQueryParams),
    {
      onError: (error: any) => {
        toastResponseError(error);
      },
    },
  );

  const suppliersOptions: SelectOption[] = React.useMemo(() => {
    if (!suppliers) {
      return [INTERNAL_SUPPLIER_OPTION];
    }

    return [
      INTERNAL_SUPPLIER_OPTION,
      ...suppliers.map((supplier) => {
        return {
          value: supplier.id,
          label: supplier.name,
        };
      }),
    ];
  }, [suppliers]);

  const filterQuery = React.useMemo(() => {
    const templateFilter = offerTemplate?.housingsFilter;
    if (!templateFilter) return '';
    return Object.entries(templateFilter).reduce<string>((acc, [param, values]) => {
      const valueQuery = values?.join() || values;
      acc += `&${param}=${valueQuery}`;
      return acc;
    }, '');
  }, [offerTemplate?.housingsFilter]);

  const {data: housings, isLoading: isLoadingHousingOptions} = useQuery<
    Pick<Housing, 'id' | 'name'>[]
  >(api.housings.ENDPOINTS.all(`ordering=name&fields=id,name${filterQuery}`), {
    initialData: () => {
      const infiniteFullHousings = queryClient.getQueryData<
        InfiniteData<Paginated<Housing>>
      >(['housings'], {
        exact: false,
      });

      const fullHousingsResults = infiniteFullHousings?.pages
        ?.map((page) => page.results || [])
        .filter((results) => results.length)
        .flat()
        .map((housing) => {
          return {id: housing!.id, name: housing!.name};
        });

      return fullHousingsResults;
    },
    onError: (error: any) => {
      toastResponseError(error);
    },
  });
  const housingOptions = React.useMemo(() => {
    if (!housings) {
      return [];
    }

    return housings?.map((housing) => {
      return {
        value: housing.id,
        label: housing.name,
      };
    });
  }, [housings]);

  const offerTemplateImageId =
    offerTemplate && offerTemplate.fields?.[FORM_NAMES.picture]?.value;
  useQuery<OfferPicture>(api.upselling.ENDPOINTS.oneOfferImage(offerTemplateImageId!), {
    enabled: Boolean(offerTemplateImageId),
    refetchOnWindowFocus: false,
    onSuccess: (picture) => {
      setValue(FORM_NAMES.picture, picture, {
        shouldDirty: false,
        shouldValidate: true,
      });
    },
  });

  const getAvailabilityDurationFromOffer = (offer: Offer) => {
    const offerDurationAvailability = [...offer.availability[FORM_NAMES.duration]];
    let everydayStartTime: SelectOption | null = null;
    let everydayEndTime: SelectOption | null = null;

    const duration = offerDurationAvailability.reduce<AvailabilityState>(
      (acc, curr) => {
        const startTime =
          curr.hours_start &&
          AVAILABILITY_TIME_OPTIONS.find((option) => {
            return option.value === moment(curr.hours_start, 'HH:mm:ss').format('HH:mm');
          });
        const endTime =
          curr.hours_end &&
          AVAILABILITY_TIME_OPTIONS.find((option) => {
            return option.value === moment(curr.hours_end, 'HH:mm:ss').format('HH:mm');
          });

        const isChecked = Boolean(curr.is_all_day || (endTime && startTime));

        acc = {
          ...acc,
          [curr.weekday]: {
            isChecked,
            isAllDay: curr.is_all_day,
            endTime: !curr.is_all_day && endTime ? endTime : null,
            startTime: !curr.is_all_day && startTime ? startTime : null,
            startOptions: [],
            endOptions: [],
          },
        };

        return acc;
      },
      {
        [DAY_NAMES.monday]: availabilityDay,
        [DAY_NAMES.tuesday]: availabilityDay,
        [DAY_NAMES.wednesday]: availabilityDay,
        [DAY_NAMES.thursday]: availabilityDay,
        [DAY_NAMES.friday]: availabilityDay,
        [DAY_NAMES.sunday]: availabilityDay,
        [DAY_NAMES.saturday]: availabilityDay,
        [DAY_NAMES.everyday]: availabilityDay,
      },
    );

    const daysList = Object.values(DAY_NAMES).filter((day) => {
      return day !== DAY_NAMES.everyday;
    }) as DAY_NAMES[];

    const isEverydayAllDayChecked = daysList.every((day) => {
      const dayAvailability = duration[day];
      if (!dayAvailability) {
        return false;
      }

      return dayAvailability.isAllDay;
    });

    const isSameEverydayTime = daysList.every((day, index) => {
      const dayAvailability = duration[day];
      if (!dayAvailability) {
        return false;
      }

      const prevDayName = daysList[index - 1];
      const prevDayAvailability = duration[prevDayName];

      if (!prevDayAvailability) {
        const nextDayAvailability = duration[daysList[index + 1]];
        return Boolean(
          dayAvailability.startTime && dayAvailability.endTime && nextDayAvailability,
        );
      }

      everydayStartTime = dayAvailability.startTime;
      everydayEndTime = dayAvailability.endTime;

      return (
        dayAvailability.startTime === prevDayAvailability.startTime &&
        dayAvailability.endTime === prevDayAvailability.endTime
      );
    });

    duration[DAY_NAMES.everyday] = {
      isChecked: isEverydayAllDayChecked || isSameEverydayTime,
      isAllDay: isEverydayAllDayChecked,
      startTime: isSameEverydayTime ? everydayStartTime : null,
      endTime: isSameEverydayTime ? everydayEndTime : null,
      startOptions: [],
      endOptions: [],
    };

    return duration;
  };

  const preloadFormData = React.useCallback(
    (offer: Offer) => {
      const supplier =
        suppliersOptions.find((supplier) => {
          return supplier.value === offer[FORM_NAMES.supplier];
        }) || INTERNAL_SUPPLIER_OPTION;
      const confirmation_type = OFFER_CONFIRM_TYPE_OPTIONS[offer.confirmation_type];
      const category = OFFER_CATEGORIES_OPTIONS[offer.category];
      const spots = String(offer.availability[FORM_NAMES.spots]);
      const duration = getAvailabilityDurationFromOffer(offer);
      const offerHousingsIds = offer[FORM_NAMES.selectedHousings];
      const selectedHousings =
        offerHousingsIds?.length &&
        housingOptions.filter((option) => {
          return offerHousingsIds.includes(option.value);
        });

      const pricesItems = offer[FORM_NAMES.pricesItems]?.map((item) => ({
        ...item,
        [PRICES_FIELD.name]: item[PRICES_FIELD.name] || undefined,
        [PRICES_FIELD.unit]: PRICE_UNITS_OPTIONS[item[PRICES_FIELD.unit] || ''],
      }));
      const priceTypeOption = PRICE_TYPE_OPTIONS[offer[FORM_NAMES.priceType || '']];

      const waivoRevenue = parseFloat(
        String(
          offer[FORM_NAMES.extraDetailedPrice]?.[EXTRA_PRICE_FORM_NAMES.revenueToHost],
        ) || '0.00',
      );

      const waivoFeeToGuest = parseFloat(
        String(offer?.[FORM_NAMES.pricesItems]?.[0]?.price) || '0.00',
      );

      reset({
        [FORM_NAMES.title]: offer[FORM_NAMES.title],
        [FORM_NAMES.description]: offer[FORM_NAMES.description],
        [FORM_NAMES.highlight]: offer[FORM_NAMES.highlight],
        [FORM_NAMES.supplier]: supplier,
        [FORM_NAMES.confirmation_type]: confirmation_type,
        [FORM_NAMES.category]: category,
        [FORM_NAMES.pricesItems]: pricesItems,
        [FORM_NAMES.priceType]: priceTypeOption,
        [FORM_NAMES.spots]: spots,
        [FORM_NAMES.duration]: duration,
        [FORM_NAMES.selectedHousings]: selectedHousings || undefined,
        [FORM_NAMES.picture]: offer[FORM_NAMES.picture],
      });
      setValue(EXTRA_PRICE_FORM_NAMES.revenueToHost, waivoRevenue);
      setValue(EXTRA_PRICE_FORM_NAMES.feeToGuest, waivoFeeToGuest);
      setInitAvailabilityState(duration);
    },
    [housingOptions, reset, setValue, suppliersOptions],
  );

  const canLoadOffer = Boolean(
    offerId && !isLoadingSuppliers && !isLoadingHousingOptions,
  );
  const {isLoading: isLoadingOffer} = useQuery<Offer>(
    api.upselling.ENDPOINTS.oneOffer(offerId!),
    {
      enabled: canLoadOffer,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setOffer(data);
        if (isDirty) {
          return;
        }
        preloadFormData(data);
      },
      onError: (error: any) => {
        if (!isMounted.current) {
          return;
        }
        toastResponseError(error);
        history.push(UPSELLING_LINKS.offersList);
      },
    },
  );

  const {data: businessInformation} = useQuery<UserBusinessInformation[], Error>(
    BusinessInformationQueryKey,
    fetchBusinessInformation,
    {
      enabled: isWaivoTemplate,
      onError: toastResponseError,
    },
  );

  const handleSubmitFormAfterCreatedWaivoInfo = () => {
    const isSubmitted = isSubmittedWaivoCompanyInfoRef.current;
    const hasSupplier = !!getValues()?.[FORM_NAMES.supplier]?.value;
    if (isSubmitted && hasBusinessInformation && hasSupplier) {
      handleSubmit(onSubmit)();
      isSubmittedWaivoCompanyInfoRef.current = false;
    }
  };

  const hasBusinessInformation = Boolean(businessInformation?.length);

  const {isLoading: isLoadingWaivoSupplier} = useQuery<Supplier>(
    api.upselling.ENDPOINTS.waivoSupplier(),
    {
      enabled: isWaivoTemplate && hasBusinessInformation,
      refetchOnWindowFocus: false,
      onError: toastResponseError,
      onSuccess: (data) => {
        setValue(FORM_NAMES.supplier, {
          label: i18n.t('waivo'),
          value: data?.id,
        });

        handleSubmitFormAfterCreatedWaivoInfo();
      },
    },
  );

  const offerMutation = useMutation<Offer, any, {payload: Partial<Offer>}>(
    ({payload}) => api.upselling.offerMutation(payload, offerId),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(api.upselling.ENDPOINTS.oneOffer(data.id), data);
        setOfferId(data.id);
        preloadFormData(data);
      },
      onError: (error) => {
        if (!isMounted.current) {
          return;
        }
        toastResponseError(error);
      },
    },
  );
  const offerImageMutation = useMutation<
    OfferPicture,
    any,
    {payload: Partial<OfferPicture>}
  >(({payload}) => api.upselling.offerImageMutation(payload), {
    onError: (error) => {
      if (!isMounted.current) {
        return;
      }

      toastResponseError(error);
    },
  });
  const deleteOfferImageMutation = useMutation<undefined, any, {id: string}>(({id}) =>
    api.upselling.deleteOfferImageMutation(id),
  );

  const isLoading =
    isLoadingSuppliers ||
    isLoadingWaivoSupplier ||
    isLoadingOffer ||
    offerMutation.isLoading ||
    offerImageMutation.isLoading;
  const isSubmitDisabled = isLoading;
  const isOfferPreviewVisible = offer || !isLoading;
  const offerTitle = watch(FORM_NAMES.title);
  const isEditing = params?.id;

  React.useLayoutEffect(
    function setupHeader() {
      setHeaderTitle(t('custom_deal'));
      setHeaderBackLink(UPSELLING_LINKS.offersList);

      return () => {
        setHeaderTitle('');
        setHeaderBackLink('');
      };
    },
    [location.search, setHeaderBackLink, setHeaderTitle, t],
  );

  React.useEffect(() => {
    const title = offerTitle || t('custom_deal');
    setHeaderTitle(title);
  }, [t, offerTitle, setHeaderTitle]);

  register(FORM_NAMES.picture, {
    required: t('required') as string,
  });
  register(FORM_NAMES.selectedHousings, {
    required: t('required') as string,
  });
  React.useEffect(
    function registerComplicatedFormFields() {
      register(FORM_NAMES.duration, {
        required: t('required') as string,
      });
    },
    [register, t],
  );

  React.useEffect(
    function preloadTemplateData() {
      if (offer || offerId) return;
      const fields = Object.keys(offerTemplate?.fields || {}).reduce<
        Record<string, unknown>
      >((acc, fieldName) => {
        acc[fieldName] = offerTemplate?.fields[fieldName as FORM_NAMES]?.value;
        return acc;
      }, {});
      const template = offerTemplate.value;
      const initAvailabilityState = offerTemplate?.fields?.[FORM_NAMES.duration]?.value;

      if (!offerTemplate) return;

      reset({...fields, [FORM_NAMES.template]: template});
      setInitAvailabilityState(initAvailabilityState);
    },
    [location.search, reset, t, offerTemplate, offer, offerId],
  );

  const goBack = () => {
    history.push(UPSELLING_LINKS.offersList);
  };

  const goBackToHousing = () => {
    const url = location.state.housingURL!;
    history.push(url);
  };

  const keepEditing = () => {
    if (!isEditing) {
      history.push(`${UPSELLING_LINKS.offersDetails}/${offerId}`, location.state);
    }
    closeSuccessModal();
  };

  const getPicturePayload = async (
    data: FormTypes,
  ): Promise<Partial<OfferPicture> | undefined> => {
    const picture = data[FORM_NAMES.picture];

    if (!picture) {
      return undefined;
    }

    if (picture instanceof File) {
      const image = await getBase64(picture);
      const offerId =
        offer?.offer_image?.category === OFFER_IMAGE_FILTERS.custom
          ? offer?.offer_image?.id
          : undefined;

      return {
        image,
        id: offerId,
        category: OFFER_IMAGE_FILTERS.custom,
        name: data[FORM_NAMES.title],
      };
    }

    return picture;
  };

  const deletePreviousCustomImage = (data: FormTypes) => {
    const prevOfferPicture = {...offer?.offer_image};
    if (!prevOfferPicture) {
      return;
    }

    const isCustomPrevOfferPicture =
      prevOfferPicture?.category === OFFER_IMAGE_FILTERS.custom;
    const isNewOfferPictureFromLibrary =
      data[FORM_NAMES.picture] instanceof File
        ? false
        : (data[FORM_NAMES.picture] as OfferPicture)?.user_id === null;

    if (isNewOfferPictureFromLibrary && isCustomPrevOfferPicture) {
      deleteOfferImageMutation.mutate({id: prevOfferPicture.id!});
    }
  };

  const mutatePicture = async (data: FormTypes) => {
    const picturePayload = await getPicturePayload(data);
    let result: {error: boolean; data: Partial<OfferPicture> | null} = {
      error: false,
      data: {
        id: picturePayload?.id,
      },
    };
    const isNextImageFromLibrary = picturePayload?.user_id === null;
    const isNextImageFromLibraryOrUnchanged =
      picturePayload?.user_id || isNextImageFromLibrary;

    if (!isNextImageFromLibraryOrUnchanged && picturePayload) {
      await offerImageMutation.mutateAsync(
        {payload: picturePayload},
        {
          onError: () => {
            result.error = true;
          },
          onSuccess: (offerPicture) => {
            result.data = offerPicture;
          },
        },
      );
    }

    if (isNextImageFromLibrary) {
      deletePreviousCustomImage(data);
    }

    return result;
  };

  const getAvailabilityPayload = (state: AvailabilityState) => {
    if (!state) {
      return [];
    }
    return Object.entries(state)
      .filter(([key, value]) => {
        if (key === DAY_NAMES.everyday) {
          return false;
        }
        return (value.startTime?.value && value.endTime?.value) || value.isAllDay;
      })
      .map(([key, value]) => {
        const hoursStart = value.startTime?.value;
        const hoursEnd = value.endTime?.value;
        let result: any = {
          weekday: key as Omit<DAY_NAMES, DAY_NAMES.everyday>,
          is_all_day: value.isAllDay,
        };
        const hasCustomHours = !result.is_all_day && (hoursStart || hoursEnd);

        if (hasCustomHours) {
          result = {
            ...result,
            hours_start: hoursStart,
            hours_end: hoursEnd,
          };
        }

        return result;
      });
  };

  const getOfferPayload = (data: FormTypes, pictureId?: string) => {
    const selectedHousingsIds = data[FORM_NAMES.selectedHousings]?.map((housing) => {
      return housing.value;
    });

    const pricesItems = data[FORM_NAMES.pricesItems]?.length
      ? data[FORM_NAMES.pricesItems].map((priceItem) => ({
          ...priceItem,
          [PRICES_FIELD.name]: priceItem.name || undefined,
          [PRICES_FIELD.unit]: priceItem.unit_type?.value,
        }))
      : [];

    const templatePayload = getOfferPayloadTemplate(data, offerTemplate.value);

    return {
      ...data,
      [FORM_NAMES.spots]: undefined,
      [FORM_NAMES.picture]: undefined,
      [FORM_NAMES.duration]: undefined,
      [FORM_NAMES.priceType]: data[FORM_NAMES.priceType]?.value || undefined,
      [FORM_NAMES.pricesItems]: pricesItems,
      [`${[FORM_NAMES.picture]}_id`]: pictureId,
      [FORM_NAMES.confirmation_type]: data[FORM_NAMES.confirmation_type]
        .value as OFFER_CONFIRM_TYPES,
      [FORM_NAMES.category]: data[FORM_NAMES.category].value as OFFER_CATEGORIES,
      [FORM_NAMES.supplier]: data[FORM_NAMES.supplier].value || undefined,
      [FORM_NAMES.selectedHousings]: selectedHousingsIds,
      availability: {
        [FORM_NAMES.spots]: parseInt(data[FORM_NAMES.spots], 10),
        [FORM_NAMES.duration]: getAvailabilityPayload(data[FORM_NAMES.duration]!),
      },
      ...templatePayload,
    };
  };

  const mutateOffer = async (data: FormTypes, pictureId?: string) => {
    const payload = await getOfferPayload(data, pictureId);

    offerMutation.mutate(
      {payload},
      {
        onSuccess: () => {
          openSuccessModal();
        },
      },
    );
  };

  const onSubmit = async (data: FormTypes) => {
    if (isWaivoTemplate && !hasBusinessInformation) {
      return openWaivoCompanyRegistrationModal();
    }
    const {error, data: offerPicture} = await mutatePicture(data);

    if (!error) {
      const pictureId = offerPicture?.id;
      await mutateOffer(data, pictureId);
    }
  };

  const onError = () => {
    const shouldShowIncompleteModal = !isIncompleteModalOpen && !isIncompleteModalShown;

    if (shouldShowIncompleteModal) {
      openIncompleteModal();
      setIsIncompleteModalShown(true);
    }
  };

  const handleSuccessWaivoCompanyInfo = () => {
    isSubmittedWaivoCompanyInfoRef.current = true;
  };

  const isCameFromHousingPage = Boolean(location.state?.housingURL);

  return (
    <>
      <form onSubmit={formMethods.handleSubmit(onSubmit, onError)}>
        <FormProvider {...formMethods}>
          <OfferInformationSection
            suppliersOptions={suppliersOptions}
            offerTemplate={offerTemplate}
            disabled={isLoading}
            openWaivoCompanyRegistrationModal={openWaivoCompanyRegistrationModal}
            hasBusinessInformation={hasBusinessInformation}
          />
          {offerTemplate.priceSection && <OfferPriceSection disabled={isLoading} />}
          <OfferPictureSection disabled={isLoading}>
            {(pictureSrc) =>
              isOfferPreviewVisible && (
                <OfferPhonePreview
                  backgroundSrc={pictureSrc}
                  offerTemplate={offerTemplate}
                />
              )
            }
          </OfferPictureSection>
          {offerTemplate.availabilitySection && (
            <OfferAvailabilitySection
              initState={initAvailabilityState}
              disabled={isLoading}
            />
          )}
          <OfferSelectHousingsSection
            isLoadingHousingOptions={isLoadingHousingOptions}
            housingOptions={housingOptions}
            disabled={isLoading}
          />
        </FormProvider>
        <SubmitButton
          type="submit"
          disabled={isSubmitDisabled}
          label={t('save_deal')}
          icon={<img src={floppyDisc} alt="" height={20} width={20} />}
        />
        {isDoYouWantToSaveModalOpen && (
          <YouHaveMadeChangesModal
            handleModalSave={() => handleModalSave(formMethods.handleSubmit(onSubmit))}
            handleModalDontSave={handleModalDontSave}
            handleModalCancel={handleModalCancel}
          />
        )}
        <IncompleteFormDataModal
          open={isIncompleteModalOpen}
          text={t('you_cant_add_this_deal_until')}
          onClose={closeIncompleteModal}
        />
        <Modal
          closeOnEscape
          closeOnDocumentClick
          onClose={keepEditing}
          open={isSuccessModalOpen}
          iconProps={{height: 84, width: 84, src: checkIcon, alt: ''}}
          title={t('success_exclamation')}
          text={isEditing ? t('deal_has_been_updated') : t('deal_has_been_created')}
        >
          <ModalTwoButtonsWrapper>
            {isCameFromHousingPage && (
              <ModalButton label={t('back_to_property')} onClick={goBackToHousing} />
            )}
            <ModalButton
              secondary={isCameFromHousingPage}
              label={t('back_to_deals')}
              onClick={goBack}
            />
            <ModalButton secondary label={t('continue_editing')} onClick={keepEditing} />
          </ModalTwoButtonsWrapper>
        </Modal>
      </form>
      <WaivoCompanyRegistrationModal
        open={isWaivoCompanyRegistrationModalOpen}
        onClose={closeWaivoCompanyRegistrationModal}
        onSuccess={handleSuccessWaivoCompanyInfo}
      />
    </>
  );
}

export {OfferDetails};
