<template>
  <div id="app">
    <IdeaBox :currentUser="currentUser"
        :ideas="ideas"
        :categories="categories"   
        :fetchIdeas="fetchIdeas"
        :postIdea="postIdea"
        :likeIdea="likeIdea"
        :updateIdea="updateIdea"
        :commentIdea="commentIdea"
        :updateIdeaComment="updateIdeaComment"
        :showComments="showComments"
  />
  </div>
</template>
<script>
import IdeaBox from "~/components/ideabox/IdeaBox";

import { makeApolloQueries, makeApolloMutations } from '../../util/graphql';

async function getIdeas ({after, ideaId}, documentCookies) {
  try {
  const args = {after, ideaId};
  const req = {
    name: 'IdeaboxGetIdeas',
    args,
    fields:
    ` hasMore
      ideas {
      id
      title
      author
      category
      likes
      comments {
        author
        comment
        createdAt
      }
      open
      isNew
      createdAt
      updatedAt
      }`
    };
    console.log("makeApolloQueries:", makeApolloQueries);
    const resp = await makeApolloQueries([req], {documentCookies});
    return resp.data.IdeaboxGetIdeas;

  } catch(e) {
    return [];
  }
}

export default {
  name: "ideabox",
  layout: "greybo",
  components: {  IdeaBox },
  data() {
    return { currentUser: 'anonymous', categories: 
    ['Accueil', 'Alertes', 'Analytics', 'Automation', 'Certificat', 'Cockpit', 'Connect', 'Contact', 'Enquêtes', 'Eréputation', 'Leads', 'Manager', 'Marketing', 'Mécontent', 'Monétisation', 'Organisationnel', 'Prospection', 'Rapports clients', 'Satisfaction', 'Synthèse', 'XLeads', 'Widget', 'Technique', 'Boite à idées', 'Divers']
    };
  },
  async asyncData({route, req})  {
    try {
      let cookie;
      if(typeof req === 'object') { // server
        cookie = req.headers.cookie
      } else { // client
        cookie = document.cookie;
      }
      const {ideas} = await getIdeas(route.query.id ? {ideaId: route.query.id}:{}, cookie);
      return {
        ideas,
        showComments: route.query.comment === 'open'
      };
    } catch(e) {
      console.error(e);
    }
  },
  mounted() {
    try {
      const user = this.$store.state.auth.currentUser.email;
      this.currentUser = user.split("@")[0];
    } catch(e) {
      console.error(e);
    }
  },
  computed: {
    fetchIdeas: () => getIdeas,
    likeIdea: () => async (user, ideaId, isLike) => {
      const req = {
        name: 'IdeaboxSetIdeaVote',
        args: { user, ideaId, isLike },
        fields: `
        status
        error`
      };
      await makeApolloMutations([req]);
    },
    postIdea: () => async (user, title, category) => {
      const req = {
        name: 'IdeaboxAddIdea',
        args: { user, title, category },
        fields: `
        status
        error`
      };
      await makeApolloMutations([req]);
    },
    updateIdea: () => async (user, ideaId, newTitle, newCategory, newStatus) => {
      const req = {
        name: 'IdeaboxSetIdeaContent',
        args: { user, ideaId, newTitle, newCategory, newStatus },
        fields: `
        status
        error`
      };
      await makeApolloMutations([req]);
    },
    commentIdea: () => async (user, ideaId, newComment) => {
      const req = {
        name: 'IdeaboxSetIdeaAddComment',
        args: { user, ideaId, newComment },
        fields: `
        status
        error`
      };
      await makeApolloMutations([req]);
    },
    updateIdeaComment: () => async (user, ideaId, commentId, editedComment) => {
      const req = {
        name: 'IdeaboxSetIdeaUpdateComment',
        args: { user, ideaId, commentId, editedComment },
        fields: `
        status
        error`
      };
      await makeApolloMutations([req]);
    },

  },
};
</script>

<style lang="scss" scoped>
#app {
  padding: 10px;
  height: 100%;
}
iframe {
  height: 800px;
    width: 100%;
    border: none;
}
</style>
