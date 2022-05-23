import {useTranslation} from 'react-i18next';
import {useForm, Controller} from 'react-hook-form';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {Supplier} from '../../../utils/upselling/types';
import api from '../../../api';
import {PATTERNS} from '../../../utils/constants';
import {getRequiredOrOptionalFieldLabel, toastResponseError} from '../../../utils/common';
import Modal from '../Modal';
import PhoneInput from '../PhoneInput';
import ModalButton from '../ModalButton';
import {InputController} from '../Input';
import {Title, Form, ButtonsWrapper, Grid, contentStyle, SubmitButton} from './styled';

enum formNames {
  name = 'name',
  email = 'email',
  phone = 'phone_number',
  address = 'address',
}

type FormTypes = {
  [formNames.name]: string;
  [formNames.email]: string;
  [formNames.phone]: string;
  [formNames.address]: string;
};

type Payload = Pick<Supplier, 'address' | 'name' | 'email' | 'phone_number'> &
  Partial<Pick<Supplier, 'id'>>;

type SupplierDetailsModalProps = {
  open: boolean;
  onClose: (newSupplier?: Supplier) => void;
  supplierId?: string;
};

function SupplierDetailsModal({open, onClose, supplierId}: SupplierDetailsModalProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {
    register,
    control,
    formState: {errors},
    handleSubmit,
    reset,
  } = useForm<FormTypes>();

  const {isLoading: isLoadingSupplier, data: supplier} = useQuery<
    unknown,
    Error,
    Supplier
  >(api.upselling.ENDPOINTS.oneSupplier(supplierId!), {
    enabled: Boolean(supplierId),
    onError: (error: any) => {
      toastResponseError(error, {
        notFoundMessage: 'Requested supplier cannot be found.',
      });
    },
    onSuccess: (data) => {
      reset(data);
    },
  });
  const cannotEditSupplier = Boolean(supplier && !supplier?.is_editable);

  const suppliersMutation = useMutation<Supplier, any, {payload: Payload}>(
    ({payload}) => api.upselling.supplierMutation(payload),
    {
      onError: (error: any) => {
        toastResponseError(error);
      },
      onSuccess: async (data) => {
        const allSuppliersQuery = api.upselling.ENDPOINTS.suppliers();

        await queryClient.cancelQueries(allSuppliersQuery);
        queryClient.setQueryData(api.upselling.ENDPOINTS.oneSupplier(data.id), data);
        queryClient.setQueryData<Supplier[]>(allSuppliersQuery, (prevData) => {
          if (!prevData) {
            return [];
          }

          return prevData.map((supplier) => {
            if (supplier.id === data.id) {
              return data;
            }

            return supplier;
          });
        });
      },
      onSettled: (data) => {
        if (data?.id) {
          queryClient.invalidateQueries(api.upselling.ENDPOINTS.oneSupplier(data.id));
        }
        queryClient.invalidateQueries(api.upselling.ENDPOINTS.suppliers());
      },
    },
  );

  const onSubmit = (data: FormTypes) => {
    suppliersMutation
      .mutateAsync({payload: {...data, id: supplierId || undefined}})
      .then((newSupplier: Supplier) => {
        onClose(newSupplier);
      });
  };

  const isLoading = suppliersMutation.isLoading || isLoadingSupplier;

  return (
    <Modal
      closeOnDocumentClick={!isLoading}
      closeOnEscape={!isLoading}
      open={open}
      onClose={() => onClose()}
      contentStyle={contentStyle}
    >
      <Title>{t('change_supplier')}</Title>
      {/* if onSubmit - propagates to parent submit and reloads page */}
      <Form>
        <Grid>
          <InputController
            autoFocus
            {...register(formNames.name, {
              required: t('required') as string,
            })}
            control={control}
            label={t('name')}
            placeholder={t('enter_name')}
            error={errors[formNames.name]?.message}
            readOnly={cannotEditSupplier}
            disabled={isLoading}
          />
          <InputController
            {...register(formNames.email, {
              required: t('required') as string,
              pattern: {
                value: PATTERNS.email,
                message: t('invalid_email') as string,
              },
            })}
            control={control}
            type="email"
            label={t('email')}
            placeholder={t('enter_email')}
            error={errors[formNames.email]?.message}
            readOnly={cannotEditSupplier}
            disabled={isLoading}
          />
          <div>
            <Controller
              control={control}
              render={({field: {ref, ...restField}, fieldState: {error}}) => {
                return (
                  <PhoneInput
                    label={t('phone')}
                    defaultCode={supplier?.phone_number_details?.code}
                    defaultInputValue={supplier?.phone_number_details?.number}
                    error={error?.message}
                    readOnly={cannotEditSupplier}
                    disabled={isLoading}
                    {...restField}
                  />
                );
              }}
              name={formNames.phone}
              rules={{required: t('required') as string}}
            />
          </div>
          <InputController
            {...register(formNames.address)}
            control={control}
            label={getRequiredOrOptionalFieldLabel(t('address'), false)}
            placeholder={t('enter_address')}
            error={errors[formNames.address]?.message}
            readOnly={cannotEditSupplier}
            disabled={isLoading}
          />
        </Grid>
        <ButtonsWrapper>
          <SubmitButton
            label={supplierId ? t('change_supplier') : t('add_supplier')}
            disabled={isLoading || cannotEditSupplier}
            onClick={handleSubmit(onSubmit)}
          />
          <ModalButton
            secondary
            label={t('cancel')}
            onClick={() => onClose()}
            disabled={isLoading}
          />
        </ButtonsWrapper>
      </Form>
    </Modal>
  );
}

export {SupplierDetailsModal};
