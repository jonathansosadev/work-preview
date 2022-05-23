import React from 'react';
import { ActivityIndicator, StyleSheet, Modal, Text, View, TouchableOpacity, StatusBar, ScrollView, KeyboardAvoidingView, TextInput, Alert, Dimensions, AsyncStorage } from 'react-native';
import { Font } from 'expo';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { MaterialDialog } from 'react-native-material-dialog';
import { StackActions, NavigationActions } from 'react-navigation';
import axios from 'axios';

var stripe = require('stripe-client')('pk_live_8tb1xtW8vK4r6lTkt6uEMS1U');
//pk_test_AjxlCIHLt2XXZvhYrU7PoTEd
//pk_live_8tb1xtW8vK4r6lTkt6uEMS1U

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'DrawerNav' })],
});

var {height, width} = Dimensions.get('window');

export default class Login extends React.Component {
	state = {
		userId:'',
		fontLoaded: false,
		address: '',
		name: '',
		lastname: '',
		pais: 'Pays',
		estado: 'Etat',
	    focusInput1: false,
	    focusInput2: false,
	    focusInput3: false,
	    focusInput4: false,
	    focusInput5: false,
	    focusInput6: false,
	    focusInput7: false,
		focusInput8: false,
		focusCard: false,
		focusMM: false,
		focusAA: false,
		focusCVC: false,
	    pickerCountry: false,
		pickerState: false,
		precio: 0.00,
		cardNumber:'',
		MMNumber:'',
		AANumber:'',
		CVCNumber:'',

		modalVisible:false,
		verificado: false,
	};

