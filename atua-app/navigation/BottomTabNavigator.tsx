/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import TabThreeScreen from '../screens/TabThreeScreen';
import TabFourScreen from '../screens/TabFourScreen';
import TabFiveScreen from '../screens/TabFiveScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import SmsCodeVefication from '../screens/SmsCodeVefication';
import RegisterCarScreenOne from '../screens/RegisterCarScreenOne';
import RegisterCarScreenTwo from '../screens/RegisterCarScreenTwo';
import RegisterCarScreenThree from '../screens/RegisterCarScreenThree';
import RegisterCarScreenFour from '../screens/RegisterCarScreenFour';
import RegisterCarScreenFive from '../screens/RegisterCarScreenFive';
import RegisterCarScreenSix from '../screens/RegisterCarScreenSix';
import RegisterCarScreenSeven from '../screens/RegisterCarScreenSeven';
import UploadUserDocument from '../screens/UploadUserDocument';

import { BottomTabParamList, TabOneParamList, TabTwoParamList, TabThreeParamList, TabFourParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  <Ionicons name="chatbox-ellipses" size={24} color="black" />
  return (
    <BottomTab.Navigator
    initialRouteName={'Buscar'}
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Cartera"
        component={TabOneNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="wallet" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Mis Auntos"
        component={TabTwoNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="car" color={color} />,
        }}
      />
      <BottomTab.Screen
        name='Buscar'
        component={TabThreeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Mis Viajes"
        component={TabFourNavigator}
        options={{

          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="car-multiple" size={24} color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Perfil"
        component={TabFiveNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const TabOneStack = createStackNavigator<TabOneParamList>();

function TabOneNavigator() {
  return (
    <TabOneStack.Navigator>
      <TabOneStack.Screen
        name="TabOneScreen"
        component={TabOneScreen}
        options={{ headerTitle: 'Cartera' }}
      />
    </TabOneStack.Navigator>
  );
}

const TabTwoStack = createStackNavigator<TabTwoParamList>();

function TabTwoNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="TabTwoScreen"
        component={TabTwoScreen}
        options={{ headerTitle: 'Mis Autos' }}
      />
    </TabTwoStack.Navigator>
  );
}

const TabThreeStack = createStackNavigator<TabThreeParamList>();

function TabThreeNavigator() {
  return (
    <TabThreeStack.Navigator>
      <TabThreeStack.Screen
        name="TabThreeScreen"
        component={TabThreeScreen}
        options={{ headerTitle: 'Busqueda' }}
      />
    </TabThreeStack.Navigator>
  );
}

const TabFourStack = createStackNavigator<TabFourParamList>();

function TabFourNavigator() {
  return (
    <TabFourStack.Navigator>
      <TabFourStack.Screen
        name="TabFourScreen"
        component={TabFourScreen}
        options={{ headerTitle: 'Mis Viajes' }}
      />
    </TabFourStack.Navigator>
  );
}

const TabFiveStack = createStackNavigator<TabFiveParamList>();

function TabFiveNavigator() {
  return (
    <TabFiveStack.Navigator>
      <TabFiveStack.Screen
        name="TabFiveScreen"
        component={TabFiveScreen}
        options={{ headerTitle: 'Usuario' }}
      />
      <TabFiveStack.Screen
        name="RegisterScreen"
        component={RegisterScreen}
        options={{ headerTitle: 'Registro' }}
      />
      <TabFiveStack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerTitle: 'Inicio de sesión' }}
      />
      <TabFiveStack.Screen
        name="SMSScreen"
        component={SmsCodeVefication}
        options={{ headerTitle: 'Verificacion de SMS' }}
      />
      <TabFiveStack.Screen
        name="RegisterCarScreenOne"
        component={RegisterCarScreenOne}
        options={{ headerTitle: 'Registrar auto (Paso 1)' }}
      />
      <TabFiveStack.Screen
        name="RegisterCarScreenTwo"
        component={RegisterCarScreenTwo}
        options={{ headerTitle: 'Registrar auto (Paso 2)' }}
      />
      <TabFiveStack.Screen
        name="RegisterCarScreenThree"
        component={RegisterCarScreenThree}
        options={{ headerTitle: 'Registrar auto (Paso 3)' }}
      />
      <TabFiveStack.Screen
        name="RegisterCarScreenFour"
        component={RegisterCarScreenFour}
        options={{ headerTitle: 'Registrar auto (Paso 4)' }}
      />
      <TabFiveStack.Screen
        name="RegisterCarScreenFive"
        component={RegisterCarScreenFive}
        options={{ headerTitle: 'Registrar auto (Paso 5)' }}
      />
      <TabFiveStack.Screen
        name="RegisterCarScreenSix"
        component={RegisterCarScreenSix}
        options={{ headerTitle: 'Registrar auto (Paso 6)' }}
      />
      <TabFiveStack.Screen
        name="RegisterCarScreenSeven"
        component={RegisterCarScreenSeven}
        options={{ headerTitle: 'Registrar auto (Paso 7)' }}
      />
      <TabFiveStack.Screen
        name="UploadUserDocument"
        component={UploadUserDocument}
        options={{ headerTitle: 'Subir documentación' }}
      />
    </TabFiveStack.Navigator>
  );
}
