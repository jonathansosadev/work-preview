import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, StatusBar, ScrollView, TextInput, ImageBackground, Image, KeyboardAvoidingView, Dimensions, AsyncStorage } from 'react-native';
import { Font } from 'expo';
import {Entypo, Feather} from '@expo/vector-icons';
import axios from 'axios';
import Slider from "react-native-slider";
import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'DrawerNav' })],
});


export default class EditAllergy extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
            fontLoaded: false,
            statustoggle1: true,
            statustoggle2: true,
            statustoggle3: true,
            statustoggle4: true,
            statustoggle5: true,
            statustoggle6: true,
            statustoggle7: true,
            statustoggle8: true,
            statustoggle9: true,
            statustoggle10: true,
            statustoggle11: true,
            statustoggle12: true,
            statustoggle13: true,
        }
    }

    async componentWillMount() {

        const jj = await AsyncStorage.getItem('alergias');


        const alergia = JSON.parse(jj);


        for(let i=0; i<alergia.length; i++){


            if(alergia[i]=="LAIT"){
                
                this.setState({statustoggle1: false});
            } else
    
            if(alergia[i]=="DES ŒUFS"){
                
                this.setState({statustoggle2: false});
            } else
    
            if(alergia[i]=="CACAHUÈTES"){
                
                this.setState({statustoggle3: false});
            } else
    
            if(alergia[i]=="NOIX"){
                
                this.setState({statustoggle4: false});
            } else
    
            if(alergia[i]=="SOJA"){
                
                this.setState({statustoggle5: false});
            } else
    
            if(alergia[i]=="BLÉ"){
                
                this.setState({statustoggle6: false});
            } else
    
            if(alergia[i]=="POISSON"){
                
                this.setState({statustoggle7: false});
            } else
    
            if(alergia[i]=="FRUITS DE MER"){
                
                this.setState({statustoggle8: false});
            } else
    
            if(alergia[i]=="MAÏS"){
                
                this.setState({statustoggle9: false});
            } else
    
            if(alergia[i]=="GÉLATINE"){
                
                this.setState({statustoggle10: false});
            }

            if(alergia[i]=="VIANDE"){
                
                this.setState({statustoggle11: false});
            }

            if(alergia[i]=="DES GRAINES"){
                
                this.setState({statustoggle12: false});
            }

            if(alergia[i]=="ÉPICES"){
                
                this.setState({statustoggle13: false});
            }


        }

        

        await Font.loadAsync({
            'Asap-Bold': require('../assets/fonts/Asap-Bold.ttf'),
            'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });
        this.setState({ fontLoaded: true });

        
    }

    _storeData = () => {
        var array_alergias = [];

        if(!this.state.statustoggle1){
            array_alergias.push('LAIT');
        }

        if(!this.state.statustoggle2){
            array_alergias.push('DES ŒUFS');
        }

        if(!this.state.statustoggle3){
            array_alergias.push('CACAHUÈTES');
        }

        if(!this.state.statustoggle4){
            array_alergias.push('NOIX');
        }

        if(!this.state.statustoggle5){
            array_alergias.push('SOJA');
        }

        if(!this.state.statustoggle6){
            array_alergias.push('BLÉ');
        }

        if(!this.state.statustoggle7){
            array_alergias.push('POISSON');
        }

        if(!this.state.statustoggle8){
            array_alergias.push('FRUITS DE MER');
        }

        if(!this.state.statustoggle9){
            array_alergias.push('MAÏS'); 
        }

        if(!this.state.statustoggle10){
            array_alergias.push('GÉLATINE'); 
        }

        if(!this.state.statustoggle11){
            array_alergias.push('VIANDE'); 
        }

        if(!this.state.statustoggle12){
            array_alergias.push('DES GRAINES'); 
        }

        if(!this.state.statustoggle13){
            array_alergias.push('ÉPICES'); 
        }

        try {
            AsyncStorage.setItem('alergias', JSON.stringify(array_alergias));
            const loginInfo = AsyncStorage.getItem('loginInfo');
            

            loginInfo.then( (loginInfo) => {
                
                var cadena =  JSON.parse(loginInfo);
                axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/update-user/${cadena.userId}`,{
                    allergies: array_alergias,
                }).then(resp => {
                    
                    //this.props.navigation.navigate('EditProfile');
                    this.props.navigation.dispatch(resetAction);
                }).catch((error) => {
                    console.log(error);
                });
            }).catch( (error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error)
          // Error saving data
        }
    }
  
    _retrieveData = async () => {
        try {
          const value = await AsyncStorage.getItem('alergias');
          if (value !== null) {
            // We have data!!
            // console.log(value);
          }
        } catch (error) {
          // Error retrieving data
        }
    }

    render() {
        var {height, width} = Dimensions.get('window');
        var ancho = width;
        return (
            <View style={{flex:1, backgroundColor: '#447861'}}>

            <ScrollView contentContainerStyle={{backgroundColor: '#447861'}}>
            {
                this.state.fontLoaded ? (
                    <View style={styles.container}>
                        <StatusBar hidden={true} />
                        <View style={{flexDirection:'row', justifyContent:'flex-start', width:'100%'}}>
                            <View style={{alignItems:'center', flex:1}}>
                                <Text style={{fontFamily:'Asap-Bold', fontSize:28, color:'rgb(214, 186, 140)', marginTop:24, marginBottom:10}}>
                                Les allergies
                                </Text>
                            </View>
                        </View>
                        <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
                                <Text style={{fontFamily:'Poppins-Bold', fontSize:20, color:'white', textAlign:'center', margin:10}}>
                                Modifier les allergies
                                </Text>
                        </View>  
                        <View style={{height:20}}></View>    
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                            <ImageBackground source={require('../assets/images/milk.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle1: !this.state.statustoggle1
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle1) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>LAIT</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle1) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>LAIT</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle1) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle1) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View> 
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/egg.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle2: !this.state.statustoggle2
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle2) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}> DES ŒUFS </Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle2) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}> DES ŒUFS </Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle2) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle2) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View>  
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/penaut.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle3: !this.state.statustoggle3
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle3) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>CACAHUÈTES</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle3) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>CACAHUÈTES</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle3) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle3) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View> 
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/tree.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle4: !this.state.statustoggle4
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle4) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>NOIX</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle4) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>NOIX</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle4) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle4) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/soy.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle5: !this.state.statustoggle5
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle5) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>SOJA</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle5) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>SOJA</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle5) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle5) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/wheat.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle6: !this.state.statustoggle6
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle6) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>BLÉ</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle6) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>BLÉ</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle6) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle6) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View>   
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/fish.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle7: !this.state.statustoggle7
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle7) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>POISSON</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle7) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>POISSON</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle7) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle7) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View> 
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/shellfish.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle8: !this.state.statustoggle8
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle8) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>FRUITS DE MER</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle8) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>FRUITS DE MER</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle8) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle8) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View>   
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/corn.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle9: !this.state.statustoggle9
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle9) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>MAÏS</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle9) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>MAÏS</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle9) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle9) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View>  
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/gelatin.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle10: !this.state.statustoggle10
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle10) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>GÉLATINE</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle10) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>GÉLATINE</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle10) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle10) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View> 
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/meat.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle11: !this.state.statustoggle11
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle11) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>VIANDE</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle11) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>VIANDE</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle11) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle11) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View> 
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/seed.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle12: !this.state.statustoggle12
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle12) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>
DES GRAINES</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle12) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>
DES GRAINES</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle12) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle12) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>
                        <View style={{height:26}}></View> 
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={require('../assets/images/spice.png')} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}}></ImageBackground>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                statustoggle13: !this.state.statustoggle13
                                            });
                                        }}
                                    >
                                        {(this.state.statustoggle13) &&
                                            <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>ÉPICES</Text>
                                            </View>
                                        }
                                        {(!this.state.statustoggle13) &&
                                            <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:60, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                                <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:20, marginLeft: 0.25*ancho}}>ÉPICES</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                                {(this.state.statustoggle13) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="circle" size={35} color="rgb(243,165,51)"/>
                                    </View>
                                }
                                {(!this.state.statustoggle13) &&
                                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                        <Feather name="check" size={35} color="white"/>
                                    </View>
                                }
                        </View>                          
                        <View style={{marginTop:40, flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                            <View style={{ flex: 1,margin:10, flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                <View style={{elevation:7, height:60, width:'45%', borderRadius:8, backgroundColor: 'rgb(68,120,97)', justifyContent:'center', alignItems:'center'}}>
                                    <TouchableOpacity style={{height:60, width:'100%', borderRadius:8, justifyContent:'center',backgroundColor: 'rgb(250,204,49)', alignItems:'center'}}
                                        onPress={() => {
                                            this.props.navigation.goBack();
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
                                            // this._retrieveData();
                                        }}
                                    >
                                        <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white'}}>
                                            Modifier
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null
            }
            </ScrollView>
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
