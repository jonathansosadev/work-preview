const auditPoints =(state=[], action) =>{
    switch (action.type) {

        case "SET_AUDIT":
            return action.payload;

        case "UPDATE_AUDIT":
            const copy = [...state];
            const index = copy.findIndex( item => item.id === action.payload.id );
            copy[index] = action.payload;
            return copy;

        default:
            return state;
    }
};
export default auditPoints;