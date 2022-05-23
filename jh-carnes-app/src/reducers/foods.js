const foods = (state = [], action) => {

    switch (action.type) {

        case "SET_FOODS":
            return action.payload;

        case 'UPDATE_FOODS':
            const copy = [...state];
            const index = copy.findIndex( item => item.id === action.payload.id );
            copy[index] = action.payload;
            return copy;

        default:
            return state;
    }

};

export default foods;
