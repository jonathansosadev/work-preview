import React from 'react';
import { StyleSheet, View, Dimensions, Text, ScrollView, TouchableWithoutFeedback, ImageBackground, Image } from 'react-native';
import { axios, Globals, Alert, Colors, ENV } from '../../utils';
import { connect } from 'react-redux';
import MenuRed from '../../assets/imgs/backgroundrojo-18.png';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import moment from 'moment';
import { Menu1 } from '../../assets/icons';
import { Modal, LazyImage } from '../../widgets';
import ModalDescription from './modal-description';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo from '../../assets/imgs/logo.png';

const height = Dimensions.get('window').height / 2;

class Menu extends React.Component {

	state = {
		foods: [],
		schedule: [],
		selected: null,
		active: 0,
		selectedActive: 0,
		visible: false,
		item: null
	}

	componentDidMount() {
		Globals.setLoading();
		axios.post('foods/all')
			.then(res => {
				if (res.data.result) {
					this.setState({
						foods: res.data.foods,
						schedule: res.data.schedule,
						selected: res.data.foods.length > 0 ? res.data.foods[0] : null
					});
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

	reservation = () => {
    	if (this.props.user) {
    		this.props.navigation.navigate('NewReservation');
    	}
    	else {
			this.props.navigation.navigate('Login',{
				callback: () => {
					this.props.navigation.navigate('NewReservation');
				}
			});
    	}
    };

    _renderItem = ({ item, index }) => {
        return (
        	<TouchableWithoutFeedback onPress={ () => this.view(item) }>
	            <View style={ styles.item }>
	            	<LazyImage
	            		style={ styles.imageProduct }
	            		source={ { uri: ENV.BASE_URL + item.images[0].file } } />
	                <Text style={ styles.name }>{ item.name }</Text>
	                <Text style={ styles.price }>{ Globals.getPrice(item.price) }</Text>
	            </View>
	    	</TouchableWithoutFeedback>
        );
    }

    getSchedule = () => {
		let data = '';
		this.state.schedule.forEach((item,index) => {
			data += moment(item.start,'HH:mm:ss').format('hh:mm A') + ' a ' + moment(item.end,'HH:mm:ss').format('hh:mm A');
			if ((index + 1) != this.state.schedule.length) {
				data += ' / ';
			}
		});
		return data;
    }

    view = item => {
    	this.setState({
    		visible: true,
    		item
    	});
    }

	render() {
		return (
			<React.Fragment>

				{ this.state.visible && this.state.item != null && <Modal visible={ this.state.visible } transparent={ true }>
					<ModalDescription item={ this.state.item } onClose={ () => {
						this.setState({
							visible: false
						})
					} } />
				</Modal> }

				<ScrollView>
					<View>
						<ImageBackground source={ MenuRed } style={ styles.image }>
							<Text style={ styles.title }>Menú</Text>

							<Image source={ Logo } style={ styles.logo } />

							{/* this.state.selected != null && (
								<React.Fragment>
									<Carousel
										sliderWidth={ Dimensions.get('window').width }
				                		sliderHeight={ 150 }
				                		itemWidth={ Dimensions.get('window').width }
										ref={ ref => this.carouselTop = ref }
						                data={ this.state.selected.images }
						                renderItem={ ({ item, index }) => {
						                	return (
												<LazyImage style={ styles.principal } source={ { uri: ENV.BASE_URL + item.file  } } />
						                	)
						                } }
						                onSnapToItem={ index => {
						                	this.setState({
												selectedActive: index
						                	});

						                	if (index == (this.state.selected.images.length - 1) && this.carouselTop != null) {
						                		setTimeout(() => {
						                			try {
						                				this.carouselTop.snapToItem(0);
						                			}
						                			catch(e) {
														console.log(e);
						                			}													
						                		},3000);
		                					}
						                } }
						            />

									<Pagination
									  dotStyle={{
						                  backgroundColor: Colors.white
						              }}
						              dotsLength={ this.state.selected.images.length }
						              activeDotIndex={ this.state.selectedActive }
							        />
								</React.Fragment>
							) */}
						</ImageBackground>

						<View style={ { paddingVertical: 10 } }>

							<TouchableWithoutFeedback onPress={ () => this.view(itemReservation) }>
								<Text numberOfLines={ 3 } style={ styles.description }>
									{ this.state.selected && this.state.selected.description }
								</Text>
							</TouchableWithoutFeedback>

							<View style={ { position: 'relative' } }>

								{ this.state.foods.length > 1 && this.state.active != 0 && <View style={ styles.buttonLeft }>
									<Button
										type="clear"
										onPress={ () => {
											this.setState({
												selected: this.state.foods[this.state.active - 1],
												active: this.state.active - 1
						                	});
											this.carousel.snapToPrev();
										} }
										icon={
											<Icon name="ios-arrow-back" color={ Colors.black } size={ 40 } />
										} />
								</View> }					

								<Carousel
									ref={ ref => this.carousel = ref }
					                sliderWidth={ Dimensions.get('window').width }
					                sliderHeight={ Dimensions.get('window').height / 2 }
					                itemWidth={ Dimensions.get('window').width }
					                data={ this.state.foods }
					                renderItem={ this._renderItem }
					                onSnapToItem={ index => {
					                	this.setState({
											selected: this.state.foods[index],
											active: index
					                	});
					                } }
					            />
	
								{ (this.state.active + 1) < this.state.foods.length && <View style={ styles.buttonRight }>
									<Button
										type="clear"
										onPress={ () => {
											this.setState({
												selected: this.state.foods[this.state.active + 1],
												active: this.state.active + 1
						                	});
											this.carousel.snapToNext();
										} }
										icon={
											<Icon name="ios-arrow-forward" color={ Colors.black } size={ 40 } />
										} />
								</View> }						
							</View>

				            <Pagination
				              dotsLength={ this.state.foods.length }
				              activeDotIndex={ this.state.active }
				            />

				            <Text style={ { textAlign: 'center', marginBottom: 15 } }>
				            	<Text style={ [styles.bold,styles.text] }>Horario: </Text>
				            	<Text style={ styles.text }>{ this.getSchedule() }</Text>
				            </Text>
						</View>
					</View>
				</ScrollView>
			</React.Fragment>
		)
	}
}

const styles = StyleSheet.create({
	image: {
		width: Dimensions.get('window').width * 1.5,
		position: 'relative',
		left: (Dimensions.get('window').width * .25) * -1,
		height: Dimensions.get('window').height / 2.3,
		borderBottomRightRadius: Dimensions.get('window').width,
		borderBottomLeftRadius: Dimensions.get('window').width,
		overflow: 'hidden',
		resizeMode: 'cover',
		paddingHorizontal: Dimensions.get('window').width * .25
	},
	title: {
		fontSize: 20,
		color: Colors.white,
		textAlign: 'center',
		fontWeight: 'bold',
		marginTop: 10
	},
	bold: {
		fontWeight: 'bold',
		color: Colors.red
	},
	text: {
		fontSize: 12
	},
	description: {
		fontSize: 12,
		textAlign: 'center',
		width: 250,
		marginVertical: 15,
		alignSelf: 'center'
	},
	imageProduct: {
		width: '100%',
		height: Dimensions.get('window').height / 3,
		borderRadius: 10,
		alignSelf: 'center',
		resizeMode: 'cover',
		overflow: 'hidden'
	},
	item: {
		backgroundColor: Colors.red,
		width: '70%',
		borderRadius: 10,
		padding: 10,
		alignSelf: 'center',
	},
	name: {
		textAlign: 'center',
		color: Colors.white,
		marginTop: 5
	},
	price: {
		color: Colors.white,
		fontWeight: 'bold',
		textAlign: 'center',
		marginTop: 5
	},
	principal: {
		width: Dimensions.get('window').width / 1.2,
		height: height / 1.6,
		resizeMode: 'cover',
		alignSelf: 'center',
		marginTop: 10,
        borderRadius: 10,
	},
	yellow: {
		color: Colors.yellow,
		fontWeight: 'bold'
	},
	buttonLeft: {
		position: 'absolute',
		left: 0,
		top: '40%',
		width: 40,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'flex-end',
		zIndex: 999
	},
	buttonRight: {
		position: 'absolute',
		right: 0,
		top: '40%',
		width: 40,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'flex-start',
		zIndex: 999
	},
	logo: {
		// width: 170,
		height: '80%',
		alignSelf: 'center',
		marginTop: 10,
		resizeMode: 'contain'
	}
});

export default connect(state => {
	return {
		user: state.user
	}
})(Menu);
