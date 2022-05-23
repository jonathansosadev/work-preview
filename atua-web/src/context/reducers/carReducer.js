import { CARS_LOADING, GET_USER_CARS, REMOVE_CARS_INFO } from "../actionTypes";

export default function carReducer(state, { type, payload }) {
  switch (type) {
    case CARS_LOADING:
      return { ...state, loading: true };

    case GET_USER_CARS:
      return { ...state, userCars: payload, loading: false };

    case REMOVE_CARS_INFO:
      return state;

    default:
      return state;
  }
}
