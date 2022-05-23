import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  Wrapper,
  StepsContainer,
  StepButton,
  ActivePageWrapper,
  PagesWrapper,
  Title,
  TitleWrapper,
} from './styled';

const DEFAULT_PAGE = 1;

type StepByStepGuideWizardProps = {
  components: Array<JSX.Element | React.ReactNode>;
  title: string;
};

const defaultProps: StepByStepGuideWizardProps = {
  components: [],
  title: '',
};

function StepByStepGuideWizard({components, title}: StepByStepGuideWizardProps) {
  const {t} = useTranslation();
  const [activePage, setActivePage] = React.useState(DEFAULT_PAGE);
  const pages = components.length;

  const setNextPage = () => {
    setActivePage((prevState) => prevState + 1);
  };

  const setPrevPage = () => {
    setActivePage((prevState) => prevState - 1);
  };

  return (
    <>
      <Wrapper>
        {title && (
          <TitleWrapper>
            <Title>{title}</Title>
          </TitleWrapper>
        )}
        <StepsContainer>
          <StepButton
            secondary
            hideArrowIcon
            visible={activePage !== DEFAULT_PAGE}
            onClick={setPrevPage}
            label={t('previous')}
          />
          <PagesWrapper>
            <ActivePageWrapper>{activePage}</ActivePageWrapper>/{pages}
          </PagesWrapper>
          <StepButton
            visible={activePage !== components.length}
            onClick={setNextPage}
            label={t('next')}
          />
        </StepsContainer>
      </Wrapper>
      {components[activePage - 1]}
    </>
  );
}

StepByStepGuideWizard.defaultProps = defaultProps;
export {StepByStepGuideWizard};
