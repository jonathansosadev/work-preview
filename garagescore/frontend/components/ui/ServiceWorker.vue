<template>
  <section class="service-worker">
  </section>
</template>

<script>
  export default {
    async mounted() {
      const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
            registration.addEventListener('updatefound', async () => {
              await registration.update();
              console.log('GS Service Worker Updated');
            });
            console.log('GS Service Worker Registered');

            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            if (isIOS && this.$store.getters['cockpit/getOrigin'] !== 'pwa') {
              setTimeout(() => {
                this.$store.dispatch('openModal', { component: 'ModalInstallHomeScreenApp' })
              });
            }

            window.addEventListener('beforeinstallprompt', async (e) => {
              if (typeof gtag !== 'undefined' && e.userChoice) {
                const outcome = await e.userChoice; // userChoice is Promise
                gtag('event', 'A2H', outcome);
              }
            });

          } catch (e) {
            console.error(e);
          }
        });
      } else {
        console.warn('Unable to register SW, no serviceWorker in current navigator.');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .service-worker {

  }
</style>
