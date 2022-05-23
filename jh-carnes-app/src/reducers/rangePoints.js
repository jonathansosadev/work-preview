const rangePoints = (state = [], action) => {

    switch (action.type) {

        case "SET_RANGE_POINTS":
            return action.payload;

        default:
            return state;
    }

};

export default rangePoints;
