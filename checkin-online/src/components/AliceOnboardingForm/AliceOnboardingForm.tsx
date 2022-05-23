import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import {
  Authenticator,
  DocumentCapturerType,
  DocumentStageConfig,
  Onboarding,
  OnboardingConfig,
  SelfieCapturerType,
  SelfieStageConfig,
} from 'aliceonboarding';
import 'aliceonboarding/dist/aliceonboarding.css';
import {subYears} from 'date-fns';
import api, {getTokenFromLocalStorage} from '../../api';
import {FORM_NAMES} from '../AddPersonalDataForm/AddPersonalDataForm';
import {useAuth} from '../../context/auth';
import {parseJwt} from '../../utils/common';
import {useErrorModal, useIsMounted, useStatus} from '../../utils/hooks';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {GENDERS_OPTIONS} from '../../utils/constants';
import {getIsAliceBiomatchPassed} from '../../utils/guests';
import scanningErrorIcon from '../../assets/scanning_doc_error.svg';
import likeIcon from '../../assets/like.svg';
import scanningIcon from '../../assets/scanning_doc_icn.svg';
import Modal from '../Modal';
import {DimensionsWrapper} from '../../styled/common';
import {Content, ModalSkipButton, ModalTryAgainButton} from './styled';

const ALICE_MOUNT_ID = 'alice-onboarding-mount';
const MANUAL_CAPTURE_TIMEOUT_MS = 5000;
const MAX_INCORRECT_ATTEMPTS_NUMBER = 3;

export type AliceReport = {
  documents: Partial<{
    fields: null | {
      birth_date: string;
      country: {
        name: string;
        code: string;
      };
      document_type: string;
      expiration_date: string;
      first_name: string;
      last_name: string;
      nationality: {
        name: string;
        code: string;
      };
      passport_number: string;
      sex: string;
      document_number: string;
      issuing_country: {
        name: string;
        code: string;
      };
      address: string;
      id_number: string;
      license_number: string;
    };
    face_validation: number;
    front: string;
    back: string;
  }>[];
  selfie: {
    liveness: number;
    selfie: string;
  };
};

export type AliceTokens = {
  backend_with_user_token: string;
  user_token: string;
  user_id: string;
};

const INIT_ALICE_TOKENS: AliceTokens = {
  backend_with_user_token: '',
  user_token: '',
  user_id: '',
};

class CustomAuthenticator extends Authenticator {
  execute() {
    const userToken = getTokenFromLocalStorage();

    if (userToken) {
      const userEmail = parseJwt(userToken).username;
      return api.alice.authenticate(userEmail);
    }
    return api.alice.authenticate('auth_failed@chekin.io');
  }
}

function authenticate() {
  const auth = new CustomAuthenticator();
  return auth.execute();
}

type LocationState = {
  aliceTokens?: AliceTokens;
  formData?: any;
  isBiomatchValidationFinished?: boolean;
};

type AliceOnboardingFormProps = {
  onGoBack: (state?: any) => void;
  onTokensChange: (tokens?: AliceTokens) => void;
};

