import { Alert } from 'react-native';

class _Alert {

	_confirm = false;
	
	alert(message,buttons = null,options = null) {
		Alert.alert('Alerta',message,buttons,options);
	}

	showError() {
		this.alert('Se ha producido un error');
	}

	confirm = (message,callback) => {
		if (!this._confirm) {
			this._confirm = true;
			Alert.alert('Confirmar',message,[
			    {
			    	text: 'Aceptar',
			    	onPress: () => {
			    		this._confirm = false;
			    		callback();
			    	}
			    },
			    {
			    	text: 'Cancelar',
			    	onPress: () => {
			    		this._confirm = false;
			    	}
			    }
			],{ cancelable: false, onDismiss: () => {
				this._confirm = false;
			} });
		}		
	}
}

export default new _Alert();