<template>
    <div class="carousel">
        <slot></slot>
        <!--<button class="carousel__nav carousel__next" @click.prevent="next"> Suivant</button>-->
        <!-- <button class="carousel__nav carousel__pref" @click.prevent="prev"> Précédent</button>-->
        <div class="carousel__pagination">
            <button v-for="n in slidesCount" @click="goto(n-1)" :class="{active: n-1 == index}"></button>
        </div>
    </div>
</template>
<script>
export default {
    data () {
        return {
            index: 0,
            slides: [],
            direction: null
        }
    },
    mounted () {
        this.slides = this.$children;
        this.slides.forEach((slide, i) => {
            slide.index = i
        });

        const self = this;
        setInterval(() => {
          if (self.index  === (self.slides.length - 1)) {
            self.index = 0;
            self.direction = 'left';
          } else {
            self.index++;
            self.direction = 'right';
          }
        }, 5000);
    },
    computed: {
        slidesCount () { return this.slides.length }
    },
    methods: {
        next () {
            this.index++
            this.direction = 'right'
            if (this.index >= this.slidesCount) {
                this.index = 0
            }
        },
        prev () {
            this.index--
            this.direction = 'left'
            if (this.index < 0) {
                this.index = this.slidesCount - 1
            }
        },
        goto (index) {
            this.direction = index > this.index ? 'right' : 'left';
            this.index = index
        }
    }
}
</script>
<style>
.carousel {
    position: relative;
    overflow: hidden;
}
.carousel__nav {
    position: absolute;
    background: red;
    top: 50%;
    margin-top: 30px;
    left: 10px;
}
.carousel__nav.carousel__next {
    right: 10px;
    left: auto;
}
.carousel__pagination {
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    text-align: center;
}
.carousel__pagination button {
    display: inline-block;
    background-color: #FFF;
    opacity: 0.5;
    -moz-border-radius: 10px;
    -webkit-border-radius: 10px;
    border-radius: 10px;
    margin: 0 2px;
    border: none;
    cursor: pointer;
}
.carousel__pagination button.active {
    background-color: #FFF;
    opacity: 1;
}
</style>