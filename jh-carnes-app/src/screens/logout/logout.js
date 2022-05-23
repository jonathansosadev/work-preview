import React from 'react';
import { Globals, Social } from '../../utils';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation';

class Logout extends React.Component {

	static navigationOptions = {
		header: null
	}
	
	componentDidMount() {
		Globals.setLoading();

		setTimeout(async () => {
			Social.Google.Logout();
			Social.Facebook.Logout();			
			Globals.quitLoading();
			await this.props.dispatch({
				type: 'REMOVE_USER'
			});
			await this.props.navigation.dispatch(
				StackActions.reset({
				  index: 0,
				  actions: [
				  	NavigationActions.navigate({ routeName: 'Home' })
				  ]
				})
			);			
		},1500);
	}

	render() {
		return null;
	}
}


export default connect(null)(Logout);