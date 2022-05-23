import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, TextInput, ImageBackground, KeyboardAvoidingView, Dimensions, AsyncStorage, FlatList } from 'react-native';
import { Font } from 'expo';
import {Entypo, Feather, Ionicons} from '@expo/vector-icons';
import axios from 'axios';
import Slider from "react-native-slider";

export default class MealPlan extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
            fontLoaded: false,
            statustoggle1: false,
            statustoggle2: false,
            statustoggle3: false,
            statustoggle4: false,
            statustoggle5: false,
            statustoggle6: false,
            statustoggle7: false,
            statustoggle8: false,
            statustoggle9: false,
            statustoggle10: false,
            numeroDePlatos: 0,
            dishes:'',
            
        }
        this.DISH= {}
        

    }

    obtenerPlatos = () => {

        const platos = AsyncStorage.getItem('platosYPrecioTotal');

        platos.then((platos)=>{

            var array=JSON.parse(platos);
            //console.log(array.meals);
            this.DISH = array.meals;

        }).catch((error)=>{

            console.log(error);

        });

    
    }

  

    async componentWillMount() {
        
        this.obtenerPlatos();
        
        await Font.loadAsync({
            'Asap-Bold': require('../assets/fonts/Asap-Bold.ttf'),
            'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
            'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        });
        this.setState({ fontLoaded: true });
        

        var numero = await AsyncStorage.getItem('numeroDePlatos');
        this.setState({ numeroDePlatos: numero });
        

    }

    cambioStatusToggle(indice){

        

        if(indice==1){
            this.setState({
                statustoggle1: !this.state.statustoggle1
            });
        }

        if(indice==2){
            this.setState({
                statustoggle2: !this.state.statustoggle2
            });
        }

        if(indice==3){
            this.setState({
                statustoggle3: !this.state.statustoggle3
            });
        }

        if(indice==4){
            this.setState({
                statustoggle4: !this.state.statustoggle4
            });
        }

        if(indice==5){
            this.setState({
                statustoggle5: !this.state.statustoggle5
            });
        }

        if(indice==6){
            this.setState({
                statustoggle6: !this.state.statustoggle6
            });
        }

        if(indice==7){
            this.setState({
                statustoggle7: !this.state.statustoggle7
            });
        }

        if(indice==8){
            this.setState({
                statustoggle8: !this.state.statustoggle8
            });
        }

        if(indice==9){
            this.setState({
                statustoggle9: !this.state.statustoggle9
            });
        }

        if(indice==10){
            this.setState({
                statustoggle10: !this.state.statustoggle10
            });
        }

    }
  
    _retrieveData = async () => {
        try {
          const value = await AsyncStorage.getItem('alergias');
          if (value !== null) {
            // We have data!!
            console.log(value);
          }
        } catch (error) {
          // Error retrieving data
        }
    }

    

    render() {
        var {height, width} = Dimensions.get('window');
        var ancho = width;

        var auxiliar=[];

        var data = this.DISH;

        

        for(let i=1; i<data.length+1; i++){

            var estado = 'statustoggle'+i;
            

            auxiliar.push(

                <View key={i}>
                    <View style={{height:20}}></View>

                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor: '#447861'}}>
                        <ImageBackground source={{uri:`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/uploads/dishImages/${data[i-1].image}`}} style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:80, width:80, position:'absolute', zIndex:9, right: 0.68*ancho, borderRadius:10}} borderRadius={10}></ImageBackground>
                            <View>
                                <TouchableOpacity
                                   
                                >
                                    {(this.state[estado]) &&
                                        <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:90, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                            <Text style={{color: 'rgb(133,133,133)', fontFamily:'Asap-Bold', fontSize:16, marginLeft: 0.25*ancho}}>{data[i-1].name}</Text>
                                            <Text style={{color: 'rgb(133,133,133)', fontFamily:'Poppins-Regular', fontSize:14, marginLeft: 0.25*ancho}}>{data[i-1].description}Cal</Text>
                                        </View>
                                    }
                                    {(!this.state[estado]) &&
                                        <View style={{elevation:7, backgroundColor:'rgb(250,204,49)', borderRadius:8, height:90, width: 0.75*width, justifyContent:'center', alignItems:'flex-start'}}>
                                            <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:16, marginLeft: 0.25*ancho}}>{data[i-1].name}</Text>
                                            <Text style={{color: 'white', fontFamily:'Poppins-Regular', fontSize:14, marginLeft: 0.25*ancho}}>{data[i-1].description}Cal</Text>
                                        </View>
                                    }
                                </TouchableOpacity>
                            </View>
                            {(this.state[estado]) &&
                                <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'white', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                    <Feather name="plus" size={35} color="rgb(243,165,51)"/>
                                </View>
                            }
                            {(!this.state[estado]) &&
                                <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', height:40, width:40, backgroundColor:'rgb(243,165,51)', position:'absolute', zIndex:9, left: 0.81*ancho, borderRadius:50}}>
                                    <Feather name="plus" size={35} color="white"/>
                                </View>
                            }
                    </View>
                </View>

            )
        }


        return (
            <View style={{flex:1, backgroundColor: '#447861'}}>

                <ScrollView contentContainerStyle={{backgroundColor: '#447861'}}>
                {
                    this.state.fontLoaded ? (
                        <View style={{}}>
                            <StatusBar hidden={true} />

                            <View style={{flexDirection:'row', justifyContent:'flex-start', width:'100%'}}>
                                <TouchableOpacity style={{marginLeft:20, marginVertical:20}}
                                    onPress={() => this.props.navigation.goBack()}>
                                    <Ionicons name="ios-arrow-back" size={40} color="white"/>
                                </TouchableOpacity>
                                <View style={{alignItems:'center', flex:1}}>
                                    <Text style={{fontFamily:'Asap-Bold', fontSize:28, color:'rgb(214, 186, 140)', marginTop:24, marginBottom:20}}>
                                        Mon plan de repas
                                    </Text>
                                </View>
                            </View>
                            <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
                                    <Text style={{fontFamily:'Poppins-Bold', fontSize:20, color:'white', textAlign:'center', margin:10}}>
                                        Choisissez {this.state.numeroDePlatos} des repas suivants
                                    </Text>
                            </View>

                            {/*Cada item*/}

                            {auxiliar}
                            

                            {/*Aqui termina cada item*/}

                        
                            <View style={{marginTop:40, flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                                <View style={{ flex: 1,margin:10, flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                    {/* <View style={{elevation:7, height:60, width:'45%', borderRadius:8, backgroundColor: 'rgb(68,120,97)', justifyContent:'center', alignItems:'center'}}>
                                        <TouchableOpacity style={{height:60, width:'100%', borderRadius:8, justifyContent:'center',backgroundColor: 'rgb(250,204,49)', alignItems:'center'}}
                                            onPress={() => {
                                                
                                                this.props.navigation.goBack();
                                            }}
                                        >
                                            <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white'}}>
                                            Retour
                                            </Text>
                                        </TouchableOpacity>
                                    </View> */}
                                    {/* <View style={{elevation:7, height:60, width:'100%', borderRadius:8, justifyContent:'center',backgroundColor: 'rgb(68,120,97)', alignItems:'center'}}>
                                        <TouchableOpacity style={{height:60, width:'100%', borderRadius:8,justifyContent:'center', alignItems:'center',backgroundColor: 'rgb(214, 186, 140)'}}
                                        onPress={() => {
                                            
                                            this.props.navigation.navigate('DrawerNav');
                                        }}
                                        >
                                            <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white'}}>
                                                Confirmer
                                            </Text>
                                        </TouchableOpacity>
                                    </View> */}
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
