<template>
  <div class="idea-box">
    <div class="idea-box__header">
      <AppText class="idea-box__header__title" size="lg" tag="span" type="black" bold>{{ $t_locale('components/ideabox/IdeaBox')('ideaBox') }}</AppText>
      <Button
        class="idea-box__header__add-button"
        v-if="canShowAddButton"
        type="orange"
        @click="mode='add'"
      >
        {{ $t_locale('components/ideabox/IdeaBox')('addIdea') }}
      </Button>
    </div>

    <div v-if="mode === 'add'">
      <AddIdea
        :currentUser="currentUser"
        :categories="categories"
        :userSaved="addIdea"
        :userCancelled="closeAddForm"
        />
    </div>
    <div class="idea-box__content custom-scrollbar" v-if="mode === 'list'">
      <Idea v-for="i of ideasList"
      :key="i.id"
      :currentUser="currentUser"
      :categories="categories"
      :userLiked="likeIdea"
      :userCommented="commentIdea"
      :userUpdatedContentOrStatus="updateIdea"
      :userUpdatedIdeaComment="updateIdeaComment"
      :id="i.id"
      :title="i.title"
      :author="i.author"
      :category="i.category"
      :likes="i.likes"
      :comments="i.comments"
      :open="i.open"
      :createdAt="i.createdAt"
      :updatedAt="i.updatedAt"
      :isNew="i.isNew"
      :showComments="showComments"
      />
      <Button v-if="!focus" type="link-grey" @click="more">{{ $t_locale('components/ideabox/IdeaBox')('more') }}</Button>
      <Button v-if="focus" type="link-grey" @click="back">{{ $t_locale('components/ideabox/IdeaBox')('showAll') }}</Button>
    </div>
  </div>
</template>
<script>

import Idea from "./Idea";
import AddIdea from "./AddIdea";
  export default {
    components: { Idea, AddIdea},
    name: 'IdeaBox',
    props: ["ideas", "showComments", "currentUser", "categories", "fetchIdeas", "postIdea", "updateIdea", "likeIdea", "commentIdea", "updateIdeaComment"],
    data() {
      let ideasList;
      try {
        ideasList = JSON.parse(JSON.stringify(this.ideas));
      } catch(e) {
        console.log(e, this.ideas);
        ideasList = [];
      }
      return {
        mode: 'list',
        ideasList,
        hasMore: !!ideasList.length,
      };
       
    },
    mounted() {
    },
    computed: {
      focus() {
        this.ideasList.length === 1;
      },
      canShowAddButton() {
        return this.mode === 'list' && this.ideasList.length > 1;
      }
    },
    methods: {
      closeAddForm() {
        this.mode = 'list';
      },
      addIdea(author, title, category) {
        this.closeAddForm();
        this.ideasList = [
          {title, category, author, isNew: true, open: true, createdAt: new Date(), updatedAt: new Date()},
        ...this.ideasList];
        this.postIdea(author, title, category);
      },
      async more() {
        const l = this.ideasList.length;
        const self = this;
        const lastIdea = l>0 && self.ideasList[l-1].id;
        const i = await this.fetchIdeas({after:lastIdea || null});
        self.ideasList = [...self.ideasList, ...i.ideas];
        self.hasMore = i .hasMore;
      },
      async back() {
        document.location="/grey-bo/ideabox";
      }
    }
  };
</script>

<style lang="scss" scoped>
.idea-box {
  background-color: $white;
  box-shadow: 0 0 3px 0 rgba($black, .16);
  border-radius: 3px;
  padding: 1.5rem;
  width: 50vw;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba($grey, .5);
    height: 50px;
    box-sizing: border-box;

    &__add-button {
      margin-left: auto;
    }
  }
}

</style>
