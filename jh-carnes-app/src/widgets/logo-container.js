import React from 'react';
import { StyleSheet, ImageBackground, View, Image, Dimensions, ScrollView } from 'react-native';
import { Button as ButtonNative } from 'react-native-elements';
import Logo from '../assets/imgs/logo.png';
import Icon from 'react-native-vector-icons/Ionicons';
import ImageLogin from '../assets/imgs/login.png';
import { Colors } from '../utils';

const LogoContainer = props => (
	<ScrollView keyboardShouldPersistTaps="never">
	    <View>
	    	<View style={ styles.button }>
	    		<ButtonNative onPress={ () => props.navigation.goBack(null) } type="clear" icon={
					<Icon name="ios-arrow-back" size={ 30 } color={ Colors.black } />
				} />
	    	</View>

			<ImageBackground style={ styles.image } source={ ImageLogin }>
				<Image source={ Logo } style={ styles.logo } />
			</ImageBackground>
			
			<View style={ styles.containerCenter }>					
				{ props.children }
			</View>
		</View>		
	</ScrollView>
)

const styles = StyleSheet.create({
	logo: {
		width: 150,
		height: 150,
		alignSelf: 'center'
	},
	image: {
		height: Dimensions.get('window').height / 2.5,
		width: '100%',
		alignSelf: 'center',
		justifyContent: 'center'
	},
	button: {
		position: 'absolute',
		left: 20,
		top: 10,
		zIndex: 999
	},
	containerCenter: {
		width: '90%',
		marginTop: 10,
		alignSelf: 'center'
	}
});

export default LogoContainer;