'use strict';

class ReviewApp {
  // eslint-disable-line no-unused-vars
  constructor(Vue, projectName) {
    this._vue = Vue;
    this._bodyDOM = '#gs-review-vue';
    this._data = {
      title: 'GarageScore Review Tool',
      projects: [],
      selectedProject: {},
      selectedProjectNameAtLoading: decodeURI(projectName),
      loading: false,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    this._methods = {
      getProjectList: this.getProjectList,
      getProjectsColumns: this.getProjectsColumns,
      getColumnCards: this.getColumnCards,
      getProjectFromHash: this.getProjectFromHash,
      setProjectInUrlHash: this.setProjectInUrlHash,
      selectProject: this.selectProject,
      addNote: this.addNote,
      deleteCard: this.deleteCard,
      editCard: this.editCard,
      stopEditCard: this.stopEditCard,
      moveCard: this.moveCard,
      getDestColumn: this.getDestColumn,
    };
    this._created = this.created;
    this._vueOptions = {
      el: this._bodyDOM,
      data: this._data,
      methods: this._methods,
      created: this._created,
    };
  }

  start() {
    this._myVue = new this._vue(this._vueOptions);
  }

  created() {
    this.getProjectList();
  }

  getProjectList() {
    this.$http.get('/api/v1/team/review/projects', { headers: this.headers }).then(
      (response) => {
        this.projects = response.body;
        this.selectedProject =
          this.getProjectFromHash(this.selectedProjectNameAtLoading, this.projects) || this.projects[0] || {};
        this.getProjectsColumns();
      },
      (error) => {
        console.log('Unable to retrieve project list ' + JSON.stringify(error));
      }
    );
  }

  getProjectFromHash(hash, projects) {
    for (const project of projects) {
      if (hash === project.name) {
        return project;
      }
    }
    return null;
  }

  setProjectInUrlHash(projectName) {
    document.location = document.location.toString().replace(/#.+/, '') + '#' + projectName;
  }

  getProjectsColumns() {
    for (let project of this.projects) {
      if (project.columns_url) {
        this.$http.get('/api/v1/team/review/projects/' + project.id + '/columns', { headers: this.headers }).then(
          (response) => {
            this.$set(project, 'columns', response.body);
            this.getColumnCards(project);
          },
          (error) => {
            console.log('Unable to retrieve columns list ' + JSON.stringify(error));
          }
        );
      }
    }
  }

  getColumnCards(project) {
    for (let column of project.columns) {
      this.$set(column, 'newCard', '');
      if (column.cards_url) {
        this.$http
          .get('/api/v1/team/review/projects/' + project.id + '/columns/' + column.id + '/cards', {
            headers: this.headers,
          })
          .then(
            (response) => {
              this.$set(
                column,
                'cards',
                response.body.map((e) => Object.assign(e, { editing: false, edit: e.note }))
              );
            },
            (error) => {
              console.log('Unable to retrieve cards ' + JSON.stringify(error));
            }
          );
      }
    }
  }

  addNote(project, column) {
    if (column.cards_url) {
      this.$http
        .post(
          '/api/v1/team/review/projects/' + project.id + '/columns/' + column.id + '/cards',
          { note: column.newCard },
          { headers: this.headers }
        )
        .then(
          (response) => {
            column.cards.unshift(Object.assign(response.body, { editing: false, edit: response.body.note }));
            column.newCard = ''; // eslint-disable-line no-param-reassign
          },
          (error) => {
            console.log('Unable to create card ' + JSON.stringify(error));
          }
        );
    }
  }

  selectProject(index) {
    if (index >= 0 && index < this.projects.length && index !== this.projects.indexOf(this.selectedProject)) {
      this.selectedProject = this.projects[index] || {};
      this.setProjectInUrlHash(this.selectedProject.name);
    }
  }

  deleteCard(project, column, card) {
    this.$http
      .delete('/api/v1/team/review/projects/' + project.id + '/columns/' + column.id + '/cards/' + card.id)
      .then(
        () => {
          column.cards.splice(column.cards.indexOf(card), 1);
        },
        (error) => console.log('Unable to delete card ' + JSON.stringify(error))
      );
  }

  editCard(card, cardEditId) {
    card.editing = true; // eslint-disable-line no-param-reassign
    setTimeout(() => document.querySelector('#' + cardEditId).focus(), 0);
  }

  stopEditCard(project, column, card) {
    card.editing = false; // eslint-disable-line no-param-reassign
    if (card.note !== card.edit) {
      this.$http
        .put(
          '/api/v1/team/review/projects/' + project.id + '/columns/' + column.id + '/cards/' + card.id,
          { note: card.edit },
          { headers: this.headers }
        )
        .then(
          (result) => {
            Object.assign(card, { note: result.body.note });
          },
          (error) => console.log('Unable to modify card ' + JSON.stringify(error))
        );
    }
  }

  moveCard(project, column, destColumn, card) {
    this.$http
      .post(
        '/api/v1/team/review/projects/' + project.id + '/columns/' + column.id + '/cards/' + card.id + '/moves',
        { columnId: destColumn.id },
        { headers: this.headers }
      )
      .then(
        () => {
          column.cards.splice(column.cards.indexOf(card), 1);
          destColumn.cards.push(card);
        },
        (error) => console.log('Unable to move card ' + JSON.stringify(error))
      );
  }

  getDestColumn(project, column) {
    for (const col of project.columns) {
      if (col.id !== column.id) {
        return col;
      }
    }
    return null;
  }
}
