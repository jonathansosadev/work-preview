import axios from 'axios';
import ENV from './env';
import Upload from 'react-native-background-upload';
import { Platform } from 'react-native';

let _axios = axios.create({
  baseURL: ENV.BASE_API
});

_axios.all = axios.all;
_axios.spread = axios.spread;

_axios.upload = (url,file,data = {}) => {
	return new Promise((resolve,reject) => {
		
		Object.keys(data).forEach(i => {
			if (typeof data[i] === 'number') {
				data[i] = data[i].toString();
			}
			if (data[i] === null || data[i] === undefined) {
				data[i] = '';
			}
		});

		let notification = {
			enabled: false
		}

		if (Platform.OS == 'android') {
			notification = {
	            enabled: true,
	            onProgressTitle: "Archivo",
	            onProgressMessage: "Enviando...",
	            onCompleteTitle: "Archivo",
	            onCompleteMessage: "Listo",
	            onErrorTitle: "Archivo",
	            onErrorMessage: "Se ha producido un error",
	            autoClear: true,
	            enableRingTone: false
			}
		}

		const options = {
		  url: ENV.BASE_API + url,
		  path: Platform.OS == 'android' ? file.replace('file://','') : file,
		  method: 'POST',
		  parameters: data,
		  field: 'file',
		  headers: {
            'Accept': 'application/json',
            'content-type': 'multipart/form-data'
	      },
	      type: 'multipart',
	      notification: notification
		}

		Upload.startUpload(options).then(id => {
			Upload.addListener('completed', id, data => {
				resolve({
					data: JSON.parse(data.responseBody)
				});
			});
			Upload.addListener('error',id,err => {
			    reject(err);
			});
		}).catch(err => reject(err));
	});	
}

export default _axios;