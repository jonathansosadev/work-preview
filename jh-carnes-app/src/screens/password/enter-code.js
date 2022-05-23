import React from 'react';
import { Globals, axios, Alert, Colors } from '../../utils';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Input, Button } from '../../widgets';
import { Button as ButtonNative } from 'react-native-elements';
import Header from '../../navigation/header';
import Icon from 'react-native-vector-icons/Ionicons';

class EnterCode extends React.Component {

	static navigationOptions = {
		header: null
	}

	state = {
		form: {
			email: this.props.navigation.getParam('email') ? this.props.navigation.getParam('email') : '',
			code: ''
		}
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
			code: this.state.form.code.toUpperCase()
		}
		axios.post('password/code',this.state.form)
			.then(res => {
				if (res.data.result) {
					this.props.navigation.navigate('NewPassword',{
						email: this.state.form.email,
						code: this.state.form.code.toUpperCase()
					});
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

	disabled = () => {
		return this.state.form.email == '' || this.state.form.code == '';
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
						placeholder="Correo Electrónico"
						value={ this.state.form.email }
						onChange={ e => this.change(e,'email') }
						label="Correo Electrónico" />
					<Input
						placeholder="Código"
						value={ this.state.form.code }
						onChange={ e => this.change(e,'code') }
						label="Código" />
					<View style={ styles.center }>
						<Button
							btnRed
							title="Continuar"
							disabled={ this.disabled() }
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
	},
});

export default EnterCode;