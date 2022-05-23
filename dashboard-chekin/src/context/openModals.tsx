import React from 'react';
import {useHistory} from 'react-router-dom';

type ContextProps = {
  shouldDoYouWantToSaveModalOpen: boolean;
  isDoYouWantToSaveModalOpen: boolean;
  linkToGo: string;
  updateLinkToGo: (link: string) => void;
  importType: string;
  setImportType: (type: string) => void;
  openDoYouWantToSaveModal: () => void;
  closeDoYouWantToSaveModal: () => void;
  setIsTargetFormTouched: (value: boolean) => void;
  cleanupSavingModalDetails: () => void;
  setLinkToGoState: (state: any) => void;
  linkToGoState: any;
};

const OpenModalsContext = React.createContext<ContextProps>({
  shouldDoYouWantToSaveModalOpen: false,
  isDoYouWantToSaveModalOpen: false,
  linkToGo: '',
  updateLinkToGo: () => {},
  importType: '',
  linkToGoState: undefined,
  setImportType: (type: string) => {},
  openDoYouWantToSaveModal: () => {},
  closeDoYouWantToSaveModal: () => {},
  setIsTargetFormTouched: () => {},
  cleanupSavingModalDetails: () => {},
  setLinkToGoState: () => {},
});

function OpenModalsProvider(props: any) {
  const [
    shouldDoYouWantToSaveModalOpen,
    setShouldDoYouWantToSaveModalOpen,
  ] = React.useState(false);
  const [isDoYouWantToSaveModalOpen, setIsDoYouWantToSaveModalOpen] = React.useState(
    false,
  );
  const [linkToGo, setLinkToGo] = React.useState('');
  const [importType, setImportType] = React.useState('');
  const [linkToGoState, setLinkToGoState] = React.useState<any>(undefined);

  const openDoYouWantToSaveModal = React.useCallback(() => {
    setIsDoYouWantToSaveModalOpen(true);
  }, []);

  const closeDoYouWantToSaveModal = React.useCallback(() => {
    setIsDoYouWantToSaveModalOpen(false);
  }, []);

  const setIsTargetFormTouched = React.useCallback(
    (isTouched: boolean) => {
      if (isTouched) {
        setShouldDoYouWantToSaveModalOpen(true);
      } else {
        setShouldDoYouWantToSaveModalOpen(false);
      }
    },
    [setShouldDoYouWantToSaveModalOpen],
  );

  const updateLinkTogo = React.useCallback((link: string, state?: any) => {
    setLinkToGo(link);

    if (state) {
      setLinkToGoState(state);
    }
  }, []);

  const cleanupSavingModalDetails = React.useCallback(() => {
    setLinkToGo('');
    setLinkToGoState(undefined);
    setShouldDoYouWantToSaveModalOpen(false);
    closeDoYouWantToSaveModal();
  }, [closeDoYouWantToSaveModal]);

  return (
    <OpenModalsContext.Provider
      value={{
        linkToGo,
        updateLinkToGo: updateLinkTogo,
        importType,
        setImportType,
        openDoYouWantToSaveModal,
        closeDoYouWantToSaveModal,
        isDoYouWantToSaveModalOpen,
        shouldDoYouWantToSaveModalOpen,
        setIsTargetFormTouched,
        cleanupSavingModalDetails,
        setLinkToGoState,
        linkToGoState,
      }}
      {...props}
    />
  );
}

function useOpenModals() {
  const context = React.useContext(OpenModalsContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

function useConfirmLeaveModal(isAnySectionTouched?: boolean) {
  const history = useHistory();
  const {
    linkToGo,
    updateLinkToGo,
    openDoYouWantToSaveModal,
    closeDoYouWantToSaveModal,
    isDoYouWantToSaveModalOpen,
    shouldDoYouWantToSaveModalOpen,
    setIsTargetFormTouched,
    cleanupSavingModalDetails,
    linkToGoState,
    setLinkToGoState,
  } = useOpenModals();

  React.useEffect(() => {
    if (isAnySectionTouched !== undefined) {
      setIsTargetFormTouched(isAnySectionTouched);
    }
  }, [isAnySectionTouched, setIsTargetFormTouched]);

  React.useEffect(() => {
    return () => {
      cleanupSavingModalDetails();
    };
  }, [cleanupSavingModalDetails]);

  const goThroughConfirm = (path: string, state?: any) => {
    if (shouldDoYouWantToSaveModalOpen) {
      updateLinkToGo(path);
      setLinkToGoState(state);
      openDoYouWantToSaveModal();
    } else {
      history.push(path, state);
      cleanupSavingModalDetails();
    }
  };

  const handleModalSave = async (handleSubmit: any) => {
    closeDoYouWantToSaveModal();
    await handleSubmit();
  };

  const handleModalDontSave = () => {
    closeDoYouWantToSaveModal();
    history.push(linkToGo);
  };

  const handleModalCancel = () => {
    closeDoYouWantToSaveModal();
    updateLinkToGo('');
  };

  return {
    linkToGo,
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
    linkToGoState,
    cleanupSavingModalDetails,
  };
}

export {OpenModalsProvider, useOpenModals, useConfirmLeaveModal, OpenModalsContext};
