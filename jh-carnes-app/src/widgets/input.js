import React from 'react';
import { Input } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import { Colors } from '../utils';

const _Input = props => {
	return (
		<Input
			{ ...props }
			label={ props.label }
			inputStyle={ [styles.input,props.inputStyle] }
			labelStyle={ [styles.label,props.labelStyle] }
			inputContainerStyle={ [styles.inputContainer,props.inputContainerStyle] }
			secureTextEntry={ props.password } />
	)
}

const styles = StyleSheet.create({
	label: {
		color: Colors.black,
		marginVertical: 5
	},
	input: {
		backgroundColor: Colors.gray,
		paddingVertical: 0,
		fontSize: 14,
		minHeight: 26,
		borderRadius: 0,
		borderColor: Colors.gray2,
		borderWidth: 1
	},
	inputContainer: {
		borderColor: 'transparent',
	}
});

export default _Input;