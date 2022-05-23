import React from 'react';
import CurrentPlanSection from '../CurrentPlanSection';
import PreviousInvoicesTable from '../PreviousInvoicesTable';
import BillingDetailsSection from '../BillingDetailsSection';
import ElementsInjectedPaymentCardSection from '../PaymentCardSection';

function BillingSections() {
  return (
    <div>
      <CurrentPlanSection />
      <ElementsInjectedPaymentCardSection />
      <BillingDetailsSection />
      <PreviousInvoicesTable />
    </div>
  );
}

export {BillingSections};
