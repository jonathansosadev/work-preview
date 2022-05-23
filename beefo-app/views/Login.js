import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, KeyboardAvoidingView, TextInput, Dimensions, Image, Alert, AsyncStorage } from 'react-native';
import { Font } from 'expo';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import Expo from 'expo';
import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'DrawerNav' })],
});

var {height, width} = Dimensions.get('window');
const apiHost = 'http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1';

//ID para Facebook
const idFacebook = "2454767111231695";

export default class Login extends React.Component {
	state = {
		loading: false,
	    fontLoaded: false,
	    country: null,
	    state: null,
	    focusInput1: false,
	    focusInput2: false,
	    focusInput3: false,
	    focusInput4: false,
	    focusInput5: false,
	    focusInput6: false,
	    focusInput7: false,
	    focusInput8: false,
	    pickerCountry: false,
		pickerState: false,
		correo: '',
		contrasena: '',
		userId: ''
	};

	componentWillMount() {
		try {
			const loginInfo = AsyncStorage.getItem('loginInfo');
			
            loginInfo.then( (loginInfo) => {
				var cadena =  JSON.parse(loginInfo);

				//console.log(cadena);
				
				if(cadena == null ){
					// this.setState({ userId: cadena.userId})
					var fuente = Font.loadAsync({
						'asap-bold': require('../assets/fonts/Asap-Bold.ttf'),
	      				'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
	      				'roboto-regular': require('../assets/fonts/Roboto-Regular.ttf'),
					});

					fuente.then(()=>{
						this.setState({ fontLoaded: true });
					});
				} else {
					if (cadena.login == false) {
						this.setState({ userId: cadena.userId})
						var fuente = Font.loadAsync({
							'asap-bold': require('../assets/fonts/Asap-Bold.ttf'),
							'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
							'roboto-regular': require('../assets/fonts/Roboto-Regular.ttf'),
						});

						fuente.then(()=>{
							this.setState({ fontLoaded: true });
						});
						
					} else {
						if (cadena.login == true) {
							this.props.navigation.dispatch(resetAction);
						}
					}
				}
            }).catch( (error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error)
        }

	   
	    
	}

	onLoginUserEmail = () => {
		axios.post('http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/login-email',{
			email: this.state.correo,
			password: this.state.contrasena,
		})
			.then(resp => {
				if (resp.data.login == true) {
					try{
						AsyncStorage.setItem('loginInfo', JSON.stringify({userId: resp.data.userId, login: true}));
			  		}catch (error) {
						console.log('Error al guardar en el storage');
					}


					if (this.state.userId == 'algo') {


						this.props.navigation.navigate('DrawerNav');

					}  else {
						this.props.navigation.navigate('Main');
					}
					
					
				}else{
					Alert.alert(
						'Début de session incorrect',
						resp.data.message,
						[{text: 'OK', onPress: () => console.log('OK Pressed')}],
						{ cancelable: false }
					);
				}
			});
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
			  			name: json.name,
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

						if (this.state.userId == 'algo') {


							this.props.navigation.navigate('DrawerNav');
	
						}  else {
							this.props.navigation.navigate('Main');
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

	changeFocusInputs(input){
		if(input==1)
			this.setState({
				focusInput1: true,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: false,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
			})
		if(input==2)
			this.setState({
				focusInput1: false,
				focusInput2: true,
			    focusInput3: false,
			    focusInput4: false,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
			})
		if(input==3)
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: true,
			    focusInput4: false,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
			})
	}

	render() {
	    return (
	      <View style={styles.external}>
	      	<StatusBar hidden = {true}/>
		      { this.state.fontLoaded ? (
		      	<View style={styles.container}>
		      		<KeyboardAvoidingView behavior="padding">
		      			<ScrollView contentContainerStyle={{width:'100%', paddingHorizontal:16, paddingVertical:24, justifyContent: 'center', alignItems: 'center'}}>
					      	<View style={{justifyContent: 'center', alignItems: 'center', height: 32}}>
					      		<Text style={{justifyContent: 'center', alignItems: 'center', fontFamily: 'asap-bold', fontSize: 28, color: 'rgb(214,186,140)'}}>s'identifier</Text>
					      	</View>
							  <View style={{height: 16}}></View>
							  <Image source={require('../assets/images/logoLogin.png')} style={{height: 100, width: 100, justifyContent: 'center', alignItems: 'center'}}></Image>
							  <View style={{height: 16}}></View>
							  <View style={[styles.boxText, {top:189}]}>
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
				      		<View style={[styles.boxText, {top:189+71}]}>
			                    <Text style={this.state.focusInput2
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	mot de passe</Text>
                  			</View>
				           	<TextInput
								   onFocus={() => this.changeFocusInputs(2)}
								   onChangeText={(contrasena) => this.setState({contrasena})}
				           		style={this.state.focusInput2
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
				           				: [styles.textInput, {width:'100%'}]}
				           		maxLength={50}
								   underlineColorAndroid='rgb(68,120,97)'
								   secureTextEntry
				           	/>
				      		<View style={[styles.boxText, {top:190+151, left:'50%'}]}>
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
					      			onPress={() => this.onLoginUserEmail()}>
					      			<Text style={{color: 'white', fontSize: 20, fontFamily: 'poppins-bold'}}>S'identifier</Text>
								</TouchableOpacity>
								
								<View style={{height: 25}}></View>
								<TouchableOpacity style={{flexDirection: 'row', borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowOffset: {height: 4, width: -2,}}}
					      			onPress={() => this.props.navigation.navigate('Restore')}>
					      			<Text style={{color: 'rgb(243,165,51)', fontSize: 17}}>Mot de passe oublié?</Text>
								</TouchableOpacity>

								<View style={{height: 25}}></View>
								<View style={{flexDirection: 'row', borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowOffset: {height: 4, width: -2,}}}>
					      			
					      			<Text style={{color: 'white', fontSize: 17}}>Vous n'avez pas de compte? </Text>
									  	<TouchableOpacity onPress={() => this.props.navigation.navigate('Signup')}>
									  		<Text style={{color: 'rgb(243,165,51)', fontSize: 17}}>S'inscrire!</Text>
										</TouchableOpacity>
								</View>
							   
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
