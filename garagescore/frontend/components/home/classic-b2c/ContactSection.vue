<template>
  <section id="contact" class="contact">
    <div class="contact__container">
      <div class="contact__container__header">
        <div class="contact__container__header__1">
          {{$t_locale('components/home/classic-b2c/ContactSection')("title1")}}
          </div>
        <div class="contact__container__header__2">
          {{$t_locale('components/home/classic-b2c/ContactSection')("title2")}}
        </div>
      </div>
      <form
        name="contactform"
        id="contact-form"
        class="contact__container__form"
      >
        <div class="contact__container__form__row">
          <div id="identity-group" class="contact__container__form__row__group">
            <label for="identity">{{$t_locale('components/home/classic-b2c/ContactSection')("who")}} <span class="contact__container__form__required">*</span></label>
            <select name="identity" id="identity" required v-model="identity">
              <option value="Un professionnel de l'automobile">{{$t_locale('components/home/classic-b2c/ContactSection')("pro")}}</option>
              <option value="Un automobiliste">{{$t_locale('components/home/classic-b2c/ContactSection')("person")}}</option>
            </select>
          </div>
          <div class="contact__container__form__row__group">
            <div class="contact__container__form__row__group__pair contact__container__form__row__group__pair1">
            <label for="name">
              {{$t_locale('components/home/classic-b2c/ContactSection')("fullname")}}
              <span class="contact__container__form__required">*</span>
            </label>
            <input name="name" type="text" id="name" v-model="name">
            </div>
            <div class="contact__container__form__row__group__pair">
            <label for="phone">
              {{$t_locale('components/home/classic-b2c/ContactSection')("phone")}}
              <span class="contact__container__form__required">*</span>
            </label>
            <input name="phone" type="text" id="phone" v-model="phone">
            </div>
          </div>
        </div>

        <div class="contact__container__form__row">
          <div id="user-informations" class="contact__container__form__row__group">
              <label id="lbl-socialReason" for="raisonsociale" v-if="isPro">{{$t_locale('components/home/classic-b2c/ContactSection')("bizname")}}</label>
              <input name="raisonsociale" type="text" class="form-control gs-input" id="raisonsociale" v-if="isPro" v-model="company">
              <label for="email">
                {{$t_locale('components/home/classic-b2c/ContactSection')("email")}}
                <span class="contact__container__form__required">*</span>
              </label>
              <input type="email" name="email" id="email" required v-model="email">
          </div>
          <div class="contact__container__form__row__group">
            <label for="message">
              {{$t_locale('components/home/classic-b2c/ContactSection')("message")}}
              <span class="contact__container__form__required">*</span>
            </label>
            <textarea name="message" id="message" required v-model="message"></textarea>
          </div>
        </div>
        <div class="contact__container__form__row" v-if="isSent">
          <div class="contact__container__form__issent">{{$t_locale('components/home/classic-b2c/ContactSection')("issent")}}</div>
        </div>
        <div class="contact__container__form__footer" v-show="!isSent">
          <div
            class="p-2 g-recaptcha"
            :data-sitekey="captchaSiteKey"
            data-callback="correctCaptcha"
            data-expired-callback="wrongCaptcha"
            data-error-callback="wrongCaptcha"
           v-if="!isSent" ></div>
          <a id="contact-btn" :class="cssButton" v-on:click="submit">{{$t_locale('components/home/classic-b2c/ContactSection')("submit")}}</a>
        </div>
      </form>
    </div>
    <div
      class="modal fade"
      id="contact-modal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="contact-modal"
      aria-hidden="true"
    ></div>
  </section>
