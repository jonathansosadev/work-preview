import React from 'react';
import Header from './header';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../utils';
import { Button } from 'react-native-elements';

const MenuButton = props => {
	if (props.canGoBack)
		return (
			<Button
				type="clear"
				onPress={ props.onPress }
				icon={
					<Icon name="ios-arrow-back" size={ 30 } color={ props.iconColor ? props.iconColor : Colors.white } />
				} />
		)
	else
		return null;
}

const NavigationOptions = ({ navigation }) => {

	let index = navigation.dangerouslyGetParent().state.index;

	return {
		gesturesEnabled: false,
		header: props => {

			let params = props.scene.descriptor.state.params;

			return (
				<Header 
					{ ...props }
					{ ...navigation.state.params }
					headerLeft={
						<MenuButton
							iconColor={ params ? params.iconColor : null }
							canGoBack={ index > 0 }
							onPress={ () => navigation.goBack(null) } />
					} />
			)			
		}
	}	
}

export default NavigationOptions;