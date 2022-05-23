import React from "react";
import { View, StyleSheet, Text, Dimensions, Animated, Image, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import { Colors, ENV, axios } from '../../utils';
import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import { connect } from 'react-redux';
import { CustomIcon } from '../../widgets';
import Logo from '../../assets/imgs/logo.png';
import Icon from 'react-native-vector-icons/Ionicons';

class Home extends React.Component {

	static navigationOptions = {
		header: null
	}

	state = {
		sliders: []
	}

	componentDidMount() {

	    if (this.props.user && (this.props.user.level===1 || this.props.user.level===2) ) {
	        this.props.navigation.replace("HomeAdmin");
        } else {
            axios.post('sliders/all')
                .then(res => {
                    if (res.data.result) {
                        this.setState({
                            sliders: res.data.sliders
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }

	}

	_renderItem = ({item, index}, parallaxProps) => {
        return (
            <View style={ styles.item }>
                <ParallaxImage
                    source={ { uri: ENV.BASE_URL + 'img/slider/' + item.file } }
                    containerStyle={ styles.imageContainer }
                    style={ styles.image }
                    parallaxFactor={ 0.4 }
                    { ...parallaxProps }
                />
            </View>
        );
    }

    goTo = page => {
		this.props.navigation.navigate(page);
    }

    render() {
        return (
			<View style={ styles.container }>

				<View style={ styles.containerButton }>
					<Button
						onPress={ () => {
							if (this.props.user) {
								this.goTo('Profile');
							}
							else {
								this.goTo('Login');
							}
						} }
						buttonStyle={ styles.buttonHeader }
						icon={
							<Icon name="md-person" size={ 20 } color={ Colors.white } />
						} />
				</View>				

				<Carousel
					scrollEnabled={ false }
					ref={ ref => this.carousel = ref }
					autoplay={ true }
					autoplayDelay={ 0 }
					autoplayInterval={ 3000 }
	                sliderWidth={ Dimensions.get('window').width }
	                sliderHeight={ Dimensions.get('window').height }
	                itemWidth={ Dimensions.get('window').width }
	                data={ this.state.sliders }
	                renderItem={ this._renderItem }
	                hasParallaxImages={ true }
	                onSnapToItem={ index => {
	                	if (index == (this.state.sliders.length - 1) && this.carousel != null) {
	                		setTimeout(() => {
	                			try {
	                				this.carousel.snapToItem(0);
	                			}
	                			catch(e) {
									console.log(e);
	                			}								
	                		},3000);
	                	}
	                } }
	            />

	            <Image style={ styles.logo } source={ Logo } />

				<View
					style={ styles.row }>
					<View style={ styles.col }>
						<Button onPress={ () => this.goTo('Menu') } type="clear" icon={
							<CustomIcon name="Menu1" size={ 50 } />
						} />
						<Text style={ styles.text }>Menú</Text>
					</View>
					<View style={ styles.col }>
						<Button onPress={ () => {
							if (this.props.user) {
								this.goTo('Reservations');
							}
							else {
								this.goTo('Login');
							}
						} } type="clear" icon={
							<CustomIcon name="Menu2" size={ 50 } />
						} />
						<Text style={ styles.text }>Reservas</Text>
					</View>
					<View style={ styles.col }>
						<Button onPress={ () => this.goTo('Catering') } type="clear" icon={
							<CustomIcon name="Menu3" size={ 50 } />
						} />
						<Text style={ styles.text }>Catering</Text>
					</View>
					<View style={ styles.col }>
						<Button onPress={ () => this.goTo('EventsClient') } type="clear" icon={
							<CustomIcon name="Menu4" size={ 50 } />
						} />
						<Text style={ styles.text }>Eventos</Text>
					</View>
				</View>
			</View>
        )
    }
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		position: 'absolute',
		bottom: 0,
		flex: 1,
		width: '100%',
		paddingTop: 30
	},
	col: {
		flex: 0.25,
		marginBottom: 15
	},
	text: {
		textAlign: 'center',
		color: Colors.black
	},
	item: {
		width: '100%',
		height: '100%',
	},
	imageContainer: {
		flex: 1
	},
	image: {
		width: '100%',
		resizeMode: 'cover'
	},
	logo: {
		position: 'absolute',
		alignSelf: 'center',
		zIndex: 999,
		top: '20%',
		width: 250,
		height: 250
	},
	container: {
		backgroundColor: Colors.black
	},
	row2: {
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		flex: 1,
		width: '100%',
		zIndex: 9999,
		backgroundColor: 'rgba(0,0,0,.3)',
	},
	col2: {
		flex: 0.5,
		padding: 5,
		paddingVertical: 10
	},
	textRegister: {
		color: Colors.white,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	buttonHeader: {
		backgroundColor: Colors.red,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		borderRadius: 20,
		width: 40,
		height: 40
	},
	containerButton: {
		position: 'absolute',
		right: 10,
		top: 10,
		zIndex: 9999999,
	}
});

export default connect(state => {
	return {
		user: state.user
	}
})(Home);
