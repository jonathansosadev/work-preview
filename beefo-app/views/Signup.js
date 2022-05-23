import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, KeyboardAvoidingView, TextInput, Picker, Dimensions, Image, Alert, AsyncStorage } from 'react-native';
import { Font } from 'expo';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { MaterialDialog } from 'react-native-material-dialog';
import axios from 'axios';
import Expo from 'expo';

var {height, width} = Dimensions.get('window');
//mover url a archivo config.js y hacer llamado global
const apiHost = 'http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1';

//ID para Facebook
const idFacebook = "2454767111231695";

export default class Signup extends React.Component {
	state = {
	    fontLoaded: false,
	    country: null,
	    state: null,
	    focusInput1: false,
	    focusInput2: false,
	    focusInput3: false,
		focusInput4: false,
		correo: 'a',
		numero: '',
		contrasena: 'a',
		reContrasena: 'a',
		verificado: true,
	};

	onUserSave = () => {
		axios.post('http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/save-user',{
			email: this.state.correo,
			phoneNumber: this.state.numero,
			password: this.state.contrasena,
			confirmed_password: this.state.reContrasena,
		})
			.then(this.props.navigation.navigate('Login'));

	}

	async componentWillMount() {
	    await Font.loadAsync({
	      'asap-bold': require('../assets/fonts/Asap-Bold.ttf'),
	      'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
	      'roboto-regular': require('../assets/fonts/Roboto-Regular.ttf'),
		});
	    this.setState({ fontLoaded: true });
	}

