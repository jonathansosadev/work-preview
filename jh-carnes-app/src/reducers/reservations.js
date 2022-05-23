const reservations =(state=[],action) =>{
    switch (action.type) {

        case "SET_RESERVATIONS":
            return action.payload;

        case "UPDATE_RESERVATIONS":
            const copy = [...state];
            const index = copy.findIndex( item => item.id === action.payload.id );
            copy[index] = action.payload;
            return copy;

        default:
            return state;

    }
};
export default reservations;