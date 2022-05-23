import React from 'react';
import { KeyboardAvoidingView, View, StyleSheet, Text, Image, ActivityIndicator, ScrollView, ImageBackground, Platform, Dimensions } from 'react-native';
import Colors from '../../assets/colors.json';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button as ButtonNative } from 'react-native-elements';
import { Button, Input } from '../../widgets';
import { Globals, Alert, Stripe, axios, ENV as Environment } from '../../utils';
import moment from 'moment';
import StripeImage from '../../assets/imgs/stripe.png';
import { store } from '../../store/store';

const STEPS = {
	DATA: 1,
	PAYMENT: 2
}

const ContainerIOS = (props) => {
	if (Platform.OS == 'ios') {
		return (
			<ImageBackground style={ styles.bg } source={ { uri: Platform.OS == 'ios' ? Environment.BASE_URL + props.event.file : null } }>
				<ScrollView style={ { width: '100%', height: '100%' } } contentContainerStyle={{ flexGrow: 1 }}>
					<KeyboardAvoidingView
			          behavior="padding"
			        >
				        <View style={ styles.container }>
							{ props.children }
						</View>
					</KeyboardAvoidingView>
				</ScrollView>
			</ImageBackground>
		)
	}
	else {
		return (
			<React.Fragment>
				{ props.children }
			</React.Fragment>
		)
	}
}

class ModalReservationEvent extends React.Component {

	static navigationOptions = {
	    header: null,
	};

	state = {
		step: STEPS.DATA,
		form: {
			persons: '',
			month: '',
			number: '',
			year: '',
			cvc: ''
		},
		loading: false,
		event: Platform.OS == 'ios' ? this.props.navigation.getParam('event') : this.props.event
	}

	onClose = () => {
		if (Platform.OS == 'ios') {
			this.props.navigation.goBack(null);
		}
		else {
			this.props.onClose();
		}
	}

	createToken = async () => {
		const {
			number,
			month,
			year,
			cvc,
			persons
		} = this.state.form;

		if (!number) {
	      Alert.alert('Debe especificar el número de su tarjeta');
	      return;
	    }

	    if (!month) {
	      Alert.alert('Debe especificar el mes de vencimiento');
	      return;
	    }

	    if (!year) {
	      Alert.alert('Debe especificar el año de vencimiento');
	      return;
	    }

	    if (moment(year,'YY').format('YYYY') < moment().format('YYYY')) {
	      Alert.alert('Lo sentimos, el año de vencimiento no es válido');
	      return;
	    }

	    if (parseInt(month) <= 0 || parseInt(month) > 12) {
	      Alert.alert('Lo sentimos, el mes de vencimiento no es válido');
	      return;
	    }

	    if (moment(month + '/' + year,'MM/YY') < moment()) {
	      Alert.alert('Lo sentimos, la fecha de vencimiento debe ser mayor al mes actual');
	      return;
	    }

	    if (!cvc) {
	      Alert.alert('Debe especificar el código secreto (CVV)');
	      return;
	    }

	    await this.setState({
	    	loading: true
	    });

	    const res = await Stripe.createToken({
	      number,
	      month: month,
	      year: year,
	      cvc
	    }).catch(err => {
	      console.log(err);
	    });

	    if (res?.id) {
	      try {
	        const response = await axios.post('stripe/create',{
	        	token: res.id,
	        	user_id: store.getState().user.id,
	        	persons: persons,
	        	event_id: this.state.event.id
	        });
	        if (response.data.result) {
	        	this.onClose();
	        	Alert.alert("Pago exitoso, enviamos un correo electrónico con información de su reserva");
	        }
	        else {
	        	Alert.alert(response.data.error);
	        }
	      }
	      catch(e) {
	      	console.log(e);
	        Alert.alert("Lo sentimos, no se pudo procesar su pago");
	      } finally {
	      	this.setState({
		    	loading: false
		    });
	      }
	    }
	    else {
	      this.setState({
	    	loading: false
	      });
	      Alert.alert("Lo sentimos, no se pudo procesar su pago");
	    }
	}

	change = (text,name) => {
		this.setState({
			form: {
				...this.state.form,
				[name]: text
			}
		});
	}

	next = () => {
		if (!this.state.form.persons) {
			Alert.alert("Debe ingresar la cantidad de personas");
			return;
		}
		const regex = /^[-+]?\d+$/;
		if (!regex.test(this.state.form.persons) || this.state.form.persons <= 0) {
			Alert.alert("La cantidad de personas no es válida");
			return;
		}
		this.setState({
			step: STEPS.PAYMENT
		});
	}
	