	componentDidMount() {
    
        var fuente = Font.loadAsync({
            'asap-bold': require('../assets/fonts/Asap-Bold.ttf'),
            'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
            'roboto-regular': require('../assets/fonts/Poppins-Regular.ttf'),
        });

        fuente.then((fuente)=>{

            this.setState({ fontLoaded: true });

            var precioTotal = AsyncStorage.getItem('platosYPrecioTotal');
            precioTotal.then((precioTotal) => {

				aux = JSON.parse(precioTotal);

				
                this.setState({ precio: aux.precio_total.toFixed(2) });
            }).catch( (error) => {
				console.log(error)
			});


        }).catch( (error) => {
			console.log(error)
		});
        
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
				focusCard: false,
				focusMM : false,
				focusAA: false,
				focusCVC: false,
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
				focusCard: false,
				focusMM : false,
				focusAA: false,
				focusCVC: false,
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
				focusCard: false,
				focusMM : false,
				focusAA: false,
				focusCVC: false,
			})
		if(input==4){
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: false,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
				focusCard: true,
				focusMM : false,
				focusAA: false,
				focusCVC: false,
			})
		}

		if(input==5){
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: false,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
				focusCard: false,
				focusMM : true,
				focusAA: false,
				focusCVC: false,
			})
		}

		if(input==6){
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: false,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
				focusCard: false,
				focusMM : false,
				focusAA: true,
				focusCVC: false,
			})
		}

		if(input==7){
			this.setState({
				focusInput1: false,
				focusInput2: false,
			    focusInput3: false,
			    focusInput4: false,
			    focusInput5: false,
			    focusInput6: false,
			    focusInput7: false,
			    focusInput8: false,
				focusCard: false,
				focusMM : false,
				focusAA: false,
				focusCVC: true,
			})
		}
	}

	validacion(){
		
		let cadena1 = this.state.address.toString(); 
		let cadena2 = this.state.name.toString(); 
		let cadena3 = this.state.lastname.toString(); 
		let cadena4 = this.state.pais.toString(); 
		let cadena5 = this.state.estado.toString();
		let cadena6 = this.state.cardNumber.toString();
		let cadena7 = this.state.MMNumber.toString();
		let cadena8 = this.state.AANumber.toString();
		let cadena9 = this.state.CVCNumber.toString();

		if (cadena1 == '') {
			this.setState({verificado: false});
			Alert.alert(
				`Erreur de vérification d'adresse`,
				`S'il vous plaît écrivez votre adresse à nouveau`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena2 == '') {
			this.setState({verificado: false});
			Alert.alert(
				'Erreur de vérification du nom',
				`S'il vous plaît écrivez votre nom à nouveau`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena3 == '') {
			this.setState({verificado: false});
			Alert.alert(
				`Erreur de vérification du nom de famille.`,
				`S'il vous plaît écrivez votre nom de famille`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena4 == 'Pays') {
			this.setState({verificado: false});
			Alert.alert(
				'Erreur de sélection du pays.',
				`S'il vous plaît choisir un pays`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena5 == 'Etat') {
			this.setState({verificado: false});
			Alert.alert(
				`Erreur de sélection d'état.`,
				`Veuillez choisir un état`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena6.length != 16) {
			this.setState({verificado: false});
			Alert.alert(
				`Erreur de carte de crédit.`,
				`La carte de crédit doit contenir 16 caractères.`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena7.length !=2) {
			this.setState({verificado: false});
			Alert.alert(
				`Erreur du mois d'expiration.`,
				`Le mois d'expiration doit contenir 2 caractères.`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena8.length != 4) {
			this.setState({verificado: false});
			Alert.alert(
				`Erreur d’année d’expiration.`,
				`L'année d'expiration doit contenir 4 caractères.`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if (cadena9.length !=3) {
			this.setState({verificado: false});
			Alert.alert(
				`Erreur CVC`,
				`Le CVC doit contenir 3 caractères.`,
				[{text: 'OK'}],
				{ cancelable: false }
			);
		}

		if ( cadena1 !='' &&  cadena2 !='' &&  cadena3 !='' &&  cadena4 !='Pays' &&  cadena5 !='Etat' && cadena6.length == 16 && cadena7.length == 2 && cadena8.length == 4 && cadena9.length == 3) {
			this.onPayment();
		}

		return this.state.verificado;
	}

	onPayment() {

		this.setState({modalVisible:true});


		var information = {
		  card: {
			number: this.state.cardNumber,
			exp_month: this.state.MMNumber,
			exp_year: this.state.AANumber,
			cvc: this.state.CVCNumber,
		  }
		}

		const loginInfo = AsyncStorage.getItem('loginInfo');
		
			
		loginInfo.then( (loginInfo) => {

			var cadena =  JSON.parse(loginInfo);

			this.setState({ userId: cadena.userId});

			var platos = AsyncStorage.getItem('platosYPrecioTotal');

            platos.then((platosSeleccionados) => {

				var platosSeleccionados = JSON.parse(platosSeleccionados);

				

				var pago = stripe.createToken(information);

				pago.then( (pago) => {
					//console.log(pago);

					precio_centavos = this.state.precio*100;
					precio_entero = parseInt(precio_centavos);

					

					const body = {
						amount: precio_entero,
						tokenId: pago.id,
						name: this.state.name,
						address: this.state.address,
						lastname: this.state.lastname,
						country: this.state.pais,
						state: this.state.estado,
						meals: platosSeleccionados.meals,
					};
					const headers = {
						'Content-Type': 'application/json',
					};

					//http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com
					
					
					axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/payment/${cadena.userId}`, body, { headers })
					.then(({ data }) => {

						//console.log(data);

						if(data.payment == true){
							this.setState({modalVisible:false});
							Alert.alert(
								`Paiement terminé.`,
								`Le paiement a été effectué correctement.`,
								[{text: 'OK', onPress: () => this.props.navigation.dispatch(resetAction)}],
								{ cancelable: false }
							);
							

						} else {

							this.setState({modalVisible:false});
							Alert.alert(
								`Erreur dans le paiement.`,
								`Veuillez vérifier à nouveau les données entrées`,
								[{text: 'OK'}],
								{ cancelable: false }
							);

						}
					})
					.catch( (error)  => {
						console.log('Error in making payment', error);
						this.setState({modalVisible:false});
						Alert.alert(
							`Erreur dans le paiement.`,
							`Une erreur s'est produite lors du paiement. Veuillez réessayer`,
							[{text: 'OK'}],
							{ cancelable: false }
						);
					});

				}).catch( (error) => {
					
					console.log(error)
				});
                
            }).catch( (error) => {
				
				console.log(error)
			});

		}).catch( (error) => {
			console.log(error);
		});
	
		
	}


	

	render() {
	  	const { activeSections } = this.state;

	    return (
	      <View style={styles.external}>
	      	<StatusBar hidden = {true}/>
			  {this.state.modalVisible ? (
			  	<View style={{flex:1, height:'100%', width:'100%',position:'absolute', zIndex:9, justifyContent:'center', alignItems:'center',backgroundColor: 'rgba(0,0,0,0.6)'}}>
                  <StatusBar hidden = {true}/>
				  <ActivityIndicator 
                      size="large" 
                      color="rgb(250,204,49)" 
                      animating={true}
                      style={{alignSelf: 'center'}}
                  />
              	</View>
			  ) : null}
			  
		      { this.state.fontLoaded ? (
		      	<View style={styles.container}>
		      		<KeyboardAvoidingView behavior="padding">
		      			<ScrollView contentContainerStyle={{width:'100%', paddingHorizontal:16, paddingVertical:24, justifyContent: 'center', alignItems: 'center'}}>
					      	<View style={[styles.header, {height:40, justifyContent:'center'}]}>
					      		{/* <TouchableOpacity>
				            		<Entypo name="menu" size={40} color='white'/>
				          		</TouchableOpacity> */}
					      		<Text style={styles.textTitle}>Paiement</Text>
					      		<View style={{width: 30, height:30}}></View>
					      	</View>
				      	
				      		<Text style={[styles.textBody, {height:30, marginTop:20, marginBottom:10}]}> Hebdomadaire: <Text style={{color:'rgb(250,204,49)'}}>€{this.state.precio}</Text></Text>
							<Text style={{color: 'white', fontSize: 16,fontFamily: 'poppins-bold',textAlign: 'center',height:30, marginTop:20, marginBottom:10}}> Une robe</Text>
				      		<View style={[styles.boxText, {top:188}]}>
			                    <Text style={this.state.focusInput1
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    Adresse 1</Text>
                  			</View>
				           	<TextInput
				           		onFocus={() => this.changeFocusInputs(1)}
				           		style={this.state.focusInput1
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
										   : [styles.textInput, {width:'100%'}]}
								onChangeText={(address) => this.setState({address:address})}
				           		maxLength={50}
				           		underlineColorAndroid='rgb(68,120,97)'
				           	/>
				           	<View style={[styles.boxText, {top:259}]}>
			                    <Text style={this.state.focusInput2
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    	Nom</Text>
                  			</View>
				            <View style={styles.boxTwoInput}>
				              	<TextInput
				              		onFocus={() => this.changeFocusInputs(2)}
				           			style={this.state.focusInput2
				           				? [styles.textInput, {width:'48%', borderColor:'rgb(243,165,51)'}]
										   : [styles.textInput, {width:'48%'}]}
									onChangeText={(Name) => this.setState({name:Name})}
				              		maxLength={20}
				              		underlineColorAndroid='rgb(68,120,97)'
				              	/>
				              	<TextInput
				              		onFocus={() => this.changeFocusInputs(3)}
				           			style={this.state.focusInput3
				           				? [styles.textInput, {width:'48%', borderColor:'rgb(243,165,51)'}]
										   : [styles.textInput, {width:'48%'}]}
									onChangeText={(Name) => this.setState({lastname:Name})}
				              		maxLength={20}
				              		underlineColorAndroid='rgb(68,120,97)'
				              	/>
				            </View>
				            <View style={[styles.boxText, {top:330}]}>
			                    <Text style={styles.textTitleInput}>Pays</Text>
                  			</View>
				            <TouchableOpacity style={styles.picker}
				            	onPress={() => this.setState({ pickerCountry: true})}>
				            	<Text style={[styles.textTitleInput, {fontSize:16}]}>{this.state.pais}</Text>
				            	<FontAwesome name="caret-down" size={20} color='white'/>
							</TouchableOpacity>
							<TouchableOpacity style={styles.picker}
								onPress={() => this.setState({ pickerState: true})}>
								<Text style={[styles.textTitleInput, {fontSize:16}]}>{this.state.estado}</Text>
				            	<FontAwesome name="caret-down" size={20} color='white'/>
							</TouchableOpacity>

							<View style={[styles.boxText, {top:472}]}>
			                    <Text style={this.state.focusCard
			                    		? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
			                    		: styles.textTitleInput}>
			                    Carte de crédit</Text>
                  			</View>
				           	<TextInput
				           		onFocus={() => this.changeFocusInputs(4)}
				           		style={this.state.focusCard
				           				? [styles.textInput, {width:'100%', borderColor:'rgb(243,165,51)'}]
				           				: [styles.textInput, {width:'100%'}]}
								   maxLength={16}
								   placeholder="Carte de crédit"
								   placeholderTextColor='white'
								   onChangeText={(card) => this.setState({cardNumber:card})}
									underlineColorAndroid='rgb(68,120,97)'
									keyboardType= {'phone-pad'}
				           	/>

							<View style={{flexDirection:'row', width:'100%', justifyContent:'space-between'}}>

								{/* <View style={[styles.boxText, {top:472}]}>
									<Text style={this.state.focusCard
											? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
											: styles.textTitleInput}>
									Card number</Text>
								</View> */}
								<TextInput
									onFocus={() => this.changeFocusInputs(5)}
									style={this.state.focusMM
											? [styles.textInput, {width:'30%', borderColor:'rgb(243,165,51)'}]
											: [styles.textInput, {width:'30%'}]}
									maxLength={2}
									placeholder="MM"
									placeholderTextColor='white'
									onChangeText={(MM) => this.setState({MMNumber:MM})}
									underlineColorAndroid='rgb(68,120,97)'
									keyboardType= {'phone-pad'}
								/>


								{/* <View style={[styles.boxText, {top:472}]}>
									<Text style={this.state.focusCard
											? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
											: styles.textTitleInput}>
									Card number</Text>
								</View> */}
								<TextInput
									onFocus={() => this.changeFocusInputs(6)}
									style={this.state.focusAA
											? [styles.textInput, {width:'30%', borderColor:'rgb(243,165,51)'}]
											: [styles.textInput, {width:'30%'}]}
									maxLength={4}
									placeholder="AAAA"
									placeholderTextColor='white'
									onChangeText={(AA) => this.setState({AANumber:AA})}
										underlineColorAndroid='rgb(68,120,97)'
										keyboardType= {'phone-pad'}
								/>

								{/* <View style={[styles.boxText, {top:472}]}>
									<Text style={this.state.focusCard
											? [styles.textTitleInput, {color:'rgb(243,165,51)'}]
											: styles.textTitleInput}>
									Card number</Text>
								</View> */}
								<TextInput
									onFocus={() => this.changeFocusInputs(7)}
									style={this.state.focusCVC
											? [styles.textInput, {width:'30%', borderColor:'rgb(243,165,51)', }]
											: [styles.textInput, {width:'30%'}]}
									maxLength={3}
									placeholder="CVC"
									placeholderTextColor='white'
									onChangeText={(CVC) => this.setState({CVCNumber:CVC})}
										underlineColorAndroid='rgb(68,120,97)'
										keyboardType= {'phone-pad'}
								/>

							</View>


					      	<View style={[styles.header, {marginTop: 50}]}>
					      		<TouchableOpacity style={[styles.button, {backgroundColor: 'rgb(250,204,49)'}]}
					      			onPress={() => this.props.navigation.goBack()}>
					      			<Text style={styles.textBody}>Retour</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, {backgroundColor: 'rgb(214,186,140)'}]}
									onPress={() => {
										
												//this.props.navigation.dispatch(resetAction)
												//this.onPayment();
												this.validacion();

											}
										}>
					      			<Text style={styles.textBody}>Payer</Text>
								</TouchableOpacity>
					      	</View>
						</ScrollView>
			      	</KeyboardAvoidingView>

			      	<MaterialDialog
			            visible={this.state.pickerCountry}
			            onCancel={() => {this.setState({ pickerCountry: false })}}
			            backgroundColor= 'white'
			            scrolled>
			            	<TouchableOpacity
			            		style={{justifyContent: 'center', marginBottom:20}}
			            		onPress={() => {this.setState({pickerCountry: false, pais: "France"})}}>
					            <Text style={[styles.textTitleInput, {fontSize:16, color:'rgb(243,165,51)'}]}>
									France
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
			            		onPress={() => {this.setState({pickerState: false, estado: "Paris"})}}>
					            <Text style={[styles.textTitleInput, {fontSize:16, color:'rgb(243,165,51)'}]}>
									Paris
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
