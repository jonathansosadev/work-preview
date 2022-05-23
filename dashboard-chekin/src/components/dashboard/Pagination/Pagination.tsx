import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  Wrapper,
  PageControlButton,
  PageButton,
  RightDivider,
  LeftDivider,
  LastPageButton,
  PageButtonText,
  PrevPagesButton,
} from './styled';

const DEFAULT_PAGE = 1;

function filterPages(visiblePages: number[] = [], totalPages: number) {
  return visiblePages.filter((page) => page <= totalPages);
}

function getVisiblePages(page = 0, total = 0) {
  if (total < 13) {
    return filterPages([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], total);
  } else {
    if (page % 12 >= 0 && page > 11 && page + 10 < total) {
      return [
        1,
        page - 5,
        page - 4,
        page - 3,
        page - 2,
        page - 1,
        page,
        page + 1,
        page + 2,
        page + 3,
        page + 4,
        page + 5,
        total,
      ];
    } else if (page % 12 >= 0 && page > 10 && page + 12 >= total) {
      return [
        1,
        total - 11,
        total - 10,
        total - 9,
        total - 8,
        total - 7,
        total - 6,
        total - 5,
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    } else {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, total];
    }
  }
}

export type PaginationProps = {
  onPageChange: (page: number) => void;
  pages: number;
  page: number;
};

export const defaultProps: PaginationProps = {
  onPageChange: () => {},
  pages: 1,
  page: 1,
};

function Pagination({onPageChange, pages, page}: PaginationProps) {
  const {t} = useTranslation();
  const [visiblePages, setVisiblePages] = React.useState(
    getVisiblePages(DEFAULT_PAGE, pages),
  );
  const activePage = page + 1;

  React.useEffect(() => {
    function getAndSetVisiblePages() {
      const nextVisiblePages = getVisiblePages(activePage, pages);
      setVisiblePages(nextVisiblePages);
    }
    getAndSetVisiblePages();
  }, [activePage, pages]);

  const changePageAndSetVisiblePages = (nextPage = DEFAULT_PAGE) => {
    const nextActivePage = nextPage + 1;
    if (nextPage === nextActivePage) {
      return;
    }

    setVisiblePages((prevPages) => {
      return filterPages(prevPages, pages);
    });
    onPageChange(nextPage - 1);
  };

  const goToPrevPage = () => {
    changePageAndSetVisiblePages(activePage - 1);
  };

  const goToNextPage = () => {
    changePageAndSetVisiblePages(activePage + 1);
  };

  const getLastPageButton = (page = DEFAULT_PAGE) => {
    return (
      <LastPageButton
        type="button"
        key={page}
        active={activePage === page}
        onClick={() => changePageAndSetVisiblePages(page)}
      >
        <PageButtonText>...</PageButtonText>
        <PageButtonText>{t('of')}</PageButtonText>
        <PageButtonText>{page}</PageButtonText>
      </LastPageButton>
    );
  };

  const getPrevPagesButton = (page = DEFAULT_PAGE) => {
    return (
      <PrevPagesButton
        type="button"
        key={page}
        active={activePage === page}
        onClick={() => changePageAndSetVisiblePages(page)}
      >
        <PageButtonText>...</PageButtonText>
        <PageButtonText>{page}</PageButtonText>
      </PrevPagesButton>
    );
  };

  const getPageButton = (page = DEFAULT_PAGE) => {
    return (
      <PageButton
        type="button"
        key={page}
        active={activePage === page}
        onClick={() => changePageAndSetVisiblePages(page)}
      >
        {page}
      </PageButton>
    );
  };

  const renderPages = (page = DEFAULT_PAGE, index = 0, array: number[] = []) => {
    if (array[index - 1] + 1 < page) {
      if (page === pages) {
        return getLastPageButton(page);
      }
      return getPrevPagesButton(page);
    }
    return getPageButton(page);
  };

  return (
    <Wrapper>
      {Boolean(pages) && (
        <>
          <PageControlButton
            type="button"
            onClick={goToPrevPage}
            disabled={activePage === 1}
          >
            {t('previous')}
          </PageControlButton>
          <RightDivider />
          {visiblePages.map(renderPages)}
          <LeftDivider />
          <PageControlButton
            type="button"
            onClick={goToNextPage}
            disabled={activePage >= pages}
          >
            {t('next')}
          </PageControlButton>
        </>
      )}
    </Wrapper>
  );
}

Pagination.defaultProps = defaultProps;
export {Pagination};
