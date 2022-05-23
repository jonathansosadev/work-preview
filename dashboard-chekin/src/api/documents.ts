import {queryFetcher, resolver} from './index';
import {ReportFieldsAndDate} from '../utils/types';

const ENDPOINTS = {
  allContracts: (params = '') => `documents/contracts/?${params}`,
  availableContractsYears: (id = '') => `documents/contracts/available-years/${id}/`,
  contract: (id = '') => `documents/contracts/${id}/`,
  archiveGenerationTask: (params = '') =>
    `documents/contract-archive-generation-task/?${params}`,
  entryForm: (id = '') => `documents/entry-forms/${id}/`,
  entryForms: (params = '') => `documents/entry-forms/?${params}`,
  allContractsDownload: (housingId: string, year: string) =>
    `documents/contracts/download-all/${housingId}/${year}/`,
  guestbookSettings: (housingId: string) => `documents/guest-book-settings/${housingId}/`,
  allGuestbooks: (params = '') => `documents/guest-books/?${params}`,
  guestReportFields: () => 'documents/guest-report-fields',
  guestReports: (id = '', params = '') =>
    `documents/guest-reports/${id ? `${id}/?${params}` : `?${params}`}`,
  guestReportsTask: (params = '') =>
    `documents/guest-reports-excel-generation-task/?${params}`,
  guestReportsExcel: (reportId: string, housingId: string, params = '') =>
    `documents/guest-reports/${reportId}/download-excel/${
      housingId ? `${housingId}/?${params}` : `all/?${params}`
    }`,
  entryFormsGenerationTask: (params = '') =>
    `documents/entry-forms-archive-generation-task/?${params}`,
  allEntryFormsDownload: (reservationId: string) =>
    `documents/entry-forms/download-all/${reservationId}`,
  guestbookGenerationTask: (params = '') =>
    `documents/guest-book-generation-task/?${params}`,
  reservationReportFields: () => 'documents/reservation-report-fields',
  reservationReports: (id?: string) =>
    `documents/reservation-reports/${id ? `${id}/` : ''}`,
  reservationReportTasks: () => 'documents/reservation-report-tasks/',
  reservationReportsExcel: (housingId: string) =>
    `documents/reservation-reports/download-excel/${housingId}/`,
  paymentsReports: () => 'documents/payments-reports/',
  downloadExcelPaymentsReports: (id: string) =>
    `documents/payments-reports/${id}/download-excel/`,
  generationUpsellingReports: () => `documents/upselling-reports/`,
  downloadExcelUpsellingReports: (id: string) => {
    return `documents/upselling-reports/${id}/download-excel/`;
  },
  waivoTermsPdf: () => `documents/user-waivo-terms/`,
  customDocuments: (id = '', params = '') =>
    `documents/custom-documents/${id ? `${id}/?${params}` : `?${params}`}`,
  customDocumentsSample: () => `documents/custom-documents-sample/`,
};

function getContract(id: string) {
  return resolver(ENDPOINTS.contract(id));
}

function getAllContracts(params = '') {
  return resolver(ENDPOINTS.allContracts(params));
}

function getAvailableContractsYears(id: string) {
  return resolver(ENDPOINTS.availableContractsYears(id));
}

