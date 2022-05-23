<template>
  <div>
    <div class="header">
      <img style="position: relative;top: 5px;" src='https://svgshare.com/i/Mwg.svg'/>
      <h1 class="header__title">Tutoriels pratiques</h1>
      <p class="header__subtitle">Vous trouvez ici des formations qui peuvent vous être utiles</p>
    </div>
    <div v-if="resourcesByProduct == null">
      Aucune ressource trouvée
    </div>
    <div v-else>
      <div class="overlay" v-show="video" @click="video = null">
        <div class="overlay__content">
          <iframe
            width="800"
            height="499"
            :src="video"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      </div>
      <article v-for="p in resourcesByProduct">
        <div>
          <figure v-for="v in p.resources">
            <div class="thumbnail">
              <img :src="v.thumbnail" @click="watch(v.url)" />
              <div class="thumbnail__overlay" @click="watch(v.url)">
                <div class="thumbnail__play">
                  <img src='https://svgshare.com/i/MFs.svg'/>
                </div>
              </div>
            </div>
            <figcaption>{{ v.title }}</figcaption>
            <p>{{ v.description }}</p>
            <label class="tag">{{ p.product }}</label>
            <button @click="watch(v.url)">Regarder la vidéo</button>
          </figure>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    resourcesByProduct: Array,
    markResourceWatched: Function
  },
  data() {
    return {
      video: null
    };
  },
  methods: {
    watch(url) {
      try {
        this.markResourceWatched(url);
        this.video = url;
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.header{
  margin-left: 1rem;

  &__title {
    font-size: 2rem;
    font-weight: 900;
    margin-left: .5rem;
    display: inline;
    padding-top: 1rem;
  }

  &__subtitle {
    font-size: 1rem;
    font-weight: 700;
    color: $dark-grey;
    margin-bottom: 1.5rem;
  }
}
.overlay {
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.9);

  &__overlay-content {
    position: relative;
    top: 5%;
    width: 100%;
    text-align: center;
    margin-top: 30px;
  }
}
.thumbnail{
  position: relative;
  display: block;

  &__overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: .3s ease;
    background-color: rgba(0, 0, 0, 0.75);
    cursor: pointer;
    border-radius: 3px 3px 0 0;

    &:hover {
      opacity: 1;
    }
  }

  &__play {
    position: absolute;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
  }
}
.tag {
  background: $xleads-red;
  border-radius: 3px;
  color: $white;
  display: inline-block;
  height: 2rem;
  line-height: 2;
  padding: 0 1rem 0 1.5rem;
  position: relative;
  text-decoration: none;
  margin-left: 1rem;
  -webkit-transition: color 0.2s;

  &::before {
    background: $white;
    border-radius: 10px;
    box-shadow: inset 0 1px rgba(0, 0, 0, 0.25);
    content: '';
    height: 6px;
    left: 10px;
    position: absolute;
    width: 6px;
    top: .8rem;
  }

  &:hover {
    background-color: $xleads-red;
    color: $white;
  }

  &:hover::after {
    border-left-color: $xleads-red;
  }
}
figure {
  width: 30%;
  margin: 0;
  margin-left: 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  background: $white;
  border-radius: 3px;
  box-shadow: 0 0 3px 0 rgba(0,0,0,.16);
  box-sizing: border-box;

  & img {
    display: block;
    height: auto;
    width: 100%;
    cursor: pointer;
    border-radius: 3px 3px 0 0;

    &:hover {
      background: rgba(0, 0, 0, 0.75);
    }
  }

  & p {
    font-size: 1rem;
    color: $dark-grey;
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    text-align: left;
    padding: 0 1rem;
    margin-bottom: 1rem;
  }

  & button {
    width: calc(100% - 2rem);
    cursor: pointer;
    outline: none;
    border: none;
    text-decoration: none;
    border-radius: 5px;
    margin: 0;
    padding: 0.7rem 1rem;
    background: $orange;
    color: $white;
    font-size: 1rem;
    box-shadow: 0 0 10px rgba(0,0,0,0.15);
    margin: 1rem;

    &:hover {
      background-color: #d34d01;
    }
  }
}
figcaption {
  font-weight: 700;
  font-size: 1.5rem;
  margin: .7rem 1rem 0 1rem;
  height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  margin-bottom: .5rem;
}
article > div {
  display: flex;
  flex-wrap: wrap;
}
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,.7);
  z-index: 2;
}
@media (max-width: $breakpoint-min-sm) {
  figure {
    width: 100%;
  }
}
</style>