function AliceOnboardingForm({onGoBack, onTokensChange}: AliceOnboardingFormProps) {
  const {t, i18n} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const nationality = location.state?.formData?.[FORM_NAMES.nationality];
  const docType = location.state?.formData?.[FORM_NAMES.docType];
  const {setStatus, isLoading} = useStatus();
  const {isDocScanDisabled, hasGuestMembers} = useComputedReservationDetails();
  const {ErrorModal, displayError, closeErrorModal} = useErrorModal();
  const {isTokenValid: isAuthSuccess} = useAuth();
  const [aliceReport, setAliceReport] = React.useState<AliceReport>();
  const [incorrectAttemptsNumber, setIncorrectAttemptsNumber] = React.useState(0);

  const onboardingRef = React.useRef<Onboarding | null>(null);
  const aliceTokensRef = React.useRef<AliceTokens>(
    location.state?.aliceTokens || INIT_ALICE_TOKENS,
  );

  const isSkipOnboardingButtonVisible =
    incorrectAttemptsNumber >= MAX_INCORRECT_ATTEMPTS_NUMBER ||
    Boolean(location.state?.isBiomatchValidationFinished);

  React.useLayoutEffect(() => {
    const hasNationality = location.state?.formData?.[FORM_NAMES.nationality];
    const hasDocType = location.state?.formData?.[FORM_NAMES.docType];

    if (!hasNationality || !hasDocType) {
      history.push('/onboarding/setup', location.state);
    }
  }, [history, location.state]);

  const handleError = React.useCallback(
    (error: any) => {
      displayError(error);
      setStatus('idle');
    },
    [displayError, setStatus],
  );

  const fetchReport = React.useCallback(async () => {
    const userId = aliceTokensRef.current?.user_id;
    const {error, data} = await api.alice.getReport(userId);

    if (!isMounted.current) {
      return null;
    }

    if (error) {
      handleError(error);
      return null;
    }

    return data;
  }, [handleError, isMounted]);

  const getReportWithActualDocument = React.useCallback((report: AliceReport) => {
    const latestDocument = report?.documents?.[report.documents?.length - 1 || 0];

    return {
      ...report,
      biomatch: {},
      documents: undefined,
      document: latestDocument,
    };
  }, []);

  const getPersistedReportState = React.useCallback(
    (report: AliceReport) => {
      const formData = location.state?.formData || {};
      const reportWithActualDocument = getReportWithActualDocument(report);
      const document = reportWithActualDocument?.document;
      const documentFields = document?.fields;

      const firstName = documentFields?.first_name;
      const lastName = documentFields?.last_name;
      const sex = GENDERS_OPTIONS().find(g => g.value === documentFields?.sex);
      const birthDate = documentFields?.birth_date
        ? new Date(documentFields.birth_date)
        : undefined;
      const docDateOfIssue = documentFields?.expiration_date
        ? subYears(new Date(documentFields.expiration_date), 10)
        : undefined;
      const docNumber =
        documentFields?.passport_number ||
        documentFields?.id_number ||
        documentFields?.license_number ||
        documentFields?.document_number;
      const address = documentFields?.address;
      const nationality = documentFields?.nationality && {
        value: documentFields?.nationality.code,
        label: documentFields?.nationality.name,
      };

      return {
        ...location.state,
        ...reportWithActualDocument,
        document,
        formData: {
          ...location.state?.formData,
          [FORM_NAMES.sex]: sex || formData[FORM_NAMES.sex],
          [FORM_NAMES.birthDate]: birthDate || formData[FORM_NAMES.birthDate],
          [FORM_NAMES.docDateOfIssue]:
            docDateOfIssue || formData[FORM_NAMES.docDateOfIssue],
          [FORM_NAMES.name]: firstName || formData[FORM_NAMES.name],
          [FORM_NAMES.surname]: lastName || formData[FORM_NAMES.surname],
          [FORM_NAMES.docNumber]: docNumber || formData[FORM_NAMES.docNumber],
          [FORM_NAMES.residenceAddress]: address || formData[FORM_NAMES.residenceAddress],
          [FORM_NAMES.nationality]: nationality || formData[FORM_NAMES.nationality],
        },
        aliceReport: report,
        aliceTokens: aliceTokensRef.current,
        isBiomatchValidationFinished: true,
      };
    },
    [getReportWithActualDocument, location.state],
  );

  const goNext = React.useCallback(() => {
    const state = getPersistedReportState(aliceReport!);
    let path = '/';

    if (hasGuestMembers) {
      if (isDocScanDisabled) {
        path = '/form/add';
      }
    } else {
      if (isDocScanDisabled) {
        path = '/form/add';
      } else {
        path = '/form/type';
      }
    }

    history.push(path, state);
  }, [aliceReport, getPersistedReportState, hasGuestMembers, history, isDocScanDisabled]);

  const configureOnboarding = React.useCallback(() => {
    if (!docType || !nationality) {
      return null;
    }

    const locale = i18n.language;

    return new OnboardingConfig()
      .withCustomParameters(0)
      .withAddSelfieStage(new SelfieStageConfig(SelfieCapturerType.CAMERA, true))
      .withAddDocumentStage(
        docType?.aliceDocument,
        nationality?.alpha_3,
        new DocumentStageConfig(
          DocumentCapturerType.ALL,
          true,
          undefined,
          MANUAL_CAPTURE_TIMEOUT_MS,
        ),
      )
      .withTheme('corporate', undefined, 'square')
      .withCustomLocalization(locale);
  }, [docType, i18n.language, nationality]);

  const fetchAliceTokens = React.useCallback(() => {
    return authenticate().catch((error: any) => {
      Sentry.captureException(error);
    });
  }, []);

  const runOnboarding = React.useCallback(
    (config: OnboardingConfig) => {
      const onboarding = new Onboarding(ALICE_MOUNT_ID, config);
      onboardingRef.current = onboarding;

      onboarding.run(
        async () => {
          setStatus('loading');

          const report = await fetchReport();
          if (report && isMounted.current) {
            setAliceReport(report);
          }
        },
        (error: any) => {
          handleError(error);
          Sentry.captureException(error);
        },
        () => {
          onGoBack();
        },
      );
    },
    [fetchReport, handleError, isMounted, onGoBack, setStatus],
  );

  const configureAndRunOnboarding = React.useCallback(() => {
    const config = configureOnboarding();
    const userToken = aliceTokensRef.current?.user_token;

    if (!config || !isAuthSuccess || onboardingRef.current) {
      return;
    }

    if (!userToken) {
      fetchAliceTokens().then(tokens => {
        if (tokens) {
          const userToken = tokens?.data?.user_token;

          onTokensChange(tokens?.data);
          aliceTokensRef.current = tokens?.data;
          config.withUserToken(userToken);

          runOnboarding(config);
        }
      });
    } else {
      config.withUserToken(userToken);
      runOnboarding(config);
    }
  }, [
    configureOnboarding,
    isAuthSuccess,
    fetchAliceTokens,
    onTokensChange,
    runOnboarding,
  ]);

  React.useEffect(() => {
    configureAndRunOnboarding();
  }, [configureAndRunOnboarding]);

  React.useEffect(
    function handleLanguageChange() {
      if (!onboardingRef.current) {
        return;
      }

      onboardingRef.current?.unmount();
      onboardingRef.current = null;

      configureAndRunOnboarding();
    },
    [configureAndRunOnboarding, i18n.language],
  );

  const restartOnboarding = React.useCallback(() => {
    onboardingRef.current?.unmount();
    onboardingRef.current = null;

    aliceTokensRef.current = INIT_ALICE_TOKENS;

    configureAndRunOnboarding();
  }, [configureAndRunOnboarding]);

  const getIsBiomatchPassed = React.useCallback(() => {
    if (!aliceReport) {
      return false;
    }

    const reportWithActualDocument = getReportWithActualDocument(aliceReport);
    const isAnyFieldRecognized = reportWithActualDocument?.document?.fields !== null;
    const documentValidationScore = reportWithActualDocument?.document?.face_validation;
    const selfieValidationScore = reportWithActualDocument?.selfie?.liveness;

    return (
      isAnyFieldRecognized &&
      getIsAliceBiomatchPassed(selfieValidationScore, documentValidationScore)
    );
  }, [aliceReport, getReportWithActualDocument]);

  const validateBiomatch = React.useCallback(() => {
    const isBiomatchPassed = getIsBiomatchPassed();

    if (!isBiomatchPassed) {
      setIncorrectAttemptsNumber(prevState => {
        return prevState + 1;
      });
      setStatus('idle');
      displayError(t('identification_error'));
    } else {
      goNext();
    }
  }, [getIsBiomatchPassed, setStatus, displayError, t, goNext]);

  React.useEffect(() => {
    if (!aliceReport) {
      return;
    }

    validateBiomatch();
  }, [aliceReport, validateBiomatch]);

  const restartOnboardingAndCloseErrorModal = () => {
    restartOnboarding();
    closeErrorModal();
  };

  return (
    <div>
      <DimensionsWrapper>
        <Content id="alice-root">
          <div id={ALICE_MOUNT_ID} />
        </Content>
      </DimensionsWrapper>
      <Modal
        open={isLoading}
        title={t('scanning')}
        text={t('it_could_take_seconds')}
        iconSrc={scanningIcon}
        iconAlt=""
      />
      <ErrorModal iconSrc={scanningErrorIcon}>
        <ModalTryAgainButton
          hasSibling={isSkipOnboardingButtonVisible}
          label={t('try_again')}
          icon={<img src={likeIcon} alt="Like" />}
          onClick={restartOnboardingAndCloseErrorModal}
        />
        {isSkipOnboardingButtonVisible && (
          <ModalSkipButton onClick={goNext}>{t('skip')}</ModalSkipButton>
        )}
      </ErrorModal>
    </div>
  );
}

export {AliceOnboardingForm};
