export const order = (state = {}, action) => {
  switch (action.type) {
    case 'Order/ADD_DISH': {
      if (action.quantity < 1) {
        return state;
      }

      const newState = {...state};
      newState[action.dishId] =
        (newState[action.dishId] || 0) + action.quantity;

      return newState;
    }

    case 'Order/ADD_ONE_TO_DISH': {
      const newState = {...state};
      newState[action.dishId] = (newState[action.dishId] || 0) + 1;

      return newState;
    }

    case 'Order/REMOVE_ONE_FROM_DISH': {
      const newState = {...state};
      newState[action.dishId] = Math.max(1, (newState[action.dishId] || 0) - 1);

      return newState;
    }

    case 'Order/REMOVE_DISH': {
      const newState = {...state};
      delete newState[action.dishId];

      return newState;
    }

    case 'Order/CLEAR':
      return {};

    default:
      return state;
  }
};
