import { NavigationActions, StackActions } from 'react-navigation';

let _navigator;

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
}

const navigate = (routeName, params) => {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

const replace = routeName => {
  _navigator.dispatch(
    StackActions.reset({
      index: 0,
	  actions: [
	  	NavigationActions.navigate({ routeName: routeName })
	  ]
    })
  );
}

export default {
  navigate,
  setTopLevelNavigator,
  replace
};