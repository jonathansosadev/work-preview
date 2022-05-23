<template>
    <div class="preview">
        <div class="preview--background">
            <textarea
                :disabled="!disabled"
                name="" 
                class="message" 
                v-model="textMessage" 
                placeholder="Votre texte ici"
                @input="resize($event)"
            ></textarea>
            <div class="url">
                <a :href="shortUrl">{{shortUrl}}</a>
            </div>
        </div>
        <div v-if="disabled" class="preview--error" v-show="!hasCharactersRemaining">
            Plus de caractères restants
        </div>
        <div v-if="disabled" class="preview--remaining" :class="{'preview--max-remaining': !hasCharactersRemaining}">
            {{totalCharacters}}/{{max}}
        </div>
    </div>
</template>
<script>
export default {
    name: 'previewMobile',
    props: {
        max: Number,
        text: String,
        url: String,
        preview: Boolean,
    },
    data() {
        return {
            textMessage: this.text,
            maxLength: this.max,
            shortUrl: this.url,
            disabled: this.preview
        }
    },
    computed: {
        totalCharacters() {
            return this.textMessage.length;
        },
        hasCharactersRemaining() {
            return this.totalCharacters < this.maxLength;
        }
    },
    watch: {
        textMessage() {
            this.textMessage = this.textMessage.substring(0, this.maxLength)
        },
        text(){
            this.textMessage = this.text;
        },
        max(){
            this.maxLength = this.max;
        },
        url(){
            this.shortUrl = this.url;
        },
        preview(){
            this.disabled = this.preview;
        }
    },
    methods: {
        resize (e) {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + "px";
        }
    }
}
</script>
<style lang="scss" scoped>
.preview {
    display: block;
    width: 450px;
    background-image: url("https://i.imgur.com/hTLcK66.png");
    background-repeat: no-repeat;
    height: 540px;
    font-family: Lato, sans-serif;

    &--background {
        display: block;
        width: 375px;
        padding:  1.5rem;
        box-sizing: border-box;
        background: $bg-grey;
        font-size: 1.5rem;
        border-radius: 2rem 2rem 0 2rem;
        margin-left: auto;
        margin-right: auto;
        position: relative;
        top: 140px;

        .message {
            width: 100%;
            height: 3.1rem;
            color: $dark-grey;
            line-height: 1.43;
            background: none;
            border-radius: 5px;
            border: none;
            font-size: 1.5rem;
            padding: .5rem;
            box-sizing: border-box;
            font-family: Lato, sans-serif;
            overflow: hidden;
            outline: none;
            resize: none;
            max-height: 320px;
        }
        
        .url {
            padding-left: .5rem;
        }
    }

    &--error {
        display: inline;
        color: $red;
        position: relative;
        top: 10rem;
        left: 2.5rem;
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
    }
    &--remaining {
        display: inline;
        color: $dark-grey;
        position: relative;
        top: 10rem;
        left: calc(100% - 5.7rem);
        font-size: 1.2rem;
    }
    &--max-remaining {
        color: $red;
        left: 8.1rem;
    }
}
textarea:focus {
    box-shadow: inset 0 0 3px 2px $blue;
}
textarea::placeholder {
  color: $grey;
}
</style>