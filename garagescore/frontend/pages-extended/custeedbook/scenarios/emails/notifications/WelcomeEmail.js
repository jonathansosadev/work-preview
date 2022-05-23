/* welcome email */
import WelcomeEmail from "~/components/emails/pages/notifications/WelcomeEmail.vue";
  
function stringProp(label, value) { return { label, value, inputType: 'text' }; }

export default {
  component: WelcomeEmail,
  props: [
    stringProp('url', ''),
    stringProp('token', ''),
    {
      label: 'icons',
      value: 
        {
          logo: 'https://cdn-custeed.netlify.app/logo/logo-custeed-long-286px-rgb.png',
          welcome: 'https://www.garagescore.com/static/latest/images/www/R1-R2/welcome-2.png',
          review: 'https://www.garagescore.com/static/latest/images/www/R1-R2/review.png',
          unsatisfied: 'https://www.garagescore.com/static/latest/images/www/R1-R2/unsatisfied.png',
          lead: 'https://www.garagescore.com/static/latest/images/www/R1-R2/lead.png',
          analytics: 'https://www.garagescore.com/static/latest/images/www/R1-R2/analytics.png',
          answer: 'https://www.garagescore.com/static/latest/images/www/R1-R2/answer.png'
        }
      ,
      inputType: 'json'
    },
  ]
}