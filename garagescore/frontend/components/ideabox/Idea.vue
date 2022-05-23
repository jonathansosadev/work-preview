<template>
  <div class="idea">
   <div class="idea__publishing">
      <div class="idea__publishing__user"><i class="icon-gs-user" /></div>
      <div class="idea__publishing__informations">
        <div class="idea__publishing__informations__author">{{ author }}</div>
        <div class="idea__publishing__informations__date">le {{ formatDate(createdAt) }}</div>
      </div>
      <AppText class="idea__new" tag="div" bold v-if="isNew"><div class="idea__new__label">{{ $t_locale('components/ideabox/Idea')('new') }}</div></AppText>
      <Button
        class="idea__publishing__informations__edit-button"
        type="link-grey"
        v-if="canEdit && !editMode"
        @click="toggleEdit"
        v-tooltip="{content: $t_locale('components/ideabox/Idea')('editTooltip')}"
      >
        {{ $t_locale('components/ideabox/Idea')('edit') }}
     </Button>
    </div>
    <div class="idea__content" v-if="!editMode">
      <div class="idea__content__text">
        {{ newTitle }}
      </div>
    </div>
   <div class="idea__edit" v-if="editMode">
      <select v-model="newCategory">
        <option v-for="c of categories" :value="c" :key="c">{{c}}</option>/>
      </select>
      <textarea
        v-model="newTitle"
        placeholder="Écrivez un commentaire…"
        @input="resize($event)"
      />
      <div class="idea__edit__button">
        <Button type="orange" v-if="canEdit" @click="saveContent">{{ $t_locale('components/ideabox/Idea')('save') }}</Button>
        <Button type="phantom" v-if="canEdit" @click="toggleEdit">{{ $t_locale('components/ideabox/Idea')('cancel') }}</Button>
      </div>
    </div>

    <div class="idea__actions">
      <img src='https://svgshare.com/i/WgR.svg' width="18"  />
      <AppText class="idea__actions__score" tag="span" type="muted">{{ score }}</AppText>
    </div>

    <div class="idea__commands">

      <Button
        type="phantom"
        class="idea__commands__button"
        @click="updateLike"
      >
        <div v-if="!hasLiked" v-tooltip="{content: $t_locale('components/ideabox/Idea')('likeTooltip')}">👍 {{ $t_locale('components/ideabox/Idea')('like') }}</div>
        <div v-if="hasLiked" v-tooltip="{content: $t_locale('components/ideabox/Idea')('disLikeTooltip')}">👎 {{ $t_locale('components/ideabox/Idea')('disLike') }}</div>
      </Button>
      <Button
        class="idea__commands__button"
        type="phantom"
        v-if="!comments || comments.length === 0"
        @click="toggleComments"
        v-tooltip="{content: $t_locale('components/ideabox/Idea')('commentTooltip')}"
      >
        📋 {{ $t_locale('components/ideabox/Idea')('comment') }}
      </Button>
      <Button
        class="idea__commands__button"
        type="phantom"
        v-if="open && canClose"
        @click="updateStatus(false)"
        v-tooltip="{content: $t_locale('components/ideabox/Idea')('closeTooltip')}"
      >
        🔒 {{ $t_locale('components/ideabox/Idea')('close') }}
      </Button>
      <Button
        class="idea__commands__button"
        type="phantom"
        v-if="!open && canClose"
        @click="updateStatus(true)"
        v-tooltip="{content: $t_locale('components/ideabox/Idea')('reopenTooltip')}"
      >
        🔓 {{ $t_locale('components/ideabox/Idea')('reopen') }}
      </Button>
      <div class="idea__commands__tags">
        <Tag
          v-if="!open"
          class="idea__commands__tags__item"
          background="success-default"
          content="Ticket fermé"
          padding="xs"
        />
        <Tag
          v-if="newCategory"
          class="idea__commands__tags__item"
          background="grey-default"
          :content="newCategory"
          padding="xs"
        />
      </div>
    </div>

    <div class="idea__comment">
      <div class="idea__comment__controls">
        <Button
          type="link-grey"
          v-if="comments && comments.length === 1"
          @click="toggleComments"
          v-tooltip="{content: $t_locale('components/ideabox/Idea')('seeOneCommentTooltip')}"
        >
          1 {{ $t_locale('components/ideabox/Idea')('oneComment') }}
        </Button>
        <Button
          type="link-grey"
          v-if="comments && comments.length> 1"
          @click="toggleComments"
          v-tooltip="{content: $t_locale('components/ideabox/Idea')('seeManyCommentsTooltip')}"
        >
          {{comments.length}} {{ $t_locale('components/ideabox/Idea')('manyComments') }}
        </Button>
      </div>

      <div class="idea__comment__details" v-if="showComments && open">
        <div v-for="(c,i) of comments" :key="c.comment+i">
          <div class="idea__comment__details__header">
            <div class="idea__comment__details__header__user"><i class="icon-gs-user" /></div>
            <div class="idea__comment__details__header__informations">
              <div class="idea__comment__details__header__informations__author" v-if="editComment!==i">{{c.author}} </div>
              <div class="idea__comment__details__header__informations__date">le {{formatDate(c.createdAt)}}</div>
            </div>
            <Button
              class="idea__comment__details__header__edit-button"
              type="link-grey"
              v-if="canEdit && editComment!==i"
              @click="startEditingComment(i)"
              v-tooltip="{content: $t_locale('components/ideabox/Idea')('editCommentTooltip')}"
            >
              {{ $t_locale('components/ideabox/Idea')('edit') }}
            </Button>
          </div>

          <div class="idea__comment__content" v-if="editComment!==i">
            {{ c.comment }}
          </div>
          <div class="idea__comment__edit">
            <textarea
              v-if="editComment===i"
              v-model="editedComment"
              placeholder="Écrivez un commentaire…"
              @input="resize($event)"
            />
            <div class="idea__comment__edit__button">
              <Button type="orange" v-if="editComment===i" @click="updateComment">{{ $t_locale('components/ideabox/Idea')('save') }}</Button>
              <Button type="phantom" v-if="editComment===i" @click="cancelUpdateComment">{{ $t_locale('components/ideabox/Idea')('cancel') }}</Button>
            </div>
          </div>
        </div>
        <textarea
          v-model="newComment"
          placeholder="Écrivez un commentaire…"
          @input="resize($event)"
        />
        <Button class="idea__comment__details__button" type="secondary" @click="addComment">{{ $t_locale('components/ideabox/Idea')('send') }}</Button>
      </div>

    </div>

  </div>
