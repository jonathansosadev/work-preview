import Permissions from 'react-native-permissions';

class PermissionController {

	async check(permission) {
		const response = await Permissions.check(permission);
        return response === 'authorized'
	}

	async request(permission) {
		const response = await Permissions.request(permission);
		return response === 'authorized';
	}

    async register(permission) {

	    for (let i=0; i<permission.length; i++) {
	        const granted = await Permissions.request(permission[i]);
	        if (granted!=='authorized') return false;
        }
	    return true;

        // const response = await Permissions.request(permission[0]);
        // if (response === 'authorized') {
        //     const response2 = await Permissions.request(permission[1]);
        //     return response==='authorized';
        // }
        // return false;
    }

}

export default new PermissionController();
