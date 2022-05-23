export enum FEEDBACK_BANNER_STATUSES {
  show = 'SHOW',
  opened = 'OPENED',
  closed = 'CLOSED',
}

export type UserFeedbackInfo = {
  id: string;
  user_id: string;
  feedback_banner_status: FEEDBACK_BANNER_STATUSES;
  last_shown_feedback_banner_at: Date | null;
  created_at: string;
  updated_at: string;
};
