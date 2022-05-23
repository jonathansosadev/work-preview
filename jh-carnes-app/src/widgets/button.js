import React from 'react';
import { Button } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import { Colors } from '../utils';

const _Button = props => {
	return (
		<Button 
			{ ...props }
			titleStyle={ [styles.buttonText,props.btnRed && styles.titleWhite,props.titleStyle] }
			title={ props.title }
			disabled={ props.disabled }
			onPress={ props.onPress }
			disabledTitleStyle={ [props.btnRed && styles.titleWhiteDisabled,props.disabledTitleStyle] }
			disabledStyle={ [props.btnRed && styles.buttonRedDisabled,props.disabledStyle] }
			buttonStyle={ [styles.button, props.btnRed && styles.buttonRed, !props.noShadow ? styles.shadow : null ,props.buttonStyle] } />
	)
}

const styles = StyleSheet.create({
	button: {
		width: 'auto',
		marginBottom: 10,
		width: 170,
		paddingVertical: 5,
		borderRadius: 30,
		backgroundColor: Colors.white
	},
	shadow:{
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	buttonText: {
		fontSize: 14,
		color: Colors.black
	},
	titleWhite: {
		color: Colors.white
	},
	titleWhiteDisabled: {
		color: Colors.gray2
	},
	buttonRed: {
		backgroundColor: Colors.red
	},
	buttonRedDisabled: {
		backgroundColor: Colors.redDisabled
	}
});

export default _Button;