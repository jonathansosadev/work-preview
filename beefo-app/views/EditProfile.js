import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, KeyboardAvoidingView, TextInput, Dimensions, ImageBackground, AsyncStorage, Alert, ActivityIndicator } from 'react-native';
import { Font } from 'expo';
import { Entypo } from '@expo/vector-icons';
import { ImagePicker } from 'expo';
import axios from 'axios';
import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'DrawerNav' })],
});

var {height, width} = Dimensions.get('window');

export default class Login extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			loading: true,
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
			image: null,
			nombre: '',
			numero: '',
			contrasena: '',
			alergias: '',
			userId: '',
			cambioContrasena: false,
			facebook: false
		};

	}

	componentDidMount() {
		var fuente = Font.loadAsync({
            'asap-bold': require('../assets/fonts/Asap-Bold.ttf'),
			'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
			'roboto-regular': require('../assets/fonts/Roboto-Regular.ttf'),
        });

        fuente.then( () => {
            this.setState({fontLoaded: true});
            this.setState({loading: 'true'});
            this.obtenerDatos();
        });
	}

	obtenerDatos = () => {
		var loginInfo = AsyncStorage.getItem('loginInfo');

		loginInfo.then( (loginInfo) => {
			loginInfo = JSON.parse(loginInfo)
			var cadena = '';

			axios.get(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/user/${loginInfo.userId}`).then(resp => {
				this.setState({nombre: resp.data.user.name});
				this.setState({contrasena: resp.data.user.password});
				this.setState({image: `http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/uploads/usersImages/${resp.data.user.profileImage}`});
				this.alergias = resp.data.user.allergies;
				this.setState({userId: resp.data.user._id});
				this.setState({facebook: resp.data.user.facebook});

				resp.data.user.allergies.forEach(element => {
					cadena = cadena  + element + ', ';
				});
				
				this.setState({alergias: cadena});

				if (resp.data.user.phoneNumber == 123456) {
					this.setState({numero: ''});
				} else {
					this.setState({numero: resp.data.user.phoneNumber.toString()});
				}

				this.setState({loading: false});
			}).catch((error) => {
				console.log(error);
			});
		}).catch( (error) => {
			console.log(error);
		});
	}

	guardar(){
		let cadena1 = this.state.contrasena.toString(); 

		if (cadena1.length < 6 ) {
			Alert.alert(
				'Contrasena demasiado corta',
				'La contrasena debe contener mas de 6 caracteres',
				[{text: 'OK', onPress: () => console.log('OK Pressed')}],
				{ cancelable: false }
			);
		}

		if ( cadena1.length >= 6 && this.state.cambioContrasena == true) {
			axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/update-user/${this.state.userId}`,{
				name: this.state.nombre,
				phoneNumber: this.state.numero,
				password: this.state.contrasena,
				cambioContrasena: true
			}).then(()=>{
				
				
			})
			.catch( (error) => {
				console.log(error);
			});
			this.props.navigation.dispatch(resetAction);
		}

		if ( cadena1.length >= 6 && this.state.cambioContrasena == false) {
			axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/update-user/${this.state.userId}`,{
				name: this.state.nombre,
				phoneNumber: this.state.numero,
				password: this.state.contrasena,
			}).then(()=>{
				
				
			})
			.catch( (error) => {
				console.log(error);
			});
			this.props.navigation.dispatch(resetAction);
		}
	}

	_pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			aspect: [1,1],
		});
	
		if (!result.cancelled) {
			this.setState({ image: result.uri });
			let uri = result.uri;
			let uriParts = uri.split('.');
  			let fileType = uriParts[uriParts.length - 1];
			let formData = new FormData();

			formData.append('profileImage', {
				uri,
				name: `profileImage.${fileType}`,
				type: `image/${fileType}`,
			});

			let options = {
				method: 'POST',
				body: formData,
				headers: {
				Accept: 'application/json',
				'Content-Type': 'multipart/form-data',
				},
			};
			fetch(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/upload-image/${this.state.userId}`, options);
		}
	  };

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
            if(input==4)
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: true,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
			})
            if(input==5)
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: false,
			    focusInput5: true,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
			})

	}

	render() {
		if (this.state.loading === 'true') {
            return (
              <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#447861'}}>
                  <ActivityIndicator 
                      size="large" 
                      color="rgb(250,204,49)" 
                      animating={true}
                      style={{alignSelf: 'center'}}
                  />
              </View>
            );
        }

	    return (
			<View style={styles.external}>
				<StatusBar hidden = {true}/>
				{ this.state.fontLoaded ? (
					<View style={styles.container}>
						<KeyboardAvoidingView behavior="padding">
							<ScrollView contentContainerStyle={{width:'100%', paddingHorizontal:16, paddingVertical:24}}>
								<View style={[styles.header, {height:40}]}>
									<TouchableOpacity
										onPress={() => this.props.navigation.openDrawer()}
									>
										<Entypo name="menu" size={40} color='white'/>
									</TouchableOpacity>
									<Text style={styles.textTitle}>Editer le profil</Text>
									<View style={{width: 30, height:30}}></View>
								</View>
								<View style={{justifyContent: 'center', alignItems: 'center', marginVertical: 10}}>
									<TouchableOpacity
										onPress={() => {this._pickImage()}}
									>
										<ImageBackground source={{ uri: this.state.image }} style={{height: 90, width:90}} borderRadius={50}></ImageBackground>
									</TouchableOpacity>
								</View>
								<View style={[styles.boxText, {top:126+30+20}]}>
									<Text style={this.state.focusInput1
											? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
											: styles.textTitleInput}>
										Votre nom
									</Text>
								</View>
								<TextInput
									onFocus={() => this.changeFocusInputs(1)}
									onChangeText={(nombre) => this.setState({nombre})}
									style={this.state.focusInput1
											? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
											: [styles.textInput, {width:'100%'}]}
									maxLength={50}
									underlineColorAndroid='rgb(68,120,97)'
									placeholder = {this.state.nombre}
									placeholderTextColor = 'white'
								/>
								<View style={[styles.boxText, {top:126+71+30+20}]}>
									<Text style={this.state.focusInput2
											? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
											: styles.textTitleInput}>
										Numéro de téléphone
									</Text>
								</View>
								<TextInput
									onFocus={() => this.changeFocusInputs(2)}
									onChangeText={(numero) => this.setState({numero})}
									style={this.state.focusInput2
											? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
											: [styles.textInput, {width:'100%'}]}
									maxLength={50}
									underlineColorAndroid='rgb(68,120,97)'
									keyboardType='phone-pad'
									placeholder = {this.state.numero}
									placeholderTextColor = 'white'
								/>
								<View style={[styles.boxText, {top:197+71+30+20}]}>
								<Text style={this.state.focusInput4
										? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
										: styles.textTitleInput}>
										Les allergies
									</Text>
								</View>
								{ !this.state.facebook ? (
									<View style={[styles.boxText, {top:268+71+30+20}]}>
										<Text style={this.state.focusInput3
												? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
												: styles.textTitleInput}>
											Mot de passe
										</Text>
									</View>
								) : null}
								<View style={styles.boxTwoInput}>
									<TextInput
										onFocus={() => this.changeFocusInputs(4)}
										style={this.state.focusInput4
											? [styles.textInput, {width:'48%', borderColor:'rgb(243,165,51)'}]
											: [styles.textInput, {width:'48%'}]}
										maxLength={20}
										underlineColorAndroid='rgb(68,120,97)'
										placeholder = {this.state.alergias}
										placeholderTextColor = 'white'
									/>
									<TouchableOpacity style={styles.buttonChange} onPress={()=>{this.props.navigation.navigate('EditAllergy')}

									}>
											<Text style={{fontFamily: 'poppins-bold', fontSize: 20, color: 'white'}}>Modifier</Text>
									</TouchableOpacity>
								</View>
								{ !this.state.facebook ? (
									<View style={styles.boxTwoInput}>
										<TextInput
										onFocus={() => this.changeFocusInputs(3)}
										onChangeText={(contrasena) => {
											this.setState({contrasena});
											this.setState({cambioContrasena: true});
										}}
											style={this.state.focusInput3
												? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
												: [styles.textInput, {width:'100%'}]}
											maxLength={20}
										underlineColorAndroid='rgb(68,120,97)'
										secureTextEntry = {true}
										textContentType= 'password'
										placeholder = '**********'
										placeholderTextColor = 'white'
										/>
									</View>
								) : null}
								<View style={styles.boxTwoInput}>
									<TouchableOpacity 
										style={styles.buttonChange2}
										onPress = { () => {this.guardar()}}
										>
											<Text style={{fontFamily: 'poppins-bold', fontSize: 20, color: 'white'}}>SAUVEGARDER</Text>
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
	buttonChange: {
		height: 51,
		width:'48%',
		backgroundColor: 'rgb(250,204,49)',
		borderRadius: 6,
		borderColor: 'rgb(250,204,49)',
		borderWidth: 2,
		marginVertical: 10,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 7,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.4,
		shadowRadius: 5,
	},
	buttonChange2: {
		height: 51,
		width:'100%',
		backgroundColor: 'rgb(214,186,140)',
		borderRadius: 6,
		borderColor: 'rgb(214,186,140)',
		borderWidth: 2,
		marginVertical: 10,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 7,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.4,
		shadowRadius: 5,
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
