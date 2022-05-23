import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Image, AsyncStorage, ImageBackground, ActivityIndicator } from 'react-native';
import { Font } from 'expo';
import {MaterialCommunityIcons, Entypo} from '@expo/vector-icons';
import axios from 'axios';
import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: 'DrawerNav' })],
});

export default class YourProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = { 
            loading: true,
            count: 0,
            fontLoaded: false,
            name:'',
            age: 0,
            poids: 0,
            taille: 0,
            lipids: 0,
            glucides: 0,
            proteins:0,
            kcalories:0,
            image:'',
            statustoggle2: true,
            statustoggle3: true,
            text: 'Useless Placeholder',
            porcentaje: 0,
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

    obtenerDatos = () => {
        var loginInfo = AsyncStorage.getItem('loginInfo');

		loginInfo.then( (loginInfo) => {

            
			loginInfo = JSON.parse(loginInfo)

			axios.get(`http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/api/v1/user/${loginInfo.userId}`).then(resp => {

            
				
				this.setState({image: `http://ec2-54-185-155-220.us-west-2.compute.amazonaws.com/uploads/usersImages/${resp.data.user.profileImage}`});
                
                this.setState({
                    name: resp.data.user.name,
                    age:resp.data.user.edad,
                    poids:resp.data.user.peso,
                    taille: resp.data.user.altura,
                    lipids: resp.data.user.lipidos,
                    glucides: resp.data.user.carbohidratos,
                    proteins: resp.data.user.proteinas,
                    kcalories: resp.data.user.DEJ,
                });

                const platos = AsyncStorage.getItem('platosYPrecioTotal');

                platos.then((platos)=>{

                    var array=JSON.parse(platos);
                    var proteinasTotal=0;
                    var lipidosTotal=0;
                    var caloriasTotal=0;
                    var carbohidratosTotal=0;

                    for(let i=0; i<array.meals.length;i++){
                        proteinasTotal = proteinasTotal + array.meals[i].proteins;
                        lipidosTotal = lipidosTotal + array.meals[i].lipids;
                        caloriasTotal = caloriasTotal + parseFloat(array.meals[i].description);
                        carbohidratosTotal = carbohidratosTotal + array.meals[i].carbohydrates;
                    }

                    let lipidos = lipidosTotal/resp.data.user.lipidos;
                    let proteinas = proteinasTotal/resp.data.user.proteinas;
                    let calorias = caloriasTotal/resp.data.user.DEJ;
                    let carbohidratos = carbohidratosTotal/resp.data.user.carbohidratos;

                    if (lipidos > 1) {
                        lipidos = 1;
                    }

                    if (proteinas > 1) {
                        proteinas = 1;
                    }

                    if (calorias > 1) {
                        calorias = 1;
                    }

                    if (carbohidratos > 1) {
                        carbohidratos = 1;
                    }

                    let total = 25*lipidos + 25*proteinas + 25*calorias + 25*carbohidratos;
                
                    this.setState({porcentaje: total.toFixed(2)});
                    this.setState({loading: false});
                }).catch((error)=>{
                    console.log(error);
                });
			}).catch((error) => {
				console.log(error);
			});
		}).catch( (error) => {
			console.log(error);
        });
    }

    componentDidMount() {
        var fuente = Font.loadAsync({
            'Asap-Bold': require('../assets/fonts/Asap-Bold.ttf'),
            'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });

        fuente.then( () => {
            this.setState({fontLoaded: true});
            this.setState({loading: 'true'});
            this.obtenerDatos();
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
            {
                this.state.fontLoaded ? (
                    <View style={styles.container}>
                        <StatusBar hidden={true} />
                        <View style={{flexDirection:'row', justifyContent:'flex-start', width:'100%'}}>
                            <TouchableOpacity style={{marginLeft:20, marginVertical:20}}
                                onPress={() => this.props.navigation.openDrawer()}>
                                <Entypo name="menu" size={40} color="white"/>
                            </TouchableOpacity>

                            <View style={{alignItems:'center', flex:1}}>
                                <Text style={{fontFamily:'Asap-Bold', fontSize:28, color:'rgb(214, 186, 140)', marginTop:24, marginBottom:20}}>
                                    Votre profil
                                </Text>            
                            </View>

                            <TouchableOpacity style={{marginRight:20, marginVertical:20,}}
                                onPress={() => this.props.navigation.navigate('EditProfile')}>
                                <MaterialCommunityIcons name="pencil-circle" size={40} color="rgb(250,204,49)"/>
                            </TouchableOpacity>
                            
                        </View>

                        <View style={{alignItems:'center',}}>
                            <Text style={{fontFamily:'Asap-Bold', fontSize:20, color:'white', marginTop:24,}}>
                                {this.state.name}
                            </Text>                               
                        </View>

                        <View style={styles.container}>
                            <View style={{position: 'absolute', zIndex:9, left:5}}>
                                <ImageBackground source={{ uri: this.state.image }} style={{height: 65, width:65}} borderRadius={50}></ImageBackground>
                            </View>
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

                        <View style={styles.containerText}>
                            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 20, color: 'white', textAlign: 'center' }}>
                            Besoins journaliers satisfaits grâce aux plats Be.Foo
                            </Text>
                        </View>

                        <View style={[styles.container, {marginBottom:30}]}>
                            <View style={{flexDirection:'row', position:'absolute', zIndex:9, width:200, marginLeft:50, paddingLeft:20, left:22, top:20}}>
                                <Text style={{color:'white', fontFamily: 'Poppins-Bold', fontSize: 30}}>{this.state.porcentaje}%</Text>
                            </View>
                            <Image source={require('../assets/images/Beefoo.png')} style={{height:89, width:292}}></Image>
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