type GenerationTaskPayload = {
  housing: string | number;
  is_force: boolean;
  year: string | number;
};
function startArchiveGenerationTask(payload: GenerationTaskPayload) {
  return resolver(ENDPOINTS.archiveGenerationTask(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function deleteContract(id: string) {
  return resolver(ENDPOINTS.contract(id), {
    method: 'DELETE',
  });
}

function getEntryForms(params = '') {
  return resolver(ENDPOINTS.entryForms(params));
}

function deleteEntryForm(id: string) {
  return resolver(ENDPOINTS.entryForm(id), {
    method: 'DELETE',
  });
}

type DownloadAllContractsTypes = {
  housingId: string;
  year: string;
};
function getDownloadAllContractsLink({housingId, year}: DownloadAllContractsTypes) {
  return resolver(ENDPOINTS.allContractsDownload(housingId, year));
}

function getGuestbookSettings(housingId: string) {
  return resolver(ENDPOINTS.guestbookSettings(housingId));
}

type UpdateGuestbookSettingsTypes = {
  housingId: string;
  startingNumber: number;
};
function updateGuestbookSettings({
  housingId,
  startingNumber,
}: UpdateGuestbookSettingsTypes) {
  const payload = {
    starting_num: startingNumber,
  };

  return resolver(ENDPOINTS.guestbookSettings(housingId), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function getGuestbooks(params = '') {
  return resolver(ENDPOINTS.allGuestbooks(params));
}

function getGuestReports(params = '') {
  return resolver(ENDPOINTS.guestReports('', params));
}

function downloadGuestReport(
  id: string,
  housingId: string,
  payload?: Record<string, unknown>,
) {
  return resolver(ENDPOINTS.guestReportsExcel(id, housingId), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patchGuestReport(id: string, payload: ReportFieldsAndDate, params = '') {
  return resolver(ENDPOINTS.guestReports(id, params), {
    body: JSON.stringify(payload),
    method: 'PATCH',
  });
}

function postGuestReport(payload: ReportFieldsAndDate, params = '') {
  return resolver(ENDPOINTS.guestReports('', params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

type ReportGenerationTaskPayload = {
  housing_id?: string;
};

function startGuestReportGenerationTask(
  payload: ReportGenerationTaskPayload | {},
  params = '',
) {
  return resolver(ENDPOINTS.guestReportsTask(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

type EntryFormsTaskPayload = {
  reservation: string;
  is_force: boolean;
};

function startEntryFormsGenerationTask(payload: EntryFormsTaskPayload) {
  return resolver(ENDPOINTS.entryFormsGenerationTask(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function downloadEntryFormsArchive(reservationId: string) {
  return resolver(ENDPOINTS.allEntryFormsDownload(reservationId));
}

function startGuestbookGenerationTask(housingId: string, params = '') {
  const payload = {
    housing_id: housingId,
  };

  return resolver(ENDPOINTS.guestbookGenerationTask(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function postReservationReport(payload: ReportFieldsAndDate) {
  return resolver(ENDPOINTS.reservationReports(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patchReservationReport(id: string, payload: ReportFieldsAndDate) {
  return resolver(ENDPOINTS.reservationReports(id), {
    body: JSON.stringify(payload),
    method: 'PATCH',
  });
}

function startReservationReportGenerationTask(payload: ReportGenerationTaskPayload | {}) {
  return resolver(ENDPOINTS.reservationReportTasks(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function downloadReservationReport(housingId: string, payload: Record<string, unknown>) {
  return resolver(ENDPOINTS.reservationReportsExcel(housingId), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type DownloadPaymentReportPayload = {
  from_date?: string;
  to_date?: string;
};
function createPaymentsReports(payload: DownloadPaymentReportPayload) {
  return resolver(ENDPOINTS.paymentsReports(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function getDownloadExcelPaymentsLink(id: string) {
  return resolver(ENDPOINTS.downloadExcelPaymentsReports(id));
}

export type StartGenerateUpsReportsTypes = {
  year: string;
  month: string;
  housing_id?: string;
};
function startGenerateUpsellingReports(payload: StartGenerateUpsReportsTypes) {
  return queryFetcher(ENDPOINTS.generationUpsellingReports(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function createCustomDocument<T>(payload: T, isSample = false) {
  return queryFetcher(
    isSample ? ENDPOINTS.customDocumentsSample() : ENDPOINTS.customDocuments(),
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

function updateCustomDocument<T extends {id: string}>(payload: T) {
  return queryFetcher(ENDPOINTS.customDocuments(payload.id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function deleteCustomDocument(id: string) {
  return queryFetcher(ENDPOINTS.customDocuments(id), {
    method: 'DELETE',
  });
}

export {
  ENDPOINTS,
  getGuestReports,
  patchGuestReport,
  postGuestReport,
  startGuestReportGenerationTask,
  getContract,
  getEntryForms,
  getAllContracts,
  getAvailableContractsYears,
  startArchiveGenerationTask,
  getDownloadAllContractsLink,
  updateGuestbookSettings,
  getGuestbooks,
  getGuestbookSettings,
  downloadGuestReport,
  startEntryFormsGenerationTask,
  downloadEntryFormsArchive,
  deleteContract,
  deleteEntryForm,
  postReservationReport,
  patchReservationReport,
  startReservationReportGenerationTask,
  downloadReservationReport,
  startGuestbookGenerationTask,
  createPaymentsReports,
  getDownloadExcelPaymentsLink,
  startGenerateUpsellingReports,
  createCustomDocument,
  updateCustomDocument,
  deleteCustomDocument,
};