</template>
<script>
import Tag from "~/components/ui/Tag";
  export default {
    components: { Tag },
    name: 'Idea',
    props: ['currentUser', 'showComments', 'userLiked', 'userCommented','userUpdatedContentOrStatus', 'userUpdatedIdeaComment', 'categories', 'id','title','author','category','likes','comments','open','createdAt','updatedAt', 'isNew'],
    data() {
      return {
        newComment: '',
        editMode: false,
        editComment: null,
        newTitle: this.title,
        newCategory: this.category,
        editedComment: "",
        showStatus: false,
      };
    },
    computed: {
      hasLiked() {
        return this.likes && this.likes.indexOf(this.currentUser) >= 0;
      },
      score() {
        return (this.likes && this.likes.length) || 0;
      },
      canEdit() {
        return this.currentUser === this.author || ['bbodrefaux', 'jscarinos', 'rbourbilieres'].indexOf(this.currentUser)>=0;
      },
      canClose() {
        return ['bbodrefaux', 'jscarinos', 'rbourbilieres'].indexOf(this.currentUser)>=0;
      }
    },
    methods: {
      // format date object
      formatDate(time) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(time);
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      },
      // like / unlike
      updateLike() {
        if(!this.likes) { this.likes = []; }
        const i = this.likes.indexOf(this.currentUser);
        if (i >= 0) {
          this.likes.splice(i, 1);
          this.userLiked(this.currentUser, this.id, false);
        } else {
          this.likes.push(this.currentUser);
          this.userLiked(this.currentUser, this.id, true);
        }
      },
      // open / close
      updateStatus(status) {
        this.open = status;
        this.userUpdatedContentOrStatus(this.currentUser, this.id, this.newTitle, this.newCategory, status);
      },
      // show / hide comments tree
      toggleComments() {
        this.showComments = !this.showComments;
      },
      // add a new comment
      addComment() {
        if(!this.comments) { this.comments = []; }
        this.comments.push( {
            "author" : this.currentUser,
            "comment" : this.newComment,
            "createdAt" : new Date()
        });
        this.userCommented(this.currentUser, this.id, this.newComment);
        this.newComment = "";
      },
      // show / hide title and category update form
      toggleEdit() {
        this.editMode = !this.editMode;
      },
      // save content
      saveContent() {
        this.userUpdatedContentOrStatus(this.currentUser, this.id, this.newTitle, this.newCategory, this.open);
        this.toggleEdit();
      },
      // start editing a comment
      startEditingComment(i) {
        this.editedComment = this.comments[i].comment;
        this.editComment=i;
      },
      // update a comment
      updateComment() {
        this.comments[this.editComment].comment = this.editedComment;
        this.userUpdatedIdeaComment(this.currentUser, this.id, this.editComment, this.editedComment);
        this.editComment = false;
      },
      // cancel comment update
      cancelUpdateComment() {
        this.editComment = false;
      },
      resize(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + "px";
      }
    }
  };
