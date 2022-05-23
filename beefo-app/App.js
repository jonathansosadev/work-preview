import React from 'react';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import Main from './views/Main';
import Payment from './views/Payment';
import CircleSlider from './views/CircleSlider';
import SportsHabbits from './views/SportsHabbits';
import AboutYou from './views/AboutYou';
import YourSummary from './views/YourSummary';
import EditAllergy from './views/EditAllergy';
import Allergies from './views/Allergies';
import MealPlan from './views/MealPlan';
import ShowMealPlan from './views/ShowMealPlan';
import YourProfile from './views/YourProfile';
import EditProfile from './views/EditProfile';
import Drawer from './views/Drawer';
import Login from './views/Login';
import Signup from './views/Signup';
import Restore from './views/Restore';
import Restore2 from './views/Restore2';
import Restore3 from './views/Restore3';

console.disableYellowBox = true;

const DrawerNav = createDrawerNavigator({
    YourProfile: { screen: YourProfile },
    EditProfile: { screen: EditProfile },
        
    }, {
    contentComponent: (props) => ( < Drawer {...props }
        />),
    }
);

        const StackNav = createStackNavigator({
            Restore: { screen: Restore },
            Restore2: { screen: Restore2 },
            Restore3: { screen: Restore3 },
            Login: { screen: Login },
            Signup: { screen: Signup },
            Main: { screen: Main },
            Payment: { screen: Payment },
            CircleSlider: { screen: CircleSlider },
            SportsHabbits: { screen: SportsHabbits },
            AboutYou: { screen: AboutYou },
            YourSummary: { screen: YourSummary },
            Allergies: { screen: Allergies },
            MealPlan: {screen: MealPlan},
            ShowMealPlan: {screen: ShowMealPlan},
            
            EditProfile: {screen: EditProfile},
            DrawerNav: { screen: DrawerNav },
            EditAllergy: {screen: EditAllergy},
            YourProfile: {screen: YourProfile},
            

        }, {
            navigationOptions: { header: null },
            // initialRouteName: 'EditProfile',
            initialRouteName: 'Login',
        });

        export default class App extends React.Component {
            render() {
                return <StackNav / > ;
            }
        }