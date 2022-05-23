module.exports = function GroupDefinition(Group) {
  Group.validatesUniquenessOf('name');
};
