import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Amount, Content, ItemList, List, Title } from './styled';
import Section from '../Section';
import api, {queryFetcher} from '../../../api';
import {useQuery} from 'react-query';

const emailStatisticsRefetchIntervalS = 4;
function fetchReservationEmails(id: string) {
  return queryFetcher(api.reservations.ENDPOINTS.reservationEmails(id));
}

function fetchDefatulBookingsEmails(id: string) {
  return queryFetcher(api.reservations.ENDPOINTS.defaulReservationsEmails(id));
}

type SentEmailProps = {
  subject: string;
  count: number;
};
type BookingOption = {
  name: string;
  code: string;
  count: number;
};

type BookingOptions = {
  [char: string]: BookingOption;
};


type ReservationEmails = SentEmailProps[];

const BookingsCommunicationSections = React.forwardRef(
	(
		{
			reservation,
		}: any,
		ref,
	) => {
		const { t } = useTranslation();
		const {
			data: reservationEmails,
		} = useQuery<ReservationEmails>(
			['reservationEmails', reservation?.id],
			() => fetchReservationEmails(reservation!.id),
			{
				enabled: Boolean(reservation?.id),
				refetchInterval: emailStatisticsRefetchIntervalS * 1000,
			},
		);

		const DefaultBookingOptions = React.useMemo<BookingOptions>(() => {
			return {
				email_reservation_payments_enabled: { name: t('payment_emails'), code: 'PAYMENT_REQUEST_EMAIL', count: 0 },
				email_self_chekin_online_enabled: { name: 'Online check-in email', code: 'DEFAULT', count: 0 },
				email_smart_lock_enabled: { name: t('virtual_keys'), code: 'SMART_LOCK', count: 0 },
				email_upselling_enabled: { name: 'Upselling Emails', code: 'UPSELLING_DEAL_LIST_EMAIL', count: 0 },
			}
		}, [t]);



		const { data: defaultBookingEmailsResponse } = useQuery(['defaultBookingEmails', reservation?.id], () => fetchDefatulBookingsEmails(reservation?.id), {
			enabled: Boolean(reservation?.id),
			refetchOnWindowFocus: false,
		});

		const [sentEmails, setSentEmails] = React.useState<SentEmailProps[]>([]);
		const DEFAULT_CHEKCKIN_EMAIL_SUBJECT = 'Online Check-in Email'
		useEffect(() => {
			if (reservationEmails && defaultBookingEmailsResponse) {
				let defaultBookingEmails = defaultBookingEmailsResponse[0];
				let auxiliarBookingSentEmails: BookingOptions = {};
				let isEnabled: boolean = false;
				let tempSentEmails: SentEmailProps[] = [
					{
						subject: DEFAULT_CHEKCKIN_EMAIL_SUBJECT,
						count: 0
					}
				];

				setSentEmails([])

				for (let i in defaultBookingEmails) {
					isEnabled = i !== 'id' && i !== 'custom_emails_enabled' && defaultBookingEmails[i] && i !== "email_self_chekin_online_enabled";

					if (isEnabled) {

						auxiliarBookingSentEmails[DefaultBookingOptions[i].code] = DefaultBookingOptions[i]
						const sentEmail = { subject: DefaultBookingOptions[i].name, count: DefaultBookingOptions[i].count };
						tempSentEmails.push(sentEmail);
					}

					if (i === 'custom_emails_enabled') {
						const customEmailsArray: string[] = defaultBookingEmails[i];
						customEmailsArray.forEach(cm => {
							if (!reservationEmails.some(re => re.subject === cm)) {
								tempSentEmails.push({ subject: cm, count: 0 });
							}
						})
					}
				}

				reservationEmails.forEach(re => {
					let defaultOnlineChekinEmail = tempSentEmails.find(t => t.subject === DEFAULT_CHEKCKIN_EMAIL_SUBJECT) as SentEmailProps;

					if (auxiliarBookingSentEmails[re.subject]) {
						let currentEs = tempSentEmails.find(t => t.subject === auxiliarBookingSentEmails[re.subject].name);
						if (currentEs) {
							currentEs.count = re.count
						}
					}
					if (re.subject !== 'PAYMENT_REQUEST_EMAIL' &&
						re.subject !== 'DEFAULT' &&
						re.subject !== 'UPSELLING_DEAL_LIST_EMAIL' &&
						re.subject !== 'SMART_LOCK' &&
						re.subject !== 'SELF_CHECKIN' &&
						re.subject !== 'ALL_GENERAL_PAYMENTS_ARE_PAID' &&
						re.subject !== 'UPSELLING_REQUESTED_EMAIL' &&
						re.subject !== 'UPSELLING_APPROVED_EMAIL' &&
						re.subject !== 'UPSELLING_REJECTED_EMAIL' &&
						re.subject !== 'ID_VERIFICATION_RETRY_EMAIL' &&
						re.subject !== 'ID_VERIFICATION' &&
						re.subject !== 'REMINDER' &&
						re.subject !== 'REMOTE_ACCESS' &&
						re.subject !== 'GERMANY_STAT_FIRST_NOTIFICATION_EMAIL' &&
						re.subject !== 'GERMANY_STAT_SECOND_NOTIFICATION_EMAIL' &&
						re.subject !== 'SLOVENIA_POLICE_FIRST_NOTIFICATION_EMAIL' &&
						re.subject !== 'SLOVENIA_POLICE_SECOND_NOTIFICATION_EMAIL' &&
						re.subject !== 'RESERVATION_GUEST_SIGNUP_LINK_EMAIL' &&
						re.subject !== 'USER_INVITE_EMAIL' &&
						re.subject !== 'PASSWORD_RESET_EMAIL' &&
						re.subject !== 'COLLABORATOR_REGISTRATION' &&
						re.subject !== 'RESERVATION_ASSIGNED' &&
						re.subject !== 'GUEST_REGISTRATION_COMPLETED_EMAIL' &&
						re.subject !== 'USER_REGISTRATION' &&
						re.subject !== 'STAT_REGISTRATION_FAILED_EMAIL' &&
						re.subject !== 'STAT_REGISTRATION_SUCCESS_EMAIL' &&
						re.subject !== 'POLICE_REGISTRATION_FAILED_EMAIL' &&
						re.subject !== 'POLICE_REGISTRATION_SUCCESS_EMAIL' &&
						re.subject !== 'POLICE_REGISTRATION_OUT_SUCCESS_EMAIL' &&
						re.subject !== 'END_TRIAL_EMAIL' &&
						re.subject !== 'MISSING_GUEST_WARNING_EMAIL' &&
						re.subject !== 'MISSING_GUEST_WARNING_GROUP_EMAIL' &&
						re.subject !== 'PROPERTY_BACKUP_EMAIL' &&
						re.subject !== 'USER_BACKUP_EMAIL' &&
						re.subject !== 'USER_MIGRATION_EMAIL' &&
						re.subject !== 'CHECKIN_ONLINE_COMPLETE_EMAIL' &&
						re.subject !== 'GOMERA_REPORT_EMAIL' &&
						re.subject !== 'USER_REPORT_EMAIL' &&
						re.subject !== 'GUEST_PAID_FOR_TAXES_EMAIL' &&
						re.subject !== 'UPSELLING_APPROVED_EMAIL' &&
						re.subject !== 'UPSELLING_PAID_EMAIL' &&
						re.subject !== 'ADMIN_HOUSINGS_REPORT_EMAIL' &&
						re.subject !== 'ADMIN_UPSELLING_REPORT_EMAIL'
					) {
						tempSentEmails.push(re);
					}
					switch (re.subject) {
						case 'DEFAULT':
						case 'REMINDER':
						case 'SELF_CHECKIN':
						case 'ID_VERIFICATION':
						case 'REMOTE_ACCESS':
							defaultOnlineChekinEmail.count = re.count;
							break;
						default:
							break;
					}
				})
				setSentEmails(sentEmails => [...sentEmails, ...tempSentEmails])
			}
		}, [reservationEmails, defaultBookingEmailsResponse, DefaultBookingOptions])
		return (
			<>
				{
					sentEmails && sentEmails?.length > 0 && (
						<Section title={t('communications')}>
							<Title>
								{t('emails_sent')}
							</Title>
							{sentEmails && (
								<List>
									{sentEmails?.map((sentEmail: SentEmailProps, index) => {
										return (
											<ItemList key={index}>
												<Content>
													{sentEmail?.subject}
												</Content>
												<Amount>
													{sentEmail?.count}
												</Amount>
											</ItemList>
										);
									})}
								</List>
							)}
						</Section>
					)
				}


			</>

		)
	})


export { BookingsCommunicationSections }