	changeFocusInputs(input){
		if(input==1)
			this.setState({
				focusInput1: true,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: false,
			})
		if(input==2)
			this.setState({
				focusInput1: false,
				focusInput2: true,
			    focusInput3: false,
			    focusInput4: false,
			})
		if(input==3)
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: true,
			    focusInput4: false,
            })
        if(input==4)
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: true,
			})
	}

	validacion(){
		emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
		let cadena1 = this.state.contrasena.toString(); 
		let cadena2 = this.state.reContrasena.toString(); 

		if (!emailRegex.test(this.state.correo)) {
			this.setState({verificado: false});
			Alert.alert(
				'Format de courrier électronique invalide',
				'Exemple: correo@dominio.com',
				[{text: 'OK', onPress: () => console.log('OK Pressed')}],
				{ cancelable: false }
			);
		}

		if (cadena1.length < 6 ) {
			this.setState({verificado: false});
			Alert.alert(
				'Mot de passe trop court',
				'Le mot de passe doit contenir au moins 6 caractères',
				[{text: 'OK', onPress: () => console.log('OK Pressed')}],
				{ cancelable: false }
			);
		}

		if (cadena1 != cadena2 ) {
			this.setState({verificado: false});
			Alert.alert(
				'Erreur de vérification du mot de passe',
				'Le mot de passe et sa vérification ne correspondent pas',
				[{text: 'OK', onPress: () => console.log('OK Pressed')}],
				{ cancelable: false }
			);
		}

		if ( emailRegex.test(this.state.correo) && cadena1 == cadena2 && cadena1.length >= 6) {
			this.onUserSave();
		}

		return this.state.verificado;
	}

	loginFacebook = async() =>{
		const {type, token} = await Expo.Facebook.logInWithReadPermissionsAsync(idFacebook, {permissions: ['public_profile','email','user_friends']});
			if (type === 'success'){
		  		const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,about,picture`);
		  		const json = await response.json();
		  		fetch('http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/login-facebook', {
					method: 'POST',
					headers: {
			  			Accept: 'application/json',
			  			'Content-Type': 'application/json',
					},
					body: JSON.stringify({
			  			name: json.name.toLowerCase(),
			  			email: json.email.toLowerCase(),
			  			picture: json.picture.data.url,
			  			token: token,
			  			id: json.id
					}),
		  		}).then((response) => response.json())
			  		.then((responseJson) => {
						try{
							AsyncStorage.setItem('loginInfo', JSON.stringify({userId: responseJson.userId, login: true}));
						  }catch (error) {
							console.log('Error al guardar en el storage');
						}	
			  		})
			  		.catch((error) => {
						console.log(error);
			  		});
			  		this.props.navigation.navigate('Main');
		}else{
		  alert(type);
		}
	}

	render() {
	  	const { activeSections } = this.state;

	    return (
	      <View style={styles.external}>
	      	<StatusBar hidden = {true}/>
		      { this.state.fontLoaded ? (
		      	<View style={styles.container}>
		      		<KeyboardAvoidingView behavior="padding">
		      			<ScrollView contentContainerStyle={{width:'100%', paddingHorizontal:16, paddingVertical:24, justifyContent: 'center', alignItems: 'center'}}>
					      	<View style={{justifyContent: 'center', alignItems: 'center', height: 32}}>
					      		<Text style={{justifyContent: 'center', alignItems: 'center', fontFamily: 'asap-bold', fontSize: 28, color: 'rgb(214,186,140)'}}>S'inscrire</Text>
					      	</View>
							  <View style={{height: 16}}></View>
							  <Image source={require('../assets/images/logoLogin.png')} style={{height: 100, width: 100, justifyContent: 'center', alignItems: 'center'}}></Image>
							  <View style={{height: 16}}></View>
							  <View style={[styles.boxText, {top:190}]}>
			                    <Text style={this.state.focusInput1
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	Email</Text>
                  			</View>
				           	<TextInput
								onFocus={() => this.changeFocusInputs(1)}
								onChangeText={(correo) => this.setState({correo})}
				           		style={this.state.focusInput1
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
				           				: [styles.textInput, {width:'100%'}]}
				           		maxLength={50}
								underlineColorAndroid='rgb(68,120,97)'
								keyboardType= {'email-address'}
				           	/>
				      		<View style={[styles.boxText, {top:190+71}]}>
			                    <Text style={this.state.focusInput2
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	Numero de téléphone</Text>
                  			</View>
				           	<TextInput
								onFocus={() => this.changeFocusInputs(2)}
								onChangeText={(numero) => this.setState({numero})}
				           		style={this.state.focusInput2
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
				           				: [styles.textInput, {width:'100%'}]}
								maxLength={50}
								keyboardType= {'phone-pad'}
				           		underlineColorAndroid='rgb(68,120,97)'
				           	/>
				      		<View style={[styles.boxText, {top:190+71+71}]}>
			                    <Text style={this.state.focusInput3
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	mot de passe</Text>
                  			</View>
				           	<TextInput
								onFocus={() => this.changeFocusInputs(3)}
								onChangeText={(contrasena) => this.setState({contrasena})}
				           		style={this.state.focusInput3
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
				           				: [styles.textInput, {width:'100%'}]}
				           		maxLength={50}
                                underlineColorAndroid='rgb(68,120,97)'
								secureTextEntry
				           	/>
				      		<View style={[styles.boxText, {top:190+71+71+71}]}>
			                    <Text style={this.state.focusInput4
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	Retaper le mot de passe</Text>
                  			</View>
				           	<TextInput
								onFocus={() => this.changeFocusInputs(4)}
								onChangeText={(reContrasena) => this.setState({reContrasena})}
				           		style={this.state.focusInput4
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
				           				: [styles.textInput, {width:'100%'}]}
				           		maxLength={50}
                                underlineColorAndroid='rgb(68,120,97)'
                                secureTextEntry
				           	/>
				      		<View style={[styles.boxText, {top:190+151+100+42, left:'50%'}]}>
			                    <Text style={this.state.focusInput7
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	ou</Text>
                  			</View>
							   <View style={{borderBottomWidth:1, borderBottomColor: 'white', width: '100%', height: 20}}></View>
							   <View style={{height: 25}}></View>
							   <TouchableOpacity style={{flexDirection: 'row', backgroundColor: 'rgb(59,89,152)', width: '96%', height: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowOffset: {height: 4, width: -2,}, elevation: 7,}}
					      			onPress={() => this.loginFacebook()}>
									  <FontAwesome name="facebook" size={41} color="white" style={{marginRight:10}}/>
					      			<Text style={{color: 'white', fontSize: 20, fontFamily: 'poppins-bold'}}>Continuer avec Facebook</Text>
								</TouchableOpacity>
								<View style={{height: 25}}></View>
							   	<TouchableOpacity style={{flexDirection: 'row', backgroundColor: 'rgb(214,186,140)', width: '96%', height: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowOffset: {height: 4, width: -2,}, elevation: 7,}}
									  onPress={() => 
										{let verificacion = this.validacion();}
									  }>
					      			<Text style={{color: 'white', fontSize: 20, fontFamily: 'poppins-bold'}}>S'inscrire</Text>
								</TouchableOpacity>
						</ScrollView>
			      	</KeyboardAvoidingView>
		      	</View>
		      ) : null }
	      </View>
	    );
	}
}

const styles = StyleSheet.create({
	external: {
		flex: 1,
		justifyContent: 'center',
	},
	container: {
	    flex: 1,
	    justifyContent: 'space-between',
		backgroundColor: 'rgb(68,120,97)',
	},
  	header: {
	  	flexDirection: 'row',
	    justifyContent: 'space-between',
	    alignItems: 'center',
	    width: '100%',
	    paddingHorizontal: 8,
  	},
  	textTitle: {
	  	color: 'rgb(214,186,140)',
	  	fontFamily: 'asap-bold',
	  	fontSize: 28,
  	},
  	textBody: {
  		color: 'white',
  		fontSize: 20,
  		fontFamily: 'poppins-bold',
  		textAlign: 'center',
  	},
  	button: {
  		width: '48%',
  		height: 60,
  		borderRadius: 8,
  		justifyContent: 'center',
  		alignItems: 'center',
  		shadowOpacity: 0.3,
	    shadowOffset: {
	        height: 4,
	        width: -2,
	    },
	    elevation: 7,
  	},
  	textInput: {
	    height: 51,
	    borderRadius: 6,
	    fontSize: 16,
	    fontFamily:'roboto-regular',
	    borderColor: 'white',
	    borderWidth: 2,
	    paddingLeft: 10,
	    marginVertical: 10,
	    color: 'white',
  },
	boxTwoInput: {
	  	flexDirection:'row',
	  	width:'100%',
	  	justifyContent:'space-between',
	  	height: 71,
	},
	picker: {
		height: 51,
		width: '100%',
		borderRadius: 6,
	    borderColor: 'white',
	    borderWidth: 2,
	    marginVertical: 10,
	    justifyContent: 'space-between',
	    alignItems: 'center',
	    flexDirection: 'row',
	    paddingHorizontal: 10,
	},
	boxText: {
		position:'absolute',
		zIndex:9,
		left:25,
		paddingHorizontal:5,
		backgroundColor: 'rgb(68,120,97)',
		height: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textTitleInput: {
		color:'white',
		fontSize:10,
		fontFamily: 'roboto-regular',
	}
});
