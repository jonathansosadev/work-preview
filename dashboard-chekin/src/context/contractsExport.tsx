import React from 'react';
import {toast} from 'react-toastify';
import {useQueryClient} from 'react-query';
import {useTranslation} from 'react-i18next';
import api from '../api';
import {useModalControls, useStatus} from '../utils/hooks';
import {ToastTypes} from '../components/dashboard/ExportingSettingsComponents/ExportingSettingsComponents';
import {
  ConfirmationModal,
  ToastContent,
} from '../components/dashboard/ExportingSettingsComponents';

const successCloseTimeMs = 4000;

type ContextProps = {
  startContractSettingsExport: (housingIds: string[], payload: any) => Promise<void>;
  isExporting: boolean;
};

const ContractsExportContext = React.createContext<ContextProps>({
  startContractSettingsExport: async () => {},
  isExporting: false,
});

function ContractsExportProvider(props: any) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const [exportedNumber, setExportedNumber] = React.useState(0);
  const {isLoading, setStatus} = useStatus();
  const exporting = React.useRef(false);
  const toastIdRef = React.useRef<string | number>('');
  const successCloseTimeRef = React.useRef<any>(null);
  const [lastExportedId, setLastExportedId] = React.useState('');
  const [storedHousingIds, setStoredHousingIds] = React.useState<string[]>([]);
  const [storedPayload, setStoredPayload] = React.useState<any>(null);
  const {
    isOpen: isStoppingModalOpen,
    closeModal: closeStoppingModal,
    openModal: openStoppingModal,
  } = useModalControls();

  React.useEffect(() => {
    return () => {
      clearTimeout(successCloseTimeRef.current);
    };
  }, []);

  const updateHousing = React.useCallback(
    async (id: string, payload: any) => {
      const result = await api.housings.patchById(id, payload);

      if (result.error) {
        setStatus('error');
      }
      if (result.data) {
        await queryClient.refetchQueries('housings');
      }
      return result.error;
    },
    [setStatus, queryClient],
  );

  const stopContractSettingsExporting = React.useCallback(() => {
    exporting.current = false;
    toast.dismiss(toastIdRef.current);
    setStatus('idle');
    setExportedNumber(0);
    setStoredPayload(null);
    setLastExportedId('');
    setStoredHousingIds([]);
    closeStoppingModal();
  }, [closeStoppingModal, setStatus]);

  const pauseTaxesExport = React.useCallback(() => {
    openStoppingModal();
    exporting.current = false;

    toast.update(toastIdRef.current, {
      render: (
        <ToastContent
          hideCloseButton
          onClose={() => {}}
          customText={t('exporting_paused')}
        />
      ),
    });
  }, [openStoppingModal, t]);

  const exportContractSettings = React.useCallback(
    async (housingIds: string[], payload: any, total = 0) => {
      let error: any = null;

      for await (const id of housingIds) {
        if (!exporting.current) {
          break;
        }

        if (error) {
          return;
        }

        error = await updateHousing(id, payload);

        if (!error) {
          setLastExportedId(id);
          setExportedNumber((prevState) => {
            if (exporting.current) {
              toast.update(toastIdRef.current, {
                render: (
                  <ToastContent
                    onClose={pauseTaxesExport}
                    type={ToastTypes.contracts}
                    exported={prevState + 1}
                    total={total}
                  />
                ),
              });
            }
            return prevState + 1;
          });
        }
      }

      if (exporting.current) {
        if (error) {
          setStatus('error');
          toast.update(toastIdRef.current, {
            render: (
              <ToastContent
                onClose={() => toast.dismiss(toastIdRef.current)}
                customText={t('contracts_settings_export_error_try_again')}
              />
            ),
          });
        } else {
          setStatus('success');
          toast.update(toastIdRef.current, {
            render: (
              <ToastContent
                onClose={() => toast.dismiss(toastIdRef.current)}
                customText={t('contracts_settings_successfully_exported')}
              />
            ),
          });
          successCloseTimeRef.current = setTimeout(
            stopContractSettingsExporting,
            successCloseTimeMs,
          );
        }
      }
    },
    [pauseTaxesExport, setStatus, stopContractSettingsExporting, t, updateHousing],
  );

  const continueContractSettings = React.useCallback(async () => {
    const unExportedIds = storedHousingIds.slice(
      storedHousingIds.indexOf(lastExportedId) + 1,
    );

    closeStoppingModal();
    exporting.current = true;
    toast.update(toastIdRef.current, {
      render: (
        <ToastContent
          onClose={pauseTaxesExport}
          exported={exportedNumber}
          type={ToastTypes.contracts}
          total={storedHousingIds.length}
        />
      ),
    });

    exportContractSettings(unExportedIds, storedPayload, storedHousingIds.length);
  }, [
    closeStoppingModal,
    exportContractSettings,
    exportedNumber,
    lastExportedId,
    pauseTaxesExport,
    storedHousingIds,
    storedPayload,
  ]);

  const startContractSettingsExport = React.useCallback(
    async (housingIds: string[], payload: any) => {
      setStoredHousingIds(housingIds);
      setStoredPayload(payload);
      setExportedNumber(0);

      toast.dismiss();
      toastIdRef.current = toast.info(
        <ToastContent
          onClose={pauseTaxesExport}
          type={ToastTypes.contracts}
          exported={0}
          total={housingIds.length}
        />,
        {
          closeOnClick: false,
          toastId: 'export',
          closeButton: <div />,
          draggable: false,
        },
      );

      exporting.current = true;
      setStatus('loading');
      exportContractSettings(housingIds, payload, housingIds.length);
    },
    [exportContractSettings, pauseTaxesExport, setStatus],
  );

  return (
    <div>
      <ConfirmationModal
        open={isStoppingModalOpen}
        onClose={continueContractSettings}
        onSubmit={stopContractSettingsExporting}
      />
      <ContractsExportContext.Provider
        value={{startContractSettingsExport, isExporting: isLoading}}
        {...props}
      />
    </div>
  );
}

function useContractsExport() {
  const context = React.useContext(ContractsExportContext);
  if (context === undefined) {
    throw new Error('useContractsExport must be used within a ContractsExportProvider');
  }
  return context;
}

export {ContractsExportProvider, useContractsExport, ContractsExportContext};