</script>

<style lang="scss" scoped>
.idea {
  display: flex;
  flex-direction: column;
  margin: 1rem 0 1.5rem 0;
  border-bottom: 1px solid rgba($grey, .7);
  padding: .5rem;

  &__edit {
    display: flex;
    flex-direction: column;

    &__button {
      display: flex;
      margin-top: .5rem;
    }
  }

  &__new {
    position: relative;
    top: .5rem;
    margin-left: 1rem;

    &__label {
      display: inline-block;
      background: $blue;
      color: $white;
      font-size: .9rem;
      padding: .3rem;
      border-radius: 3px;
      box-sizing: border-box;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    margin-left: .7rem;

    &__text {
      font-size: 1rem;
      margin-top: .5rem;
      color: $greyish-brown;
    }
  }

  &__publishing {
    display: flex;
    margin-bottom: .5rem;
    background: $bg-grey;
    padding: .5rem 0 .5rem .7rem;
    border-radius: 20px 20px 0 0;
    border-bottom: 1px solid rgba($grey, 0.3);

    &__user {
      font-size: 2rem;
      color: $grey;
      position: relative;
      top: 2px;
    }
    &__informations {
      display: flex;
      flex-direction: column;
      margin-left: .5rem;

      &__author {
        color: $black;
        font-weight: 700;
      }
      &__date {
        font-size: .85rem;
        color: $grey;
        font-style: italic;
      }
      &__edit-button {
        margin-left: auto;

        &__icon {
          font-size: 1rem;
        }
      }
    }
  }

  &__commands {
    display: flex;
    align-items: center;
    width: 100%;
    background-color: $bg-grey;
    padding: .5rem 0;
    border-radius: 0 0 20px 20px;
    font-weight: 700;

    &__button {
      border-right: 1px solid rgba($grey, .5);

      &:nth-last-child(-n+2) {
        border-right: none;
      }
    }
    &__tags {
      margin-left: auto;

      &__item {
        margin-right: 1rem;
      }
    }
  }

  &__actions {
    display: flex;
    padding: 1rem 0 1rem .7rem;
    border-bottom: 1px solid rgba($grey, .5);

    &__score {
      margin-left: .4rem;
    }
  }
  &__comment {
    display: flex;
    flex-direction: column;

    &__edit {

      &__button {
        display: flex;
        margin-bottom: .5rem;
        margin-top: .4rem;
      }
    }

    &__content {
      color: $dark-grey;
      background-color: rgba($grey, .2);
      border: 1px solid rgba($grey, .2);
      padding: 1rem;
      border-radius: 0 0 20px 20px
    }

    &__controls {
      margin-bottom: .5rem;

      ::v-deep .button {
        padding: .7rem;
      }
    }
    &__details {
      //padding: 0 1rem 1rem;

      &__button {
        margin-top: .5rem;
      }
      &__header {
        display: flex;
        margin-bottom: .5rem;
        background: $bg-grey;
        padding: .5rem 0 .5rem .7rem;
        border-radius: 20px 20px 0 0;
        border-bottom: 1px solid rgba($grey, 0.3);

        &__user {
          font-size: 2rem;
          color: $grey;
        }
        &__edit-button {
          margin-left: auto;
        }
        &__informations {
          display: flex;
          flex-direction: column;
          margin-left: .5rem;

          &__author {
            color: $black;
            font-weight: 700;
          }
          &__date {
            font-size: .85rem;
            color: $grey;
            font-style: italic;
          }
          &__edit {
            margin-left: 1rem;
          }
        }
      }
    }
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
  align-items: center;
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
