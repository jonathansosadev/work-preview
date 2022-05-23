import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../utils';
import { Button, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchBar = props => (
	<View style={ styles.search }>
		<View style={ styles.inputContainer }>
			<Input
				placeholder={ props.placeholder }
				onChange={ props.onChange }
				value={ props.value }
				inputStyle={ styles.inputStyle }
				inputContainerStyle={ styles.input } />
		</View>
		<View style={ styles.buttonSearchContainer }>
			<Button
				buttonStyle={ styles.buttonSearch }
				type="clear"
				onPress={ props.onSubmit }
				icon={
					<Icon style={ {
						marginTop: 2.5
					} } size={ 20 } name="md-search" />
				} />
		</View>
	</View>
)

const styles = StyleSheet.create({
	search: {
		flexDirection: 'row',
		backgroundColor: Colors.white,
		borderWidth: .5,
		borderColor: Colors.red,
		marginBottom: 20,
		padding: 3,
		width: '90%',
		marginLeft: '5%'
	},
	inputContainer: {
		flex: 0.9
	},
	buttonSearchContainer: {
		flex: 0.1
	},
	buttonSearch: {
		margin: 0,
		padding: 0,
		marginTop: 2
	},
	input: {
		borderColor: 'transparent',
	},
	inputStyle: {
		paddingVertical: 0,
		fontSize: 14,
		minHeight: 'auto'
	}
});

export default SearchBar;