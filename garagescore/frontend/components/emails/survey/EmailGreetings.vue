<template>
  <div>
    <p>{{ customerGreeting }}</p>
  </div>
</template>

<script>
  export default {
  layout() {
    return "email";
  },

  computed: {
    recipient() {
      return this.$store.getters.emailData("addressee");
    },
    isRecipientDefined() {
      return Boolean(this?.recipient);
    },
    isFullNameDefined() {
      return Boolean(this?.recipient?.fullName);
    },
    isFemale() {
      return this?.recipient?.gender === 'F';
    },
    isMale() {
      return this?.recipient?.gender !== 'F';
    },
    isFemaleRecipient() {
      return (
        this.isRecipientDefined
        && !this.isFullNameDefined
        && this.isFemale
      );
    },
    isMaleRecipient() {
      return (
        this.isRecipientDefined
        && !this.isFullNameDefined
        && this.isMale
      );
    },
    isTitleDefined() {
      return this?.recipient?.title;
    },
    isTitledRecipient() {
      return (
        this.isRecipientDefined
        && this.isFullNameDefined
        && this.isTitleDefined
      );
    },
    translatedHelloCustomer() {
      return this.$t_locale('components/emails/survey/EmailGreetings')(
        "helloCustomer",
        {
          title: this.$t_locale('components/emails/survey/EmailGreetings')(this.recipient.title),
          fullName: this.recipient.fullName,
          lastName: this.recipient.lastName || this.recipient.fullName,
        },
      );
    },
    customerGreeting() {
      if (!this.isRecipientDefined) {
        return `${this.$t_locale('components/emails/survey/EmailGreetings')("dearCustomerM")},`;
      }
      if (this.isFemaleRecipient) {
        return `${this.$t_locale('components/emails/survey/EmailGreetings')("dearCustomerF")},`;
      }
      if (this.isMaleRecipient) {
        return `${this.$t_locale('components/emails/survey/EmailGreetings')("dearCustomerM")},`;
      }
      if (!this.isTitledRecipient) {
        return `${this.$t_locale('components/emails/survey/EmailGreetings')("hello")},`;
      }
      if (this.isTitledRecipient) {
        return `${this.translatedHelloCustomer},`;
      }
      return `${this.$t_locale('components/emails/survey/EmailGreetings')("dearCustomerM")},`;
    }
  },
};
</script>

<style>
  p {
    margin: 0 0 10px 0;
  }
</style>

