import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Input, Button } from '../../widgets';
import { Globals, axios, Colors, Alert } from '../../utils';
import { Button as ButtonNative } from 'react-native-elements';
import Header from '../../navigation/header';
import Icon from 'react-native-vector-icons/Ionicons';

class Reset extends React.Component {

	static navigationOptions = {
		header: null
	}

	state = {
		form: {
			email: ''
		}
	}

	disabled = () => {
		const { email } = this.state.form;
		return email == '';
	}

	change = (e,name) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: e.nativeEvent.text
			}
		});
	}

	submit = () => {
		Globals.setLoading();
		let data = {
			email: this.state.form.email,
			code: Globals.generatePassword()
		}
		axios.post('password/recover',data)
			.then(res => {
				if (res.data.result) {
					Globals.sendNotification("Se le ha enviado un correo electrónico");
					this.setState({
						form: {
							email: ''
						}
					});
					this.enterCode(data.email);
				}
				else {
					Alert.alert(res.data.error);
				}
			})
			.catch(err => {
				console.log(err);
				Alert.showError();
			})
			.finally(() => {
				Globals.quitLoading();
			});
	}

	enterCode = (email = null) => {
		this.props.navigation.navigate('EnterCode',{
			email: email
		});
	}
		
	render() {
		return (
			<View style={ styles.container }>
				<Header
					style={ {
						backgroundColor: Colors.red,
						width: Dimensions.get('window').width
					} }
					title="Mi Perfil"
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
						placeholder="Ingrese su correo eléctrónico"
						label="Correo Electrónico"
						value={ this.state.form.email }
						onChange={ e => this.change(e,'email') } />
					<View style={ styles.center }>
						<Button
							btnRed
							onPress={ this.submit }
							disabled={ this.disabled() }
							title="Continuar" />
					</View>
					<TouchableOpacity onPress={ this.enterCode }>
						<Text style={ styles.text }>¿Ya tienes un código? Haz click aquí para recuperar tu contraseña</Text>
					</TouchableOpacity>
				</View>
			</View>			
		)
	}
}

const styles = StyleSheet.create({
	center: {
		textAlign: 'center'
	},
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
	},
	text: {
		textAlign: 'center',
		color: Colors.red,
		marginVertical: 10
	},
});


export default Reset;