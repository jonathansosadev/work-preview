const loading = (state = false, action) => {
	switch(action.type) {
		case 'SET_LOADING':  
            return true;
            break;
        case 'QUIT_LOADING':
            return false;
            break;
        default: 
        	return state;
        	break;
	}
}

export default loading;