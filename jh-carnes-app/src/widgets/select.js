import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Colors from '../utils/colors';
import Icon from 'react-native-vector-icons/FontAwesome';

const Select = props => {
	
	const items = props.items ? props.items : [];

	return (
		<View style={ { paddingHorizontal: 10 } }>
			{ props.label && <Text style={ [styles.label,props.labelStyle] }>{ props.label }</Text> }
			<View style={ [styles.container,props.style] }>
				<Icon size={ 16 } style={ styles.icon } name="caret-down" color={ Colors.blue } />
				<Text numberOfLines={ 1 } style={ [styles.text,props.textStyle] }>{ 
					props.value ? 
						items.find(i => i.value == props.value).label
						: (props.placeholder ? props.placeholder: (props.noPlaceholder ? '' : 'Seleccione')) 
				}</Text>
				<RNPickerSelect
				  style={{
				  	inputAndroid: styles.input,
				  	inputIOS: styles.input
				  }}
				  placeholder={{
				  	label: props.placeholder ? props.placeholder: (props.noPlaceholder ? (Platform.OS == 'android' ?  ' - ' : '-'): 'Seleccione')
				  }}
				  value={ props.value }
			      onValueChange={ e => {
			      	props.onChange({
			      		nativeEvent: {
			      			text: e
			      		}
			      	})
			      } }
			      items={ items }
			      doneText="Aceptar"
			    />
	 		</View>
	 	</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		backgroundColor: Colors.gray,
		height: 26,
		borderColor: Colors.gray2,
		borderWidth: 1
	},
	input: {
		opacity: 0
	},
	text: {
		position: 'absolute',
		fontSize: 14,
		paddingTop: 3,
		paddingHorizontal: 5,
		maxWidth: '80%'
	},
	label: {
		fontWeight: 'bold',
		color: Colors.black,
		fontSize: 16,
		paddingBottom: 3,
		width: '100%',
		marginTop: 10
	},
	icon: {
		position: 'absolute',
		right: 15,
		top: 5
	}
});

export default Select;