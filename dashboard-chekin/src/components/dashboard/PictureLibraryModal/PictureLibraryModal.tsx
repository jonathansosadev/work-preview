import React from 'react';
import debounce from 'lodash.debounce';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {toastResponseError} from '../../../utils/common';
import xIcon from 'assets/x_blue.svg';
import displayIcon from 'assets/display-icn.svg';
import Modal from '../Modal';
import TabLinks from '../TabLinks';
import api from 'api';
import {TabLink} from '../TabLinks/TabLinks';
import Loader from 'components/common/Loader';
import {
  Grid,
  PicturesGrid,
  contentStyle,
  CloseButton,
  CloseButtonWrapper,
  TabLinksContainer,
  Image,
  ImageWrapper,
  Content,
  LoaderWrapper,
  ArrowLeftButton,
  ArrowRightButton,
} from './styled';

export enum OFFER_IMAGE_FILTERS {
  all = '',
  early_checkin_late_checkout = 'EARLY_CHECK_IN_LATE_CHECK_OUT',
  foodAndBeverages = 'FOOD_AND_BEVERAGE',
  transportation = 'TRANSPORTATION',
  services = 'SERVICES',
  activities = 'ACTIVITIES',
  art_and_culture = 'ART_AND_CULTURE',
  health_and_spa = 'HEALTH_AND_SPA',
  romantic = 'ROMANTIC',
  family = 'FAMILY',
  seasonal = 'SEASONAL',
  tours = 'TOURS',
  specials = 'SPECIALS',
  custom = 'CUSTOM',
}

const hiddenFilters = [OFFER_IMAGE_FILTERS.custom];
const tabLinksScrollDebounceTimeout = 100;

export type OfferPicture = {
  name: string;
  category: OFFER_IMAGE_FILTERS;
  image: string;
  id: string;
  user_id: string | null;
};

type PictureProps = {
  onClick: (picture: OfferPicture) => void;
  picture: OfferPicture;
};

function Picture({picture, onClick}: PictureProps) {
  const ref = React.useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const onLoad = () => {
    setIsLoaded(true);
  };

  React.useEffect(() => {
    if (ref.current?.complete && !isLoaded) {
      onLoad();
    }
  });

  return (
    <ImageWrapper disabled={!isLoaded} onClick={() => onClick(picture)}>
      <Image
        $loaded={isLoaded}
        ref={ref}
        alt={picture.name}
        src={picture.image}
        onLoad={onLoad}
        loading="lazy"
      />
    </ImageWrapper>
  );
}

type PictureLibraryModalProps = {
  open: boolean;
  onPictureClick: (picture: OfferPicture) => void;
  onClose: () => void;
};

function PictureLibraryModal({open, onClose, onPictureClick}: PictureLibraryModalProps) {
  const {t} = useTranslation();
  const [activeFilter, setActiveFilter] = React.useState<OFFER_IMAGE_FILTERS>(
    OFFER_IMAGE_FILTERS.all,
  );
  const [
    isScrollTabLinksToRightVisible,
    setIsScrollTabLinksToRightVisible,
  ] = React.useState(true);
  const [
    isScrollTabLinksToLeftVisible,
    setIsScrollTabLinksToLeftVisible,
  ] = React.useState(false);
  const tabLinksContainerRef = React.useRef<HTMLDivElement>(null);

  const {data: pictures = [], isLoading: isLoadingPictures} = useQuery<OfferPicture[]>(
    api.upselling.ENDPOINTS.offerImages(`category=${activeFilter}`),
    {
      onError: (error: any) => {
        toastResponseError(error);
      },
    },
  );

  const tabFilters: TabLink<OFFER_IMAGE_FILTERS>[] = React.useMemo(() => {
    return Object.entries(OFFER_IMAGE_FILTERS)
      .filter(([_, filter]) => {
        return !hiddenFilters.includes(filter);
      })
      .map(([key, filter]) => {
        let filterName;

        if (filter === OFFER_IMAGE_FILTERS.foodAndBeverages) {
          filterName = 'F&B';
        } else {
          filterName = t(key);
        }

        return {
          to: filter as OFFER_IMAGE_FILTERS,
          name: filterName,
        };
      });
  }, [t]);

  const handleTabLinksScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const element = (event?.currentTarget || event?.target) as HTMLDivElement;

      if (!element) {
        return;
      }

      const isScrollToRightVisible =
        element.scrollWidth - element.clientWidth > element.scrollLeft;
      const isScrollToLeftVisible = element.scrollLeft > 0;

      setIsScrollTabLinksToRightVisible(isScrollToRightVisible);
      setIsScrollTabLinksToLeftVisible(isScrollToLeftVisible);
    },
    [],
  );

  const scrollTabLinksToRight = () => {
    const maxScroll =
      (tabLinksContainerRef.current?.scrollWidth || 0) -
      (tabLinksContainerRef.current?.clientWidth || 0);

    if (tabLinksContainerRef.current?.scrollLeft !== undefined) {
      tabLinksContainerRef.current.scrollLeft = maxScroll;
      setIsScrollTabLinksToRightVisible(false);
    }
  };

  const scrollTabLinksToLeft = () => {
    if (tabLinksContainerRef.current?.scrollLeft !== undefined) {
      tabLinksContainerRef.current.scrollLeft = 0;
      setIsScrollTabLinksToLeftVisible(false);
    }
  };

  return (
    <Modal
      zIndex={302}
      closeOnDocumentClick
      closeOnEscape
      open={open}
      onClose={onClose}
      contentStyle={contentStyle}
    >
      <CloseButtonWrapper>
        <CloseButton type="button" onClick={onClose}>
          <img src={xIcon} alt="Close modal" />
        </CloseButton>
      </CloseButtonWrapper>
      <Grid>
        <TabLinksContainer
          ref={tabLinksContainerRef}
          onScroll={debounce(handleTabLinksScroll, tabLinksScrollDebounceTimeout)}
        >
          <TabLinks<OFFER_IMAGE_FILTERS>
            links={tabFilters}
            asButtons={{
              onChange: (next) => {
                setActiveFilter(next);
              },
              active: activeFilter,
            }}
          />
        </TabLinksContainer>
        {isScrollTabLinksToLeftVisible && (
          <ArrowLeftButton type="button" onClick={scrollTabLinksToLeft}>
            <img src={displayIcon} alt="Scroll to left" />
          </ArrowLeftButton>
        )}
        {isScrollTabLinksToRightVisible && (
          <ArrowRightButton type="button" onClick={scrollTabLinksToRight}>
            <img src={displayIcon} alt="Scroll to right" />
          </ArrowRightButton>
        )}
        <Content>
          {isLoadingPictures ? (
            <LoaderWrapper>
              <Loader label={t('loading')} />
            </LoaderWrapper>
          ) : (
            <PicturesGrid>
              {pictures?.map((picture) => {
                return (
                  <Picture key={picture.id} picture={picture} onClick={onPictureClick} />
                );
              })}
            </PicturesGrid>
          )}
        </Content>
      </Grid>
    </Modal>
  );
}

export {PictureLibraryModal};