	render() {
		const { persons } = this.state.form;
		const { step, loading, event } = this.state;

		return (
			<View style={ styles.container }>
				<ContainerIOS event={ this.state.event }>
					<View style={ styles.containerWhite }>
						<View style={ { flexDirection: 'row', marginBottom: 10 } }>
							<View style={ { flex: .5 } }>
								{
									step == STEPS.PAYMENT && (
										<ButtonNative
											buttonStyle={ styles.buttonBack }
											type="clear"
											onPress={ () => {
												if (!loading) {
													this.setState({
														step: STEPS.DATA
													});
												}											
											} }
											icon={
												<Icon color={ Colors.red } name="ios-arrow-back" size={ 25 } />
											} />
									)
								}
							</View>
							<View style={ { flex: .5 } }>
								<ButtonNative
									buttonStyle={ styles.buttonClose }
									type="clear"
									onPress={ () => !loading && this.onClose() }
									icon={
										<Icon color={ Colors.red } name="md-close" size={ 25 } />
									} />
							</View>
						</View>
						{
							step == STEPS.DATA && (
								<React.Fragment>
									<Text style={ styles.text }><Text style={ styles.bold }>Costo por persona:</Text> { Globals.getPrice(event.details?.price) }</Text>
									<View style={ { marginVertical: 10 } }>
										<Input
								          label="Cantidad de Personas"
								          keyboardType={'numeric'}
								          onChangeText={text => {
								           this.change(text, 'persons');
								          }}
								          value={persons}
								        />
							        </View>
									{ persons != '' && (
										<Text style={ styles.text }><Text style={ styles.bold }>Total a pagar:</Text> { Globals.getPrice(event.details?.price * persons) }</Text>
									) }
									{
										event.details.note != null && (
											<Text style={ [styles.text,{
												marginTop: 10
											}] }><Text style={ styles.bold }>Nota:</Text> { event.details.note }</Text>
										)
									}
									<View style={ styles.center }>
										<Button
											btnRed
											onPress={ this.next }
											title="Siguiente"
										/>
									</View>
								</React.Fragment>
							)
						}
						{
							step == STEPS.PAYMENT && (
								<React.Fragment>
									<Image source={ StripeImage } style={ styles.stripe } />
									<Input
									  maxLength={ 16 }
							          label="Número de la Tarjeta"
							          keyboardType={'numeric'}
							          onChangeText={text => {
							           this.change(text, 'number');
							          }}
							          disabled={ loading }
							          value={this.state.form.number}
							        />
							        <Input
							          maxLength={ 4 }
							          label="Código Secreto (CVV)"
							          keyboardType={'numeric'}
							          onChangeText={text => {
							           this.change(text, 'cvc');
							          }}
							          disabled={ loading }
							          value={this.state.form.cvc}
							        />
							        <View style={ { flexDirection: 'row' } }>
							          <View style={ { flex: .5 } }>
							            <Input
								          label="Mes (MM)"
								          maxLength={ 2 }
								          keyboardType={'numeric'}
								          onChangeText={text => {
								           this.change(text, 'month');
								          }}
								          disabled={ loading }
								          value={this.state.form.month}
								        />
							          </View>
							          <View style={ { flex: .5 } }>
							            <Input
								          label="Año (YY)"
								          maxLength={ 2 }
								          keyboardType={'numeric'}
								          onChangeText={text => {
								           this.change(text, 'year');
								          }}
								          disabled={ loading }
								          value={this.state.form.year}
								        />
							          </View>
							        </View>
							        {
							        	loading ? (
							        		<View style={ { marginVertical: 20 } }>
							        			<ActivityIndicator size={ 30 } />	
							        		</View>
							        	) : (
											<View style={ styles.center }>
												<Button
													btnRed
													onPress={ this.createToken }
													title="Pagar"
												/>
											</View>
							        	)
							        }								
								</React.Fragment>
							)
						}					
					</View>
				</ContainerIOS>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	bg: Platform.OS == 'ios' ? {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
		resizeMode: 'cover',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		left: 0
	} : {
		width: '100%',
		height: '100%'
	},
	container: {
		height: '100%',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	containerWhite: {
		backgroundColor: Colors.white,
		width: '90%',
		borderRadius: 10,
		shadowOffset: {
	      width: 0,
	      height: 2,
	    },
	    shadowOpacity: 0.25,
	    shadowRadius: 3.84,
	    elevation: 5,
	    padding: 10,
	    alignSelf: 'center'
	},
	buttonClose: {
		alignSelf: 'flex-end'
	},
	buttonBack: {
		alignSelf: 'flex-start'
	},
	center: {
		marginVertical: 20,
		alignItems: 'center'
	},
	bold: {
		fontWeight: 'bold'
	},
	text: {
		fontSize: 16,
		paddingLeft: 10
	},
	stripe: {
		alignSelf: 'center',
		marginBottom: 20,
		width: 150,
		height: 50,
		resizeMode: 'contain'
	}
});

export default ModalReservationEvent;