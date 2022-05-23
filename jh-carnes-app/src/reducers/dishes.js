export const dishes = (state = [], action) => {
  switch (action.type) {
    case 'Dishes/SET':
      return action.dishes;

    default:
      return state;
  }
};
