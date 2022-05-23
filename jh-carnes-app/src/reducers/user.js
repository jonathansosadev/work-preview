const user = (state = null, action) => {
	switch(action.type) {
		case 'SET_USER':
            return action.payload;
            break;
        case 'REMOVE_USER':
            return null;
            break;
        default: 
        	return state;
        	break;
	}
}

export default user;