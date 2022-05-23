const events =(state=[],action) =>{
    switch (action.type) {

        case "SET_EVENTS":
            return action.payload;

        case "UPDATE_EVENTS":
            const copy = [...state];
            const index = copy.findIndex( item => item.id === action.payload.id );
            copy[index] = action.payload;
            return copy;

        default:
            return state;

    }
};
export default events;