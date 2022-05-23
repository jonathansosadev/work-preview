import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Image, AsyncStorage, ActivityIndicator } from 'react-native';
import { Font } from 'expo';
import axios from 'axios';

export default class YourSummary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
            loading: true,
            count: 0,
            fontLoaded: false,
            statustoggle2: true,
            statustoggle3: true,
            text: 'Useless Placeholder',
            age: 0,
            poids: 0,
            taille: 0,
            lipids: 0,
            glucides: 0,
            proteins:0,
            kcalories:0,
            
        }
    }

    toggleStatus(boton) {
        if (boton===2){
            this.setState({ 
                statustoggle2: false,
                statustoggle3: true,
            })
        } else if (boton===3) {
            this.setState({ 
                statustoggle2: true,
                statustoggle3: false,
            })
        }
    }

    algoritmo = () => {
        try {
            var meta = AsyncStorage.getItem('meta');
            var paso1 = AsyncStorage.getItem('paso1');
            var actividadFisica = AsyncStorage.getItem('actividadFisica');
            var loginInfo = AsyncStorage.getItem('loginInfo');
            meta.then( (meta) => {
                paso1.then( (paso1) => {
                    actividadFisica.then( (actividadFisica) => {
                        loginInfo.then( (loginInfo) => {
                            var cadena = JSON.parse(paso1);
                            var cadena2 =  JSON.parse(loginInfo);
                            axios.post(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/algorithm-calculation/${cadena2.userId}`,{
                                peso: cadena.peso,
                                altura: cadena.altura,
                                edad: cadena.edad,
                                sexo: cadena.sexo,
                                actividadFisica: actividadFisica,
                                meta: meta,
                            }).then(resp => {
                                console.log(resp.data.user);
                                
                                this.setState({
                                    age:resp.data.user.edad,
                                    poids:resp.data.user.peso,
                                    taille: resp.data.user.altura,
                                    lipids: resp.data.user.lipidos,
                                    glucides: resp.data.user.carbohidratos,
                                    proteins: resp.data.user.proteinas,
                                    kcalories: resp.data.user.DEJ,
                                });

                                try {
                                    platos = AsyncStorage.setItem('numeroDePlatos', JSON.stringify(resp.data.user.numeroDePlatos));
                                    platos.then( () => {
                                        this.setState({loading: false});
                                    }).catch( (error) => {
                                        console.log(error);
                                    });
                                } catch (error) {
                                    console.log('Error al guardar en el storage');
                                }
                            }).catch((error) => {
                                console.log(error);
                            });
                        }).catch( (error) => {
                            console.log(error);
                        });
                    }).catch( (error) => {
                        console.log(error);
                    });
                }).catch( (error) => {
                    console.log(error);
                });
            }).catch( (error) => {
                console.log(error);
            });
        } catch (error) {
            console.log(error)
        }
    }
    
    componentDidMount() {
        var fuente = Font.loadAsync({
            'Asap-Bold': require('../assets/fonts/Asap-Bold.ttf'),
            'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });

        fuente.then( () => {
            this.setState({fontLoaded: true});
            this.setState({loading: 'true'});
            this.algoritmo();
        });
      }  

    render() {
        if (this.state.loading === 'true') {
            return (
              <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#447861'}}>
                  <ActivityIndicator 
                      size="large" 
                      color="rgb(250,204,49)" 
                      animating={true}
                      style={{alignSelf: 'center'}}
                  />
              </View>
            );
        }

        return (
            <View style={{flex:1, backgroundColor: '#447861'}}>
                <ScrollView contentContainerStyle={{backgroundColor: '#447861'}}>
                    { this.state.fontLoaded ? (
                        <View style={styles.container}>
                            <StatusBar hidden={true} />
                            <View style={{flexDirection:'row', justifyContent:'flex-start', width:'100%'}}>
                                <View style={{alignItems:'center', flex:1}}>
                                    <Text style={{fontFamily:'Asap-Bold', fontSize:28, color:'rgb(214, 186, 140)', marginTop:24, marginBottom:20}}>
                                        Votre résumé
                                    </Text>
                                </View>
                            </View>
                            <View style={{ height:10}}>
                            </View>
                            <View style={styles.container}>
                                <View style={{flexDirection:'row', position: 'absolute', zIndex:9, justifyContent:'space-between', width:140, marginLeft:50, left:48, top:35}}>
                                    <View>
                                        <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 12}}>{this.state.age}</Text>
                                    </View>

                                    <View>
                                        <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 12}}>{this.state.taille}</Text>
                                    </View>

                                    <View>
                                        <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 12}}>{this.state.poids}</Text>
                                    </View>
                                </View>
                                <View>
                                    <Image source={require('../assets/images/Graficox3.png')} style={{height:75, width:292}}></Image>
                                </View>
                            </View>
                            <View style={{ height:25}}>
                            </View>
                            <View style={styles.container}>
                                <View style={{flexDirection:'row', position:'absolute', zIndex:9, width:200, marginLeft:50, paddingLeft:20, left:22, top:20}}>
                                    <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 30}}>{this.state.lipids}g</Text>
                                </View>
                                <Image source={require('../assets/images/Lipidsx3.png')} style={{height:89, width:292}}></Image>
                            </View>
                            <View style={{ height:15}}>
                            </View>
                            <View style={styles.container}>
                                <View style={{flexDirection:'row', position:'absolute', zIndex:9, width:200, marginLeft:50, paddingLeft:20, left:22, top:20}}>
                                    <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 30}}>{this.state.glucides}g</Text>
                                </View>
                                <Image source={require('../assets/images/Glucidesx3.png')} style={{height:89, width:292}}></Image>
                            </View>
                            <View style={{ height:15}}>
                            </View>
                            <View style={styles.container}>
                                <View style={{flexDirection:'row', position:'absolute', zIndex:9, width:200, marginLeft:50, paddingLeft:20, left:22, top:20}}>
                                    <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 30}}>{this.state.proteins}g</Text>
                                </View>
                                <Image source={require('../assets/images/Proteinsx3.png')} style={{height:89, width:292}}></Image>
                            </View>
                            <View style={{ height:15}}>
                            </View>
                            <View style={styles.container}>
                                <View style={{flexDirection:'row', position:'absolute', zIndex:9, width:200, marginLeft:50, paddingLeft:20, left:22, top:20,}}>
                                    <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 30}}>{this.state.kcalories}g</Text>
                                </View>
                                <Image source={require('../assets/images/Kcaloriesx3.png')} style={{height:89, width:292}}></Image>
                            </View>
                            <View style={{ height:15}}>
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
                                                this.props.navigation.navigate('MealPlan');
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
                    ) : null }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: '#447861'
    },
    containerSlider: {
        flex: 1,
        marginLeft: 30,
        marginRight: 30,
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
