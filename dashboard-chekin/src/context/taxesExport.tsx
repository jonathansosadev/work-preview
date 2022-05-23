import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQueryClient} from 'react-query';
import {toast} from 'react-toastify';
import api from '../api';
import {QUERY_CACHE_KEYS} from '../utils/constants';
import {useModalControls, useStatus} from '../utils/hooks';
import {
  ToastContent,
  ConfirmationModal,
} from '../components/dashboard/ExportingSettingsComponents';

const successCloseTimeMs = 4000;

type TaxesPayload = {
  highSeason: any;
  lowSeason: any;
  housing: any;
};

type ContextProps = {
  startTaxesExport: (housingIds: string[], payload: TaxesPayload) => Promise<void>;
  isExporting: boolean;
};

const TaxesExportContext = React.createContext<ContextProps>({
  startTaxesExport: async () => {},
  isExporting: false,
});

function TaxesExportProvider(props: any) {
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

  const handleExportingError = React.useCallback(() => {
    setStatus('error');
    exporting.current = false;
  }, [setStatus]);

  const getHousingSeasons = React.useCallback(
    async (housingId: string) => {
      const result = await api.seasons.get(`housing_id=${housingId}`);

      if (result.error) {
        handleExportingError();
        return null;
      }

      return result.data;
    },
    [handleExportingError],
  );

  const createHighSeason = React.useCallback(
    async (housingId: string, payload: any) => {
      if (!payload) {
        return {
          error: null,
          data: null,
        };
      }

      const result = await api.seasons.post({...payload, housing_id: housingId});
      if (result.data?.id) {
        queryClient.setQueryData(
          [QUERY_CACHE_KEYS.highSeason, result.data?.id],
          result.data,
        );
      }
      return result;
    },
    [queryClient],
  );

  const createLowSeason = React.useCallback(
    async (housingId: string, payload: any) => {
      if (!payload) {
        return {
          error: null,
          data: null,
        };
      }

      const result = await api.seasons.post({...payload, housing_id: housingId});
      if (result.data?.id) {
        queryClient.setQueryData(['lowSeason', result.data.id], result.data);
      }
      return result;
    },
    [queryClient],
  );

  const createSeasons = React.useCallback(
    async (housingId: string, payload: TaxesPayload) => {
      const highSeasonResult = await createHighSeason(housingId, payload.highSeason);
      if (highSeasonResult.error) {
        handleExportingError();
        return highSeasonResult.error;
      }

      const lowSeasonResult = await createLowSeason(housingId, payload.lowSeason);
      if (lowSeasonResult.error) {
        handleExportingError();
        return lowSeasonResult.error;
      }

      queryClient.setQueryData([`housing`, housingId], (prevData?: any) => {
        if (!prevData) {
          return prevData;
        }

        const seasons = [];
        const highSeasonId = highSeasonResult?.data?.id;
        const lowSeasonId = lowSeasonResult?.data?.id;

        if (highSeasonId) {
          seasons.push(highSeasonId);
        }
        if (lowSeasonId) {
          seasons.push(lowSeasonId);
        }

        return {
          ...prevData,
          seasons,
        };
      });

      if (!highSeasonResult.error && !lowSeasonResult.error) {
        await queryClient.refetchQueries('housings');
      }

      return null;
    },
    [createHighSeason, createLowSeason, handleExportingError, queryClient],
  );

  const deleteSeasons = React.useCallback(async (ids: string[]) => {
    let error: any = null;

    for await (const id of ids) {
      const result = await api.seasons.deleteOne(id);

      if (result.error) {
        error = result.error;
        break;
      }
    }
    return error;
  }, []);

  const createOrUpdateSeasons = React.useCallback(
    async (housingId: string, payload: TaxesPayload) => {
      const seasons = await getHousingSeasons(housingId);
      const lowSeasonId = seasons?.[0]?.id;
      const highSeasonId = seasons?.[1]?.id;
      const seasonsIds = [];

      if (highSeasonId) {
        seasonsIds.push(highSeasonId);
      }
      if (lowSeasonId) {
        seasonsIds.push(lowSeasonId);
      }

      const deletingResult = await deleteSeasons(seasonsIds);
      if (deletingResult?.error) {
        return;
      }
      await createSeasons(housingId, payload);
    },
    [createSeasons, deleteSeasons, getHousingSeasons],
  );

  const updateHousing = React.useCallback(
    async (housingId: string, {housing: housingPayload}: TaxesPayload) => {
      const {error} = await api.housings.patchById(housingId, housingPayload);
      return error;
    },
    [],
  );

  const stopTaxesExporting = React.useCallback(() => {
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

  const exportTaxes = React.useCallback(
    async (housingIds: string[], payload: TaxesPayload, total = 0) => {
      let error: any = null;

      for await (const id of housingIds) {
        if (!exporting.current) {
          break;
        }

        if (error) {
          return;
        }

        error = await createOrUpdateSeasons(id, payload);
        error = await updateHousing(id, payload);

        if (!error) {
          setLastExportedId(id);
          setExportedNumber((prevState) => {
            if (exporting.current) {
              toast.update(toastIdRef.current, {
                render: (
                  <ToastContent
                    onClose={pauseTaxesExport}
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
                customText={t('taxes_export_error_try_again')}
              />
            ),
          });
        } else {
          setStatus('success');
          toast.update(toastIdRef.current, {
            render: (
              <ToastContent
                onClose={() => toast.dismiss(toastIdRef.current)}
                customText={t('taxes_successfully_exported')}
              />
            ),
          });
          successCloseTimeRef.current = setTimeout(
            stopTaxesExporting,
            successCloseTimeMs,
          );
        }
      }
    },
    [
      createOrUpdateSeasons,
      pauseTaxesExport,
      setStatus,
      stopTaxesExporting,
      t,
      updateHousing,
    ],
  );

  const continueTaxesExport = React.useCallback(async () => {
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
          total={storedHousingIds.length}
        />
      ),
    });

    exportTaxes(unExportedIds, storedPayload, storedHousingIds.length);
  }, [
    closeStoppingModal,
    exportTaxes,
    exportedNumber,
    storedHousingIds,
    lastExportedId,
    pauseTaxesExport,
    storedPayload,
  ]);

  const startTaxesExport = React.useCallback(
    async (housingIds: string[], payload: TaxesPayload) => {
      setStoredHousingIds(housingIds);
      setStoredPayload(payload);
      setExportedNumber(0);

      toast.dismiss();
      toastIdRef.current = toast.info(
        <ToastContent
          onClose={pauseTaxesExport}
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
      exportTaxes(housingIds, payload, housingIds.length);
    },
    [exportTaxes, pauseTaxesExport, setStatus],
  );

  return (
    <div>
      <ConfirmationModal
        open={isStoppingModalOpen}
        onClose={continueTaxesExport}
        onSubmit={stopTaxesExporting}
      />
      <TaxesExportContext.Provider
        value={{startTaxesExport, isExporting: isLoading}}
        {...props}
      />
    </div>
  );
}

function useTaxesExport() {
  const context = React.useContext(TaxesExportContext);
  if (context === undefined) {
    throw new Error('useTaxesExport must be used within a TaxesExportProvider');
  }
  return context;
}

export {TaxesExportProvider, useTaxesExport, TaxesExportContext};
