import React from 'react';
import { Modal, StyleSheet, View, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../utils';
import { Button as ButtonElement } from 'react-native-elements';
import Button from './button';

class Rotation extends React.Component {

	state = {
		rotation: 0
	}

	save = () => {
	    this.props.onClose(this.state.rotation);
	}

	rotate = () => {
		this.setState({
			rotation: this.state.rotation + 90
		});
	}
	
	render() {
		return (
			<Modal onShow={ () => this.setState({ rotation: 0 }) } animationType="slide" visible={ this.props.visible }>
	          	 <View style={ styles.container }>
					<View style={ styles.containerLeft } />
					<Text numberOfLines={ 1 } style={ styles.title }>Rotar Imagen</Text>
					<View style={ styles.containerRight }>
						<ButtonElement 
		          			buttonStyle={ styles.close }
				          	type="clear"
				          	onPress={ () => this.props.onClose(null) }
				          	icon={
				          		<Icon color={ Colors.white } size={ 25 } name="md-close" />
				          	} />
					</View>
				 </View>
				
				 <Image 
				 	source={ { uri: this.props.source } } 
				 	style={ [styles.image,{
				 		transform: [{
				 			rotate: this.state.rotation + 'deg'
				 		}]
				 	}] } />

	          	 <View style={ styles.containerButtons }>
					<View style={ { flex: 0.5 } }>
						<Button
							onPress={ this.save }
							title="Guardar"
							buttonStyle={ styles.btnRed }
							btnRed />
					</View>
					<View style={ { flex: 0.5 } }>
						<Button
							onPress={ this.rotate }
							title="Rotar"
							buttonStyle={ styles.btnRed }
							btnRed />
					</View>
		         </View>		
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	containerRight: {
		position: 'absolute',
		right: 5
	},
	containerLeft: {
		position: 'absolute',
		left: 5
	},
	container: {
		flexDirection: 'row',
		paddingTop: 5,
		paddingBottom: 5,
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		backgroundColor: Colors.red,
		height: 40
	},
	title: {
		color: Colors.white,
		fontSize: 16,
		textAlign: 'center',
		width: '80%'
	},
	containerButtons: {
		flexDirection: 'row'
	},
	btnRed: {
		backgroundColor: Colors.red,
		width: '90%',
		marginLeft: '5%'
	},
	btnRedDisable: {
		backgroundColor: Colors.redDisable
	},
	btnRedTitle: {
		color: Colors.gray3
	},
	image: {
		width: 200,
		height: 200,
		resizeMode: 'cover',
		borderRadius: 5,
		marginTop: 20,
		marginBottom: 20,
		alignSelf: 'center'
	}
});

export default Rotation;