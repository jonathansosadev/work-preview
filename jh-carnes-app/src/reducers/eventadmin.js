const eventsAdmin = (state=[], action) =>{
    switch (action.type) {

        case "SET_EVENTS_ADMIN":
            return action.payload;

        case "UPDATE_EVENTS_ADMIN":
            const copy = [...state];
            const index = copy.findIndex( item => item.id === action.payload.id );
            copy[index] = action.payload;
            return copy;

        default:
            return state;

    }
};
export default eventsAdmin;
