<template>
  <div class="modal-help">
    <transition name="modal">
      <div class="modal-mask">
        <div class="modal-wrapper" @click.self="closePopup()">
          <div class="modal-container">

            <div class="modal-header">
              <div class="logo-container">
                <img class="logo" src="/certificate/images/header/logo.png" alt="logo">
              </div>
              <span @click="closePopup()" class="close-btn"><i class="icon-gs-close-circle"></i></span>
              <span class="details">{{ $t_locale('components/certificate/CtfModalHelp')('title', { type: title }) }}</span>
            </div>

            <div class="modal-body">
              <div class="row-entry">
                <div class="icon-container icon-1">
                  <img src="/certificate/images/help-modal/1.png">
                </div>
                <div class="text-container">
                  <h4>{{ $t_locale('components/certificate/CtfModalHelp')('subtitle1') }}</h4>
                  <p>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text1') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text1-2') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text1-3') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text1-4') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text1-5') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text1-6') }}
                  </p>
                </div>
              </div>
              <div class="row-entry">
                <div class="icon-container icon-2">
                  <img src="/certificate/images/help-modal/2.png">
                </div>
                <div class="text-container">
                  <h4>{{ $t_locale('components/certificate/CtfModalHelp')('subtitle2') }}</h4>
                  <p>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text2') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text2-2') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text2-3') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text2-4') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text2-5') }}
                  </p>
                </div>
              </div>
              <div class="row-entry">
                <div class="icon-container icon-3">
                  <img src="/certificate/images/help-modal/3.png">
                </div>
                <div class="text-container">
                  <h4>{{ $t_locale('components/certificate/CtfModalHelp')('subtitle3') }}</h4>
                  <p>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text3') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text3-2') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text3-3') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text3-4') }}<br>
                    {{ $t_locale('components/certificate/CtfModalHelp')('text3-5') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    props: ['type'],
    data() {
      return {
        showModal: false
      }
    },
     methods: {
       closePopup() {
         this.$store.commit('certificate/SET_MODAL_HELP_VISIBLE', false);
       }
     },
    computed: {
      title() {
        const titleList = {VehicleInspection: this.$t_locale('components/certificate/CtfModalHelp')('vehicleInspection')};
        if (titleList[this.type]) return titleList[this.type];
        else return this.$t_locale('components/certificate/CtfModalHelp')('dealership');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modal-help {
    .modal-mask {
      position: fixed;
      z-index: 9998;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .5);
      display: table;
      transition: opacity .3s ease;
    }

    .modal-wrapper {
      display: table-cell;
      vertical-align: middle;
    }

    .modal-container {
      width: 850px;
      margin: 0px auto;
      
      background-color: #fff;
      border-radius: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
      transition: all .3s ease;
    }

    .modal-header {
      padding: 20px;
      border-bottom: none;
      color: white;
      background-image: url("/certificate/images/help-modal/bg-header-01.png");
      background-repeat: no-repeat;
      background-size: cover
    }

    .modal-header .details {
      font-size: 17px;
      font-weight: bold;
      padding-left: 65px;
    }

    .modal-header .close-btn:hover {
      cursor: pointer;
    }

    .modal-header .close-btn {
      float: right;
      font-size: 18px;
    }

    .modal-header .logo-container {
      margin-top: 0;
      font-size: 43px;
      
      width: calc(100% - 15px);
      display: inline-block;
    }

    .modal-body {
      margin: 20px 0;
      
      font-size: 16px;
      color: #757575;
      font-weight: bold;
      .black {
        color: black;
      }
      .blue {
        color: #43b9ad;
        font-weight: normal;
      }
      .row-entry {
        display: inline-block;
        width: 100%;
        .icon-container {
          text-align: left;
          display: inline-block;
          width: 80px;
          vertical-align: top;
          padding-top: 20px;
          padding-left: 5px;
          img {
            width: 57px;
          }
        }
        .text-container {
          display: inline-block;
          width: calc(100% - 90px);
          font-size: 14px;
          h4 {
            font-size: 18px;
            font-weight: bold;
            color: black;
            text-align: left;
          }
          p {
            text-align: justify;
          }
          margin-bottom: 30px;
        }
      }
    }

    .modal-default-button {
      float: right;
    }

    /*
     * The following styles are auto-applied to elements with
     * transition="modal" when their visibility is toggled
     * by Vue.js.
     *
     * You can easily play with the modal transition by editing
     * these styles.
     */

    .modal-enter {
      opacity: 0;
    }

    .modal-leave-active {
      opacity: 0;
    }

    .modal-enter .modal-container,
    .modal-leave-active .modal-container {
      -webkit-transform: scale(1.1);
      transform: scale(1.1);
    }

    @media (max-width: 991px) {
      .modal-container {
        width: 748px;
      }

      .modal-header {
        background-position-x: center;
        .logo-container {
          font-size: 30px;
        }
        .details {
          padding-left: 42px ;
        }
      }
    }

    @media (max-width: 768px) {
      .modal-container {
        width: 460px;
      }

      .modal-header {
        background-position-x: right;
        .details {
          font-size: 14px;
        }
      }

      .modal-body {
        height: 450px;
        overflow-y: scroll;
        .row-entry {
          .text-container {
            display: inline-block;
            width: 100%;
          }
          .icon-container {
            display: inline-block;
            width: 100%;
            text-align: center;
            padding: 0;
          }
        }
      }
    }

    @media (max-width: 480px) {
      .modal-mask {
        display: block;
        right: 0;
        .modal-wrapper {
          display: block;
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          .modal-container {
            position: absolute;
            top: 50px;
            left: 10px;
            right: 10px;
            bottom: 50px;
            max-width: calc(100% - 20px);
            .modal-header {
              background-image: url("/certificate/images/help-modal/bg-header-mobile-01.png");
              background-position-x: center;
              padding: 15px;
              height: 133px;
              .logo-container {
                img {
                  max-width: 100%;
                }
              }
              .details {
                font-size: 11px;
              }
            }
            .modal-body {
              height: calc(100% - 173px);
              .row-entry {
                .text-container {
                  font-size: 12px;
                  h4 {
                    font-size: 14px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
</style>
