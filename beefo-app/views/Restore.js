import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, KeyboardAvoidingView, TextInput, Picker, Dimensions, Image,  Alert } from 'react-native';
import { Font } from 'expo';
import axios from 'axios';

var {height, width} = Dimensions.get('window');

export default class Login extends React.Component {
	state = {
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
		correo: ''
	};

	async componentWillMount() {		
	    await Font.loadAsync({
	      'asap-bold': require('../assets/fonts/Asap-Bold.ttf'),
          'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
          'poppins-regular': require('../assets/fonts/Poppins-Regular.ttf'),
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

	enviarCorreo = () => {
		//console.log(`http://192.168.0.115:3000/api/v1/passwordReset/${this.state.correo}`);
		axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/passwordReset/${this.state.correo}`,{
			message: 'apple-pen',
		})
			.then(resp => {
				if (resp.data.error == "usuario no encontrado" ) {
						Alert.alert(
							'Courrier invalide',
							`L'email n'est pas enregistré`,
							[{text: 'OK', onPress: () => console.log('OK Pressed')}],
							{ cancelable: false }
						);
				} else {
					this.props.navigation.navigate('Restore2', {correoEnviado:this.state.correo});
				}
			});
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
					      		<Text style={{justifyContent: 'center', alignItems: 'center', fontFamily: 'asap-bold', fontSize: 28, color: 'rgb(214,186,140)'}}>
									Restaurer le mot de passe
								</Text>
					      	</View>
							  	<View style={{height: 25}}></View>
                              	<View style={{height: 120, width: '100%'}}>
									<Text style={{color: 'white', fontSize: 20, fontFamily: 'poppins-regular'}}>
										Entrez l'email que vous avez enregistré sur BeFoo pour recevoir des instructions sur la réinitialisation de votre mot de passe
									</Text>
                              	</View>
                              	<View style={{height: 25}}></View>
				      			<View style={[styles.boxText, {top:190+37}]}>
									<Text style={this.state.focusInput1
											? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
											: styles.textTitleInput}>
										Email
									</Text>
                  				</View>
								<TextInput
									onFocus={() => this.changeFocusInputs(1)}
									onChangeText={(correo) => this.setState({correo})}
									style={this.state.focusInput1
											? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
											: [styles.textInput, {width:'100%'}]}
									maxLength={50}
									underlineColorAndroid='rgb(68,120,97)'
								/>
                               <View style={{height: 25}}></View>
							   <TouchableOpacity style={{flexDirection: 'row', backgroundColor: 'rgb(214,186,140)', width: '96%', height: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowOffset: {height: 4, width: -2,}, elevation: 7,}}
					      			onPress={() => this.enviarCorreo()}>
					      			<Text style={{color: 'white', fontSize: 20, fontFamily: 'poppins-bold'}}>Envoyer</Text>
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
