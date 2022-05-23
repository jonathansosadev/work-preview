import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Colors } from '../utils';

class Infinite extends React.Component {

	render() {
		return (
			<View style={ styles.container }>
				{ !this.props.loading && (
					<TouchableOpacity onPress={ this.props.onPress }>
						<View style={ [styles.containerWhite,this.props.containerStyle] }>
							<Text style={ [styles.text,this.props.textStyle] }>Mostrar más</Text>
						</View>						
					</TouchableOpacity>
				) }
				
				{ this.props.loading && <ActivityIndicator size="large" /> }
			</View>
		)
	}	
}
 
const styles = StyleSheet.create({
	text: {
		color: Colors.red,
		textAlign: 'center',
		fontSize: 14
	},
	container: {
		marginVertical: 20,
	},
	containerWhite: {
		backgroundColor: Colors.white,
		alignSelf: 'center',
		borderRadius: 5,
		padding: 5,
		paddingHorizontal: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	}
});

export default Infinite;