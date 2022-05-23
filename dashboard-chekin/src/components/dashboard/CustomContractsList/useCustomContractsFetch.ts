import {useMutation, useQuery, useQueryClient} from 'react-query';
import api from '../../../api';
import {CUSTOM_DOCUMENTS_TYPES} from '../../../utils/constants';
import {useErrorModal, useIsMounted} from '../../../utils/hooks';
import {CustomDocument} from '../../../utils/types';

function useCustomContractsFetch(housingId?: string) {
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const {displayError} = useErrorModal();
  const housingIdParam = housingId ? `&housing_id=${housingId}` : '';

  const customContractsQueryKey = api.documents.ENDPOINTS.customDocuments(
    undefined,
    `type=${CUSTOM_DOCUMENTS_TYPES.contract}${housingIdParam}`,
  );

  const {
    data: customContracts,
    refetch: refetchCustomContracts,
    isLoading: isLoadingCustomContracts,
  } = useQuery<CustomDocument[], string>(customContractsQueryKey);

  const {
    isLoading: isLoadingDeleteCustomDocument,
    mutate: deleteCustomDocument,
  } = useMutation<undefined, Error, string, {prevCustomContracts: CustomDocument[]}>(
    (id) => api.documents.deleteCustomDocument(id),
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(customContractsQueryKey);
        const prevCustomContracts = queryClient.getQueryData<CustomDocument[]>(
          customContractsQueryKey,
        );
        const optimisticCustomContracts = prevCustomContracts?.filter((contract) => {
          return contract.id !== id;
        });

        queryClient.setQueryData(customContractsQueryKey, optimisticCustomContracts);

        return {prevCustomContracts: prevCustomContracts || []};
      },
      onError: (error, payload, context) => {
        if (!isMounted.current) {
          return;
        }

        queryClient.setQueryData(customContractsQueryKey, context?.prevCustomContracts);
        displayError(error);
      },
      onSuccess: (_, id) => {
        queryClient.removeQueries(api.documents.ENDPOINTS.customDocuments(id));
      },
      onSettled: (_, __, payload, context) => {
        queryClient.invalidateQueries(customContractsQueryKey);
      },
    },
  );

  const {isLoading: isLoadingUpdateContract, mutate: updateCustomContract} = useMutation<
    CustomDocument,
    Error,
    Partial<Omit<CustomDocument, 'id'>> & Pick<CustomDocument, 'id'>,
    {prevCustomContracts: CustomDocument[]}
  >((payload) => api.documents.updateCustomDocument(payload), {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(customContractsQueryKey);

      const prevCustomContracts = queryClient.getQueryData<CustomDocument[]>(
        customContractsQueryKey,
      );
      const optimisticCustomContracts = prevCustomContracts
        ? [...prevCustomContracts]
        : [];
      const updatedCustomContractIndex = optimisticCustomContracts?.findIndex(
        (contract) => {
          return contract.id === payload.id;
        },
      );

      if (
        updatedCustomContractIndex !== undefined &&
        updatedCustomContractIndex !== -1 &&
        optimisticCustomContracts?.length
      ) {
        const optimisticCustomContract = {
          ...optimisticCustomContracts[updatedCustomContractIndex],
          ...payload,
        };
        optimisticCustomContracts?.splice(
          updatedCustomContractIndex,
          1,
          optimisticCustomContract,
        );
      }

      queryClient.setQueryData(customContractsQueryKey, optimisticCustomContracts);
      return {prevCustomContracts: prevCustomContracts || []};
    },
    onError: (error, payload, context) => {
      if (!isMounted.current) {
        return;
      }

      if (context?.prevCustomContracts) {
        queryClient.setQueryData(customContractsQueryKey, context?.prevCustomContracts);
      }
      displayError(error);
    },
    onSuccess: (customContract) => {
      queryClient.setQueryData<CustomDocument>(
        api.documents.ENDPOINTS.customDocuments(customContract.id),
        customContract,
      );
    },
    onSettled: (_, __, payload, context) => {
      queryClient.invalidateQueries(customContractsQueryKey);
    },
  });

  const isAnyLoading =
    isLoadingCustomContracts || isLoadingDeleteCustomDocument || isLoadingUpdateContract;

  return {
    customContracts,
    updateCustomContract,
    deleteCustomDocument,
    refetchCustomContracts,
    isAnyLoading,
    isLoadingCustomContracts,
    isLoadingDeleteCustomDocument,
    isLoadingUpdateContract,
  };
}

export default useCustomContractsFetch;
