const categories = (state = null, action) => {
    if (action.type === 'SET_CATEGORIES') {
        return action.payload;
    }
    return state;
};

export default categories;
