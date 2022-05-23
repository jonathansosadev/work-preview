const clients = (state = [], action) => {

    switch (action.type) {

        case "SET_CLIENTS":
            return action.payload;

        case "UPDATE_CLIENT":
            const copy = [...state];
            const index = copy.findIndex( item => item.id === action.payload.id );
            copy[index] = action.payload;
            return copy;

        default:
            return state;
    }

};

export default clients;
