import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../utils';

const Header = props => {
	if (props.hidden) {
		return null;
	}
	else
		return (
			<View style={ [styles.container,props.style] }>
				<View style={ [styles.containerLeft] }>
					{ props.headerLeft }
				</View>
				<Text numberOfLines={ 1 } style={ [styles.title,props.titleStyle] }>{ props.title ? props.title : props.scene.descriptor.options.title }</Text>
				<View style={ styles.containerRight }>
					{ props.headerRight }
				</View>
			</View>
		)
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		paddingTop: 5,
		paddingBottom: 5,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		width: '100%',
		top: 0,
		height: 40,
		backgroundColor: 'transparent'
	},
	title: {
		fontSize: 16,
		textAlign: 'center',
		width: '80%',
		color: Colors.white,
		fontWeight: 'bold'
	},
	containerRight: {
		position: 'absolute',
		right: 5
	},
	containerLeft: {
		position: 'absolute',
		left: 5
	}
});

export default Header;
