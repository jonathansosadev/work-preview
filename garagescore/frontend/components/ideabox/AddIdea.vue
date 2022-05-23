<template>
  <div class="add-idea">
    <AppText class="add-idea__title" size="lg" tag="span" type="black" bold>{{ $t_locale('components/ideabox/AddIdea')('addIdea') }}</AppText>
    <select v-model="category">
      <option value="" disabled selected>{{ $t_locale('components/ideabox/AddIdea')('chooseCategory') }}</option>
      <option v-for="c of categories" :value="c" :key="c">{{c}}</option>/>
    </select>
    <textarea
      v-model="title"
      placeholder="Écrivez votre idée…"
      @input="resize($event)"
    />
    <div class="add-idea__button">
      <Button type="orange" @click="saveContent" :disabled="!canAdd">{{ $t_locale('components/ideabox/AddIdea')('save') }}</Button>
      <Button type="phantom" @click="cancel">{{ $t_locale('components/ideabox/AddIdea')('cancel') }}</Button>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'AddIdea',
    props: ['currentUser', 'categories', 'userSaved', 'userCancelled'],
    data() {
      return {
        title: "",
        category: "",
      };
    },
    computed: {
      canAdd() {
        return this.title.length && this.category.length;
      }
    },
    methods: {
      //cancel
      cancel() {
        this.userCancelled();
      },
      // save content
      saveContent() {
        this.userSaved(this.currentUser, this.title, this.category);
      },
      resize(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + "px";
      }
    }
  };
</script>

<style lang="scss" scoped>
.add-idea {
  display: flex;
  flex-direction: column;

  &__title {
    margin: 1rem 0;
  }

  &__button {
    display: flex;
    margin-top: .5rem;
  }
}
textarea {
  width: 100%;
  height: 4.1rem;
  color: $dark-grey;
  line-height: 1.43;
  background-color: rgba($grey, .3);
  border-radius: 3px;
  border: 1px solid rgba($grey, .2);
  font-size: 1rem;
  padding: 1rem 0 .5rem 1rem;
  box-sizing: border-box;
  overflow: hidden;
  outline: none;
  resize: none;
  max-height: 320px;
}
textarea:focus {
  border: 1px solid rgba($grey, .8);
  box-shadow: 0 0 3px 0 rgba($black, .16);
}
textarea::placeholder {
  color: $grey;
}
select {
  width: 100%;
  min-width: 15ch;
  max-width: 30ch;
  padding: 0.5rem 0;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  line-height: 1.1;
  background-color: transparent;
  border-bottom: 2px solid $grey;
  display: grid;
  grid-template-areas: "select";
  position: relative;
  margin-bottom: .5rem;

  &:hover {
    border-bottom: 2px solid $greyish-brown;
  }
}
select::after {
  content: "";
  width: 0.8em;
  height: 0.5em;
  background-color: var(--select-arrow);
  clip-path: polygon(100% 0%, 0 0%, 50% 100%);
}
select:after {
  grid-area: select;
  justify-self: end;
}
select:focus + .focus {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 2px solid var(--select-focus);
  border-radius: inherit;
}
</style>
