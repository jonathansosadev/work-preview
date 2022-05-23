const shifts = (state = [], action) => {

    switch (action.type) {

        case "SET_SHIFTS":
            return action.payload;

        default:
            return state;
    }

};

export default shifts;