</template>
<style lang="scss" scoped>
.contact {
  background: #333 url("/home/classic-b2c/contact/contact-bg.jpg") no-repeat 0 0;
  background-size: cover;
  margin-top: 40px;
  display: flex;
  padding: 3rem 0;
  
  &__container {
    box-sizing: border-box;
    flex: 0 0 100%;
    max-width: 1110px;
    background-color: rgba(207, 207, 207, 0.7);
    padding: 3rem;
    margin-left: auto;
    margin-right: auto;
    &__header {
      text-align: center;
      &__1 {
        font-size: 1.7em;
        font-weight: 300;
        padding-bottom: 1.5rem;
        letter-spacing: 1.2px;
      }
      &__2 {
        font-size: 1.2em;
        font-weight: 700;
        padding-bottom: 2rem;
        letter-spacing: 1.8px;
      }
    }
    &__form {
      margin-top: 2rem;
      label {
        color: #000000;
        font-size: 1rem;
        display: inline-block;
        margin-bottom: .5rem;
      }
      input, select, textarea {
        box-sizing: border-box;
        width: 100%;
        display: block;
        font-size: 1rem;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #B0B0B0;
        transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
        margin-bottom: 1.5rem;
        padding: 1rem;
        border-radius: 3px;
      }
      select {
        height: 3.5rem;
      }
      input {
        height: 3.5rem;
      }
      textarea {
        height: 10.2rem;
        margin-bottom: 2rem;
      }
      &__required {
        color: $red;
      }
      &__row {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        &__group {
          &:first-child {
          padding-right: 3.5rem;
          @media (max-width: $breakpoint-min-lg) {
              padding-right: 0rem;
            }
        }
          flex: 0 0 50%;
          @media (max-width: $breakpoint-min-lg) {
            flex: 0 0 100%;
          }
          box-sizing: border-box;
          &__pair {
            width: calc(50% - .88rem);
            @media (max-width: $breakpoint-min-lg) {
              width: 100%;
            }
            display: inline-block;
            box-sizing: border-box;
          }
          &__pair1 {
              margin-right: 1.5rem;
            @media (max-width: $breakpoint-min-lg) {
              margin-right: 0%;
            }
          }
        }
      }
      &__footer {
        display: flex;
        justify-content: flex-end;
        @media (max-width: $breakpoint-min-lg) {
          justify-content: normal;
          flex-direction: column;
          flex-wrap: nowrap;
        }
        &__btn {
          display: block;
          background-color: $orange;
          color: white !important;
          text-decoration: none;
          font-weight: 700;
          padding: 1rem;
          cursor: pointer;
          border-radius: 3px;
          font-size: 1rem;
          &__disabled {
            background-color: $grey;
            pointer-events: none;
          }
          @media (max-width: $breakpoint-min-lg) {
            margin-top: 30px;
          }
        }
      }
      &__issent {
        text-align: center;
        width: 100%;
        background: $dark_grey;
        color: white;
        height: 40px;
        line-height: 40px;
      }
    }
  }
}
#identity-group {
  position: relative;
   &::after {
    color: black;
    content: '▾';
    position: absolute;
    right: 4rem;
    top: 2.5rem;
    font-size: 20px;
  }
}
#identity {
  -moz-appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  &:focus {
    color: black;
  }
  // Hack for IE 11+
  &::-ms-expand {
    display: none;
  }
}
</style>
<style lang="scss" >
.g-recaptcha {
  @media (max-width: $breakpoint-min-lg) {
    padding-left: 15px;
    width: 100%;;
  }
}
</style>

<script>
export default {
  data() {
    return {
      identity: 'Un professionnel de l\'automobile',
      name: '',
      phone: '',
      company: '',
      email: '',
      message: '',
      canSubmit: false,
      isSent: false
    };
  },
  methods: {
    submit(e) {
      if (e) { e.preventDefault(); }
      this.canSubmit = false;
      //var checkFunc = typeof document.contactform.reportValidity === 'function';
      //var formOk = checkFunc ? document.contactform.reportValidity() : document.contactform.checkValidity();
      
      // Waiting for google recaptcha to be ready. Prevents "No reCAPTCHA client exists" error
      grecaptcha.ready(() => {
        var grecaptchaValue = grecaptcha.getResponse();
        if (grecaptchaValue) {
          //$('#contact-form').submit();
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${this.$store.state.appUrl}/contact-me`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onload = () => {
            if (xhr.status === 200) {
              this.isSent = true;
              this.canSubmit = false;
            } else {
              alert('Une erreur est survenue. Merci de réessayer ultérieurement');
            }
          };
          xhr.send(JSON.stringify({
            name: this.name,
            email: this.email,
            phone: this.phone,
            raisonsociale: this.company,
            context: 'contact-me',
            message: this.message,
            'g-recaptcha-response': grecaptchaValue
          }));
        }
      });
    }
  },
  computed: {
    cssButton () {
      const css = {
        contact__container__form__footer__btn: true,
        contact__container__form__footer__btn__disabled:
        !this.canSubmit || !this.identity || !this.message || !this.email || !this.phone || !this.name
      }
      return css;
    },
    captchaSiteKey() {
      return this.$store.state.b2c.home.captchaSiteKey;
    },
    isPro() {
      return this.identity === 'Un professionnel de l\'automobile';
    }
  },
  mounted() {
    let captchaIncluded = false;
    const includeRecaptcha = () => {
      let recaptchaScript = document.createElement('script');
      const locale = this.$store.getters['b2c/locale'];
      recaptchaScript.setAttribute('src', `https://www.google.com/recaptcha/api.js?hl=${locale && locale.split('_')[0]}`);
      document.head.appendChild(recaptchaScript);
      captchaIncluded = true;
      const disableSubmit = this.disableSubmit;
      const enableSubmit = this.enableSubmit;
      window.correctCaptcha = () => {
        this.canSubmit = true;
      };
      window.wrongCaptcha = () => {
        this.canSubmit = false;
      };
    }
    if (this.captchaSiteKey) {
      includeRecaptcha();
    } else {
      // we have the capcha key from the store yet, we wait
      this.$store.subscribe((mutation, state) => {
        if (!captchaIncluded && mutation.payload.captchaSiteKey) {
          includeRecaptcha();
        }
      });
    }
  }
};
</script>

