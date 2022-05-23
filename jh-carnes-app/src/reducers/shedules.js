const schedules = (state = [], action) => {

    switch (action.type) {

        case "SET_SCHEDULES":
            return action.payload;

        default:
            return state;
    }

};

export default schedules;
