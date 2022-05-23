import React from 'react';
import Icon from '../assets/icons';
import { View, Image, StyleSheet } from 'react-native';

const CustomIcon = props => (
	<View style={ props.containerStyle }>
		<Image tintColor={ props.color } style={ [styles.icon,{ 
			width: props.size || 25,
			height: props.size || 25,
			tintColor: props.color
		} ]} source={ Icon[props.name] } />
	</View>
)

const styles = StyleSheet.create({
	icon: {
		resizeMode: 'contain'
	}
});

export default CustomIcon;