import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, TextInput, ImageBackground, KeyboardAvoidingView, AsyncStorage, Alert } from 'react-native';
import { Font } from 'expo';
import {Entypo} from '@expo/vector-icons';
import Slider from "react-native-slider";
import axios from 'axios';

export default class AboutYou extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
            count: 0,
            fontLoaded: false,
            altura: 0,
            peso: 0,
            grasa1: 50,
            grasa2: 50,
            statustoggle2: true,
            statustoggle3: true,
            edad: '',
            sexo: "",
            alergiaYes: true,
            alergiaNo:false,

        }
    }

    _storeData = () => {

        if (this.state.sexo == '') {
            Alert.alert(
                'Entrez les données correctement',
                "S'il vous plaît sélectionnez votre sexe",
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                { cancelable: false }
            );
        }

        if (this.state.edad == '') {
            Alert.alert(
                'Entrez les données correctement',
                "S'il vous plaît entrer votre âge",
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                { cancelable: false }
            );
        }

        if (this.state.peso == 0) {
            Alert.alert(
                'Entrez les données correctement',
                "S'il vous plaît sélectionnez votre poids",
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                { cancelable: false }
            );
        }

        if (this.state.altura == 0) {
            Alert.alert(
                'Entrez les données correctement',
                "S'il vous plaît sélectionnez votre taille",
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                { cancelable: false }
            );
        }

        if (this.state.sexo != '' && this.state.edad != '' && this.state.peso > 0 && this.state.altura > 0) {
            try {
                var datos = AsyncStorage.setItem('paso1', JSON.stringify({sexo: this.state.sexo, edad: this.state.edad, altura: this.state.altura, peso: this.state.peso}));
                datos.then( () => {

                    if(this.state.alergiaYes){
                        this.props.navigation.navigate('Allergies');
                    }

                    else{

                        AsyncStorage.setItem('alergias', JSON.stringify([]));

                        const loginInfo = AsyncStorage.getItem('loginInfo');
            

                        loginInfo.then( (loginInfo) => {
                            
                            var cadena =  JSON.parse(loginInfo);
                            axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/update-user/${cadena.userId}`,{
                                allergies: [],
                            }).then(resp => {
                                
                                this.props.navigation.navigate('SportsHabbits');
                            }).catch((error) => {
                                console.log(error);
                            });
                        }).catch( (error) => {
                            console.log(error);
                        });

                    }

                }).catch( (error) => {
                    console.log(error);
                })
            } catch (error) {
                console.log(error)
            }
        }
      }

      _retrieveData = async () => {
        try {
          const value = await AsyncStorage.getItem('paso1');
          if (value !== null) {
            // We have data!!
            console.log(value);
          }
         } catch (error) {
           // Error retrieving data
         }
      }

    toggleStatus(boton) {
        //console.log(boton);
        if (boton===2){
            this.setState({ 
                statustoggle2: false,
                statustoggle3: true,
                sexo: 'H'
            });
            
        } else if (boton===3) {
            this.setState({ 
                statustoggle2: true,
                statustoggle3: false,
                sexo: 'M'
            });
            
        }
    }

    allergias(boton){
        if (boton===1){
            this.setState({ 
                alergiaYes:true,
                alergiaNo: false,
            });
            
        } else if (boton===2) {
            this.setState({ 
                alergiaYes:false,
                alergiaNo: true
            });
            
        }
    }

    async componentWillMount() {
        await Font.loadAsync({
            'Asap-Bold': require('../assets/fonts/Asap-Bold.ttf'),
            'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });
        this.setState({ fontLoaded: true });
    }

    render() {
        return (
            <View style={{flex:1, backgroundColor: '#447861'}}>
            <KeyboardAvoidingView>
            <ScrollView contentContainerStyle={{backgroundColor: '#447861'}}>
            {
                this.state.fontLoaded ? (
                    <View style={styles.container}>
                        <StatusBar hidden={true} />
                        <View style={{flexDirection:'row', justifyContent:'center', width:'100%'}}>
                            {/* <TouchableOpacity style={{marginLeft:20, marginVertical:20}}>
                                <Entypo name="menu" size={40} color="white"/>
                            </TouchableOpacity> */}
                            <View style={{alignItems:'center', flex:1}}>
                                <Text style={{fontFamily:'Asap-Bold', fontSize:28, color:'rgb(214, 186, 140)', marginTop:24, marginBottom:20}}>
                                Au propos de vous
                                </Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginBottom:30}}>
                            <View>
                                <View style={{ height:10}}>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                    this.toggleStatus(2);
                                    }}
                                >
                                    {(this.state.statustoggle2) &&
                                    <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginRight:10}}>
                                        <Text style={{color: 'rgb(243,165,51)', fontFamily:'Asap-Bold', fontSize:20}}>Mâle</Text>
                                    </View>
                                    }
                                    {(!this.state.statustoggle2) &&
                                    <View style={{elevation:7, backgroundColor:'rgb(243,165,51)', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginRight:10}}>
                                        <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20}}>Mâle</Text>
                                    </View>
                                    }
                                </TouchableOpacity>
                            </View>
                            <View>
                                <View style={{ height:10}}>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                    this.toggleStatus(3);
                                    }}
                                >
                                {(this.state.statustoggle3) &&
                                <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginLeft:10}}>
                                    <Text style={{color: 'rgb(243,165,51)', fontFamily:'Asap-Bold', fontSize:20}}>Femelle</Text>
                                </View>
                                }
                                {(!this.state.statustoggle3) &&
                                <View style={{elevation:7, backgroundColor:'rgb(243,165,51)', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginLeft:10}}>
                                    <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20}}>Femelle</Text>
                                </View>
                                }
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.containerText}>
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: 'white'}}>
                            Quel âge avez-vous?
                            </Text>
                        </View>
                        <View style={styles.containerInput}>
                        <TextInput
                            style={{height: 60, width: 100, borderBottomColor: '#b3b3b3', borderTopColor:'transparent',borderLeftColor:'transparent', borderRightColor:'transparent', borderWidth: 2, textAlign: 'center', color: 'rgb(243,165,51)',fontFamily: 'Poppins-Bold', fontSize: 36}}
                            onChangeText={(edad) => {this.setState({edad});console.log(edad)}}
                            maxLength={3}
                            placeholder={'Âge'}
                            placeholderTextColor={'rgb(243,165,51)'}
                            keyboardType= {'numeric'}
                            underlineColorAndroid={'transparent'}
                            // value={this.state.text}
                        />
                        </View>
                        <View style={styles.containerText}>
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: 'white'}}>
                            Entrez votre taille: {this.state.altura} cm
                            </Text>
                        </View>
                        <ImageBackground source={require('../assets/images/regla.png')} style={{flex:1, alignItems:'stretch'}}>
                        <View style={styles.containerSlider}>
                        <Slider
                            maximumValue={210}
                            step={1}
                            value={this.state.altura}
                            onValueChange={altura => this.setState({ altura })}
                            thumbImage={require('../assets/images/alturac.png')}
                            thumbTintColor={'#FFFFFF'}
                            thumbTouchSize={{width: 40, height: 40}}
                            thumbStyle={{width: 40, height: 40, backgroundColor: 'transparent'}}
                            minimumTrackTintColor={'rgb(243,165,51)'}
                        />
                        </View>
                        </ImageBackground>
                        <View style={styles.containerText}>
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: 'white' }}>
                            Entrez votre poids: {this.state.peso} kg
                            </Text>
                        </View>
                        <ImageBackground source={require('../assets/images/regla.png')} style={{flex:1, alignItems:'stretch'}}>
                        <View style={styles.containerSlider}>
                        <Slider
                            maximumValue={180}
                            step={1}
                            value={this.state.peso}
                            onValueChange={peso => this.setState({ peso })}
                            thumbImage={require('../assets/images/pesac.png')}
                            thumbTintColor={'#FFFFFF'}
                            thumbTouchSize={{width: 40, height: 40}}
                            thumbStyle={{width: 40, height: 40, backgroundColor: 'transparent'}}
                            minimumTrackTintColor={'rgb(243,165,51)'}
                        />
                        </View>
                        </ImageBackground>
                        <View style={styles.containerText}>
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: 'white' }}>
                            Estimez votre % de graisse : {this.state.grasa1}
                            </Text>
                        </View>
                        <ImageBackground source={require('../assets/images/regla.png')} style={{flex:1, alignItems:'stretch'}}>
                        <View style={styles.containerSlider}>
                        <Slider
                            maximumValue={100}
                            step={1}
                            value={this.state.grasa1}
                            onValueChange={grasa1 => this.setState({ grasa1 })}
                            thumbImage={require('../assets/images/abdomenc.png')}
                            thumbTintColor={'#FFFFFF'}
                            thumbTouchSize={{width: 40, height: 40}}
                            thumbStyle={{width: 40, height: 40, backgroundColor: 'transparent'}}
                            minimumTrackTintColor={'rgb(243,165,51)'}
                        />
                        </View>
                        </ImageBackground>
                        <View style={styles.containerText}>
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: 'white' }}>
                            Votre % de graisse souhaité: {this.state.grasa2}
                            </Text>
                        </View>
                        <ImageBackground source={require('../assets/images/regla.png')} style={{flex:1, alignItems:'stretch'}}>
                        <View style={styles.containerSlider}>
                        <Slider
                            maximumValue={100}
                            step={1}
                            value={this.state.grasa2}
                            onValueChange={grasa2 => this.setState({ grasa2 })}
                            thumbImage={require('../assets/images/abdomenc.png')}
                            thumbTintColor={'#FFFFFF'}
                            thumbTouchSize={{width: 40, height: 40}}
                            thumbStyle={{width: 40, height: 40, backgroundColor: 'transparent'}}
                            minimumTrackTintColor={'rgb(243,165,51)'}
                        />
                        </View>
                        </ImageBackground>

                        {/* <View style={styles.containerText}>
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: 'white' }}>
                            As tu des allergies?
                            </Text>
                        </View>

                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center',}}>
                            <View>
                                <View style={{ height:10}}>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.allergias(1);
                                    }}
                                >
                                    {(!this.state.alergiaYes) &&
                                    <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginRight:10}}>
                                        <Text style={{color: 'gray', fontFamily:'Asap-Bold', fontSize:20}}>Oui</Text>
                                    </View>
                                    }
                                    {(this.state.alergiaYes) &&
                                    <View style={{elevation:7, backgroundColor:'rgb(243,165,51)', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginRight:10}}>
                                        <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20}}>Oui</Text>
                                    </View>
                                    }
                                </TouchableOpacity>
                            </View>
                            <View>
                                <View style={{ height:10}}>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.allergias(2);
                                    }}
                                >
                                {(!this.state.alergiaNo) &&
                                <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginLeft:10}}>
                                    <Text style={{color: 'gray', fontFamily:'Asap-Bold', fontSize:20}}>Non</Text>
                                </View>
                                }
                                {(this.state.alergiaNo) &&
                                <View style={{elevation:7, backgroundColor:'rgb(243,165,51)', borderRadius:8, height:60, width:100, justifyContent:'center', alignItems:'center', marginLeft:10}}>
                                    <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20}}>Non</Text>
                                </View>
                                }
                                </TouchableOpacity>
                            </View>
                        </View> */}

                        <View style={{marginTop:40, flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                            <View style={{ flex: 1,margin:10, flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                <View style={{elevation:7, height:60, width:'45%', borderRadius:8, backgroundColor: 'rgb(68,120,97)', justifyContent:'center', alignItems:'center'}}>
                                    <TouchableOpacity style={{height:60, width:'100%', borderRadius:8, justifyContent:'center',backgroundColor: 'rgb(250,204,49)', alignItems:'center'}}
                                        onPress={() => {
                                            // this.props.navigation.goBack();
                                            this._retrieveData();

                                            }}
                                    >
                                        <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white'}}>
                                        Retour
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                
                
                                <View style={{elevation:7, height:60, width:'45%', borderRadius:8, justifyContent:'center',backgroundColor: 'rgb(68,120,97)', alignItems:'center'}}>
                                    <TouchableOpacity style={{height:60, width:'100%', borderRadius:8,justifyContent:'center', alignItems:'center',backgroundColor: 'rgb(214, 186, 140)'}}
                                        onPress={() => {
                                            this._storeData();
                                        }}
                                    >
                                        <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white'}}>
                                        Continuer
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null
            }
                {/* <Text style={{ fontFamily: 'asap-bold', fontSize: 56 }}>Open up App.js to start working on your app!</Text>
                <Text>Open up App.js to start working on your app!</Text> */}
            </ScrollView>
            </KeyboardAvoidingView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
        justifyContent: 'center',
        backgroundColor: '#447861'
    },
    containerSlider: {
        flex: 1,
        marginLeft: 30,
        marginRight: 30,
        // marginBottom: 30,
        // marginTop: 30,
        // alignItems: "stretch",
        justifyContent: "center",
        backgroundColor: 'transparent',
    },
    containerText: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'transparent',
        marginBottom: 30,
        marginTop: 30,
    },
    containerInput: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'transparent',
        // marginBottom: 30,
        // marginTop: 30,
    },
    button: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10
      },
      buttonPress: {
        borderColor: "#000066",
        backgroundColor: "#000066",
        borderWidth: 1,
        borderRadius: 10
    }
});
