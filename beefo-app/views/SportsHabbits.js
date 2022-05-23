import React, { Component } from 'react'
import { View, StatusBar,Text, TouchableOpacity, ScrollView, Image, AsyncStorage } from 'react-native'
import { Font} from 'expo';
import {Entypo} from '@expo/vector-icons';

// import Svg, { Path, Circle, G, Text } from 'react-native-svg'

export default class SportsHabbits extends Component {
  constructor(props){
    super(props)

    this.state = {
      fontLoaded: false,
      day: 1,
    };
  }

  async componentWillMount() {
    
    await Font.loadAsync({
      'Asap-Bold': require('../assets/fonts/Asap-Bold.ttf'),
      'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    });
    this.setState({ fontLoaded: true });
  }


  onModify(value) {

    if(this.state.day<8 && value===1){
        this.setState({
            day: this.state.day+value,
        })

    } else if(this.state.day>1 && value===-1){

        this.setState({
            day: this.state.day+value,
        })

    }

  }

    _storeData = async () => {
        console.log('entro a la funcion');

        var dia_rutina;

        if(this.state.day==1){

            dia_rutina='sedentario';

        } else if(this.state.day==2 || this.state.day==3){

            dia_rutina='ligeramente activo';

        } else if(this.state.day==4 || this.state.day==5){

            dia_rutina='moderadamente activo';

        } else if(this.state.day==6){

            dia_rutina='muy activo';

        } else if(this.state.day==7){

            dia_rutina='diario';

        } else if(this.state.day==8){

            dia_rutina='intenso';

        } 

        try {
            await AsyncStorage.setItem('actividadFisica', dia_rutina);
            console.log('guardando');
        } catch (error) {
            console.log(error)
        // Error saving data
        }
    }

    _retrieveData = async () => {
        try {
            const value = await AsyncStorage.getItem('actividadFisica');
            if (value !== null) {
                // We have data!!
                console.log(value);
            }
        } catch (error) {
        // Error retrieving data
        }
    }

  render() {

    return (

      <View style={{flex:1, backgroundColor: 'rgb(68,120,97)'}}>
        {
          this.state.fontLoaded ? (
            <ScrollView>
            <View style={{flex:1, alignItems:'center', backgroundColor: 'rgb(68,120,97)', paddingVertical:24, }}>
            
              <StatusBar hidden={true} />

              <View style={{flexDirection:'row', justifyContent:'center', width:'100%', paddingHorizontal:24}}>

                {/* <TouchableOpacity style={{marginBottom:12}}>
                  <Entypo name="menu" size={40} color="white"/>
                </TouchableOpacity> */}

                <View style={{alignItems:'center', flex:1}}>

                  <Text style={{fontFamily:'Asap-Bold', fontSize:28, color:'rgb(214, 186, 140)'}}>
                  
Vos habitudes sportives
                  </Text>

                </View>

              </View>

              <View style={{paddingHorizontal:24}}>
                <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white', marginTop:20,}}>
                  
Quelle est l'intensité de votre entraînement?
                </Text>
              </View>

            <View style={{flexDirection:'row', width:'100%', alignContent:'center', justifyContent:'space-around', paddingHorizontal:24}}>

                <TouchableOpacity
                    onPress={() => {
                        this.onModify(-1);
                    }}
                    >
                    
                    <View style={{justifyContent:'center', alignItems:'center', height:88, width:93, paddingTop:35}}>

                        <View style={{elevation:7, position:'absolute', zIndex:9,left:29, top:36,  justifyContent:'center', alignItems:'center'}}>

                            <Entypo name="minus" size={40} color="rgb(68,120,97)"/>

                        </View>

                        <Image 
                          source={require("../assets/images/botonmenos.png")}
                        />

                    </View>
                </TouchableOpacity>

                <View style={{justifyContent:'center', alignItems:'center', width:100}}>
                    <Text style={{color: 'rgb(243,165,51)', fontFamily:'Asap-Bold', fontSize:72}}>{this.props.onValueChange(this.state.day)}</Text>
                    <View style={{position:'absolute', zIndex:9, top:81}}>
                        <Text style={{color: 'rgb(243,165,51)', fontFamily:'Asap-Bold', fontSize:18}}>h/semaine</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        this.onModify(1);
                    }}
                    >
                    
                    <View style={{justifyContent:'center', alignItems:'center', height:88, width:93, paddingTop:35}}>

                        <View style={{elevation:7, position:'absolute', zIndex:9,left:29, top:36,  justifyContent:'center', alignItems:'center'}}>

                            <Entypo name="plus" size={40} color="white"/>

                        </View>

                        <Image 
                          source={require("../assets/images/botonmas.png")}
                        />

                    </View>
                </TouchableOpacity>

            </View>


            <View style={{height:300,justifyContent:'center',width:'100%', alignItems:'center', marginTop:10, marginLeft:15}}>

                <View style={{height:'100%', width:'100%', position:'absolute', flexDirection:'row', zIndex:9, justifyContent:'center', alignItems:'center'}}>
                    
                    <View style={{width:'65%', flexDirection:'row', justifyContent:'flex-end', alignItems:'center'}}>

                        {(this.state.day>=8) &&
                            <View>
                                <Image style={{width:22, height:72}}
                                    source={require("../assets/images/rectangle4.png")}
                                />
                            </View>
                        }

                        {(this.state.day>=7) &&
                            <View>
                                <Image style={{width:22, height:72}}
                                    source={require("../assets/images/rectangle4.png")}
                                />
                            </View>
                        }

                        {(this.state.day>=6) &&
                            <View>
                                <Image style={{width:22, height:137}}
                                    source={require("../assets/images/rectangle3.png")}
                                />
                            </View>
                        }

                        {(this.state.day>=5) &&
                            <View>
                                <Image style={{width:22, height:137}}
                                    source={require("../assets/images/rectangle3.png")}
                                />
                            </View>
                        }

                        {(this.state.day>=4) &&
                            <View>
                                <Image style={{width:22, height:204}}
                                    source={require("../assets/images/rectangle2.png")}
                                />
                            </View>
                        }

                        {(this.state.day>=3) &&
                            <View>
                                <Image style={{width:22, height:204}}
                                    source={require("../assets/images/rectangle2.png")}
                                />
                            </View>
                        }

                        {(this.state.day>=2) &&
                            <View>
                                <Image style={{width:22.1, height:270}}
                                    source={require("../assets/images/rectangle1.png")}
                                />
                            </View>
                        }

                        {(this.state.day>=1) &&
                            <View>
                                <Image style={{width:22.1, height:270}}
                                    source={require("../assets/images/rectangle1.png")}
                                />
                            </View>
                        }


                    </View>

                    <View style={{ width:'35%', flexDirection:'row', alignItems:'center'}}>
                        <View>
                            <Image style={{width:22, height:62}}
                                source={require("../assets/images/marcabarra.png")}
                            />
                        </View>
                        <View style={{marginLeft:30}}>
                            <Image style={{width:60, height:19.2}}
                                source={require("../assets/images/manchasbarra.png")}
                            />
                        </View>
                    </View>
                </View>

                <View style={{alignItems:'flex-end',width:'100%'}}>
                    <Image style={{height:19.2, width:320}}
                        source={require("../assets/images/rectangle9.02.png")}
                    />
                </View>
                

            </View>


            <View style={{marginTop:40, flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%', paddingHorizontal:24}}>
                
                <View style={{elevation:7, height:60, width:'48%', borderRadius:8, backgroundColor: 'rgb(68,120,97)', justifyContent:'center', alignItems:'center'}}>
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
                
    
                
                <View style={{elevation:7, height:60, width:'48%', borderRadius:8, justifyContent:'center',backgroundColor: 'rgb(68,120,97)', alignItems:'center'}}>
                  <TouchableOpacity style={{height:60, width:'100%', borderRadius:8,justifyContent:'center', alignItems:'center',backgroundColor: 'rgb(214, 186, 140)'}}
                  onPress={() => {
                                this._storeData();
                                this._retrieveData();
                                this.props.navigation.navigate('CircleSlider');
                            }
                  }>
                    <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white'}}>
                      Continuer
                    </Text>
                  </TouchableOpacity>
                </View>
               
            </View>
            
          </View>
          </ScrollView>
          
          ) : null
        }
      </View>
    )
  }
}

SportsHabbits.defaultProps = {
    onValueChange: x => x,
}
