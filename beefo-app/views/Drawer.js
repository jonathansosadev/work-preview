import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, AsyncStorage} from 'react-native';
import { Font } from 'expo';
import { FontAwesome, Ionicons, Octicons, Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { StackActions, NavigationActions } from 'react-navigation';


const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Main' })],
});

const resetAction2 = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'Login' })],
});

export default class Drawer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      image:'',
      name:'',
    };
}
  

  async componentWillMount() {

    var loginInfo = AsyncStorage.getItem('loginInfo');

		loginInfo.then( (loginInfo) => {
			loginInfo = JSON.parse(loginInfo)
			var cadena = '';

			axios.get(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/user/${loginInfo.userId}`).then(resp => {
				
				this.setState({image: `http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/uploads/usersImages/${resp.data.user.profileImage}`});
                
          this.setState({
              name: resp.data.user.name,
          });

				
        }).catch((error) => {
            console.log(error);
        });
      }).catch( (error) => {
          console.log(error);
        });

    await Font.loadAsync({
      'roboto-bold': require('../assets/fonts/Poppins-Bold.ttf'),
      'poppins-medium': require('../assets/fonts/Poppins-Medium.ttf'),
    });
    this.setState({ fontLoaded: true });
  }

  _closeSession(){

    try{
      AsyncStorage.setItem('loginInfo', JSON.stringify({userId: 'algo', login: false}));
      this.props.navigation.dispatch(resetAction2);
      
    }catch (error) {
      console.log('Error al guardar en el storage');
    }

  }

  render() {
    return (
      <View style={styles.external}>
      {/* <Text>prueba</Text>
      <TouchableOpacity
              onPress={() => this.props.navigation.navigate('YourSummary')}>
              <Feather name="home" size={30} color='white'/>
              <Text>Inicio</Text>
            </TouchableOpacity> */}
      { this.state.fontLoaded ? (
        <View style={{flex: 1}}>
      <View style={{height:130, width:'100%', backgroundColor: '#809473', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <Image source={{ uri: this.state.image }} style={{width:63, height:63}} borderRadius={50}></Image>

        <View style={{marginLeft:10}}>

          <Text style={{color: 'white', fontFamily: 'roboto-bold', fontSize:20}}>{this.state.name}</Text>

          <TouchableOpacity style={{height: 30, width: 140, backgroundColor: 'rgb(250,204,49)', borderRadius: 5, justifyContent: 'center', alignItems: 'center',    elevation: 7, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 5}}
            onPress={() => this.props.navigation.navigate('EditProfile')}
          >
            <Text style={{color: 'white', fontFamily: 'roboto-bold', fontSize: 16}}>
              Editer le profil
            </Text>
          </TouchableOpacity>
        </View>

      </View>
      <ScrollView contentContainerStyle={{width:'100%', alignItems: 'flex-start'}}>
              <TouchableOpacity style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'}}
              onPress={() => this.props.navigation.navigate('YourProfile')}>
              <FontAwesome name="user" size={25} color="white" style={{margin: 10, marginLeft:25}}/>
                <Text style={{color: 'rgb(214,186,140)', fontFamily: 'poppins-medium', fontSize: 18, margin: 10}}>
Votre profil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'}}
              onPress={() => this.props.navigation.navigate('ShowMealPlan')}>
              <Octicons name="checklist" size={25} color="white" style={{margin: 10, marginLeft:25}}/>
                <Text style={{color: 'rgb(214,186,140)', fontFamily: 'poppins-medium', fontSize: 18, margin: 10}}>
Mon plan de repas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'}}
                onPress={() => this.props.navigation.dispatch(resetAction)}
              >
                <MaterialIcons name="restaurant" size={25} color="white" style={{margin: 10, marginLeft:25}}/>
                <Text style={{color: 'rgb(214,186,140)', fontFamily: 'poppins-medium', fontSize: 18, margin: 10}}>  
                  Nouveau menu
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'}}>
                <Ionicons name="ios-list-box" size={25} color="white" style={{margin: 10, marginLeft:25}}/>
                <Text style={{color: 'rgb(214,186,140)', fontFamily: 'poppins-medium', fontSize: 18, margin: 10}}>  
                  Termes et conditions
                </Text>
              </TouchableOpacity>
      </ScrollView>
      <View style={{justifyContent: 'flex-end'}}>
      <TouchableOpacity style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row'}} onPress={()=>this._closeSession()}>
              <Feather name="power" size={25} color="white" style={{margin: 10, marginLeft:25}}/>
                <Text style={{color: 'rgb(214,186,140)', fontFamily: 'poppins-medium', fontSize: 18, margin: 10}}>Connectez - Out</Text>
              </TouchableOpacity>
      </View>
      </View>



      ) : null }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  external: {
    flex:1,
    justifyContent:'flex-start',
    backgroundColor: 'rgb(68,120,97)',
  },
  buttonChange: {
    height: 51,
    width:'48%',
    backgroundColor: 'rgb(250,204,49)',
    borderRadius: 6,
    fontSize: 16,
    // fontFamily:'roboto-regular',
    borderColor: 'rgb(250,204,49)',
    borderWidth: 2,
    marginVertical: 10,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
},
  container: {
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(250,44,169,0.5)',
    width: '100%',
    paddingTop: 20,
  },
  boxProfile: {
    marginVertical: 10,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  textProfile: {
    fontSize:18,
    fontFamily: 'rubik-regular',
    color:'#ffbc34',
    marginRight:5,
  },
  boxText: {
    paddingLeft: 20,
    height:50,
    width: '100%',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor:'#8a1364',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row'
  },
  text: {
    fontSize: 16,
    fontFamily: 'rubik-regular',
    color: 'white',
    marginLeft: 10,
  }
});