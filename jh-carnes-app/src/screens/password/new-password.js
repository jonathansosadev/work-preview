import React from 'react';
import { Globals, axios, Alert, Colors } from '../../utils';
import { Input, Button } from '../../widgets';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Button as ButtonNative } from 'react-native-elements';
import Header from '../../navigation/header';
import Icon from 'react-native-vector-icons/Ionicons';

class NewPassword extends React.Component {

	static navigationOptions = {
		header: null
	}

	state = {
		form: {
			email: this.props.navigation.getParam('email'),
			code: this.props.navigation.getParam('code'),
			password: '',
			password_confirmation: ''
		}
	}

	submit = () => {
	  	Globals.setLoading();
	  	axios.post('password/reset',this.state.form)
	  		.then(res => {
	  			if (res.data.result) {
	  				Globals.sendNotification("Se ha cambiado su contraseña correctamente");
	  				this.props.navigation.popToTop();
	  			}
	  			else {
	  				Alert.alert(res.data.error);
	  			}
	  		})
	  		.catch(err => {
	  			Alert.showError();
	        	console.log(err);
	  		})
	  		.finally(() => {
	  			Globals.quitLoading();
	  		});
	}

	change = (e,name) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e.nativeEvent.text
			}
		});
	}

	disabled = () => {
		return this.state.form.password == '' || this.state.form.password_confirmation == '';
	}

	render() {
		return (
			<View style={ styles.container }>
				
				<Header
					style={ {
						backgroundColor: Colors.red,
						width: Dimensions.get('window').width
					} }
					title="Recuperar Contraseña"
					headerLeft={
						<ButtonNative
							type="clear"
							onPress={ () => this.props.navigation.goBack(null) }
							icon={
								<Icon name="ios-arrow-back" size={ 30 } color={ Colors.white } />
							} />
					} />

				<View style={ styles.card }>
					<Input
						placeholder="Nueva Contraseña"
						value={ this.state.form.password }
						onChange={ e => this.change(e,'password') }
						password
						label="Nueva Contraseña" />
					<Input
						placeholder="Repetir Contraseña"
						value={ this.state.form.password_confirmation }
						onChange={ e => this.change(e,'password_confirmation') }
						password
						label="Repetir Contraseña" />
					<View style={ styles.center }>
						<Button
							btnRed
							disabled={ this.disabled() }
							title="Continuar"
							onPress={ this.submit } />
					</View>					
				</View>
			</View>			
		)
	}
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 40,
		paddingHorizontal: 10
	},
	card: {
		padding: 15
	},
	center: {
		alignItems: 'center',
		marginTop: 20
	}
});


export default NewPassword;