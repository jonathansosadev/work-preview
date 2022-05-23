import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, KeyboardAvoidingView, TextInput, Picker, Dimensions, Image, Alert } from 'react-native';
import { Font } from 'expo';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { MaterialDialog } from 'react-native-material-dialog';
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
		codigo: ''
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

	sendCode(){
		//console.log(this.props.navigation.getParam('correoEnviado'));
		axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/code-validation`,{
			message: 'apple-pen',
			code: this.state.codigo
		})
			.then(resp => {
				if (resp.data.error == "codigo no encontrado" ) {
						Alert.alert(
							'Code incorrect',
							'Vérifiez le code envoyé à votre email',
							[{text: 'OK', onPress: () => console.log('OK Pressed')}],
							{ cancelable: false }
						);
				} else {
					this.props.navigation.navigate('Restore3',{correoEnviado:this.props.navigation.getParam('correoEnviado')});
				}
			});
	}

	render() {
		const correoEnviado = this.state.correoEnviado;
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
                              <View style={{height: 200, width: '100%'}}>
                              <Text style={{color: 'white', fontSize: 20, fontFamily: 'poppins-regular'}}>
								Je vous remercie! Veuillez patienter pour recevoir un e-mail avec les instructions pour restaurer votre mot de passe..veuillez entrer le code envoyé à votre adresse email pour réinitialiser votre mot de passe
							</Text>
							</View>
                              <View style={{height: 25}}></View>
							  <View style={[styles.boxText, {top:190+37+80}]}>
			                    <Text style={this.state.focusInput1
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	Code de validation</Text>
                  			</View>
							  <TextInput
								onFocus={() => this.changeFocusInputs(1)}
								onChangeText={(codigo) => this.setState({codigo})}
				           		style={this.state.focusInput1
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
				           				: [styles.textInput, {width:'100%'}]}
								underlineColorAndroid='rgb(68,120,97)'
								keyboardType= {'phone-pad'}
								maxLength={6}
				           	/>
                               <View style={{height: 25}}></View>
							   <TouchableOpacity style={{flexDirection: 'row', backgroundColor: 'rgb(214,186,140)', width: '96%', height: 60, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.3, shadowOffset: {height: 4, width: -2,}, elevation: 7,}}
					      			onPress={() => this.sendCode()}>
					      			<Text style={{color: 'white', fontSize: 20, fontFamily: 'poppins-bold'}}>Continuer</Text>
								</TouchableOpacity>
						</ScrollView>
			      	</KeyboardAvoidingView>

			      	<MaterialDialog
			            visible={this.state.pickerCountry}
			            onCancel={() => {this.setState({ pickerCountry: false })}}
			            backgroundColor= 'white'
			            scrolled>
			            	<TouchableOpacity
			            		style={{justifyContent: 'center', marginBottom:20}}
			            		onPress={() => {this.setState({pickerCountry: false, country: "country"})}}>
					            <Text style={[styles.textTitleInput, {fontSize:16, color:'rgb(243,165,51)'}]}>
					            	Pays
					            </Text>
					        </TouchableOpacity>
			        </MaterialDialog>

			        <MaterialDialog
			            visible={this.state.pickerState}
			            onCancel={() => {this.setState({ pickerState: false })}}
			            backgroundColor= 'white'
			            scrolled>
			            	<TouchableOpacity
			            		style={{justifyContent: 'center', marginBottom:20}}
			            		onPress={() => {this.setState({pickerState: false, state: "state"})}}>
					            <Text style={[styles.textTitleInput, {fontSize:16, color:'rgb(243,165,51)'}]}>
					            	etat
					            </Text>
					        </TouchableOpacity>
			        </MaterialDialog>
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
