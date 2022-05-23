import React, { Component } from 'react'
import { PanResponder, View, Dimensions, StatusBar,Text, TouchableOpacity, ScrollView, AsyncStorage } from 'react-native'
import { Font, Svg } from 'expo';
import {Entypo} from '@expo/vector-icons';

// import Svg, { Path, Circle, G, Text } from 'react-native-svg'

export default class CircleSlider extends Component {
  constructor(props){
    super(props)

    this.state = {
      angle: this.props.value,
      fontLoaded: false,
      statustoggle2: true,
      statustoggle3: true,
      statustoggle4: true,
      day:1,
    };
  }

  async componentWillMount() {
    
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e,gs) => true,
      onStartShouldSetPanResponderCapture: (e,gs) => true,
      onMoveShouldSetPanResponder: (e,gs) => true,
      onMoveShouldSetPanResponderCapture: (e,gs) => true,
      onPanResponderMove: (e,gs) => {
        let xOrigin = this.props.xCenter - (this.props.dialRadius + this.props.btnRadius);
        let yOrigin = this.props.yCenter - (this.props.dialRadius + this.props.btnRadius);
        let a = this.cartesianToPolar(gs.moveX-xOrigin, gs.moveY-yOrigin);
        this.setState({angle: a});

        if(a<=51){

          this.setState({day: 1});

        } else if(a>51 && a<=103){

          this.setState({day: 2});

        } else if(a>103 && a<=154) {

          this.setState({day: 3});

        } else if(a>154 && a<=206) {

          this.setState({day: 4});
          
        } else if(a>206 && a<=257) {

          this.setState({day: 5});
          
        } else if(a>257 && a<=309) {

          this.setState({day: 6});
          
        } else if(a>309 && a<=360) {

          this.setState({day: 7});
          
        }
       
      }
    });
    await Font.loadAsync({
      'Asap-Bold': require('../assets/fonts/Asap-Bold.ttf'),
      'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    });
    this.setState({ fontLoaded: true });
  }

  _storeData = async () => {
      console.log('entro a la funcion');

      var meals = 0;

      if(!this.state.statustoggle2){

        meals=2;

      } else if(!this.state.statustoggle3){

        meals =3;

      } else if(!this.state.statustoggle4){

        meals = 4;

      }


      try {
        await AsyncStorage.setItem('rutinaComida', JSON.stringify({ dia: this.state.day, comida: meals }));
        console.log('guardando');
      } catch (error) {
          console.log(error)
        // Error saving data
      }
  }

  _retrieveData = async () => {
      try {
        const value = await AsyncStorage.getItem('rutinaComida');
        if (value !== null) {
          // We have data!!
          console.log(value);
        }
      } catch (error) {
        // Error retrieving data
      }
  }

  polarToCartesian(angle) {
    let r = this.props.dialRadius;
    let hC = this.props.dialRadius + this.props.btnRadius;
    let a = (angle-90) * Math.PI / 180.0;

    let x = hC + (r * Math.cos(a));
    let y = hC + (r * Math.sin(a));
    return {x,y};
  }

  cartesianToPolar(x,y) {
    let hC = this.props.dialRadius + this.props.btnRadius;

    if (x === 0) {
      return y>hC ? 0 : 180;
    }
    else if (y === 0) {
      return x>hC ? 90 : 270;
    }
    else {
      return (Math.round((Math.atan((y-hC)/(x-hC)))*180/Math.PI) +
        (x>hC ? 90 : 270));
    }
  }

  toggleStatus(boton) {

    //console.log(boton);

    if (boton===2){
      this.setState({    
        statustoggle2: false,
        statustoggle3: true,
        statustoggle4: true,
        
      })
    } else if (boton===3) {
        this.setState({    
          statustoggle2: true,
          statustoggle3: false,
          statustoggle4: true,
          
        })
    } else if (boton===4) {
      this.setState({    
        statustoggle2: true,
        statustoggle3: true,
        statustoggle4: false,
        
      })
    }
  }

  render() {
    let width = (this.props.dialRadius + this.props.btnRadius)*2;
    let bR = this.props.btnRadius;
    let dR = this.props.dialRadius;
    let startCoord = this.polarToCartesian(0);
    let endCoord = this.polarToCartesian(this.state.angle);

    return (

      <View style={{flex:1, backgroundColor: 'rgb(68,120,97)'}}>
        {
          this.state.fontLoaded ? (
            <ScrollView>
            <View style={{flex:1, alignItems:'center', backgroundColor: 'rgb(68,120,97)', padding:24, }}>
            
              <StatusBar hidden={true} />

              <View style={{flexDirection:'row', justifyContent:'center', width:'100%'}}>

                {/* <TouchableOpacity style={{marginBottom:12}}>
                  <Entypo name="menu" size={40} color="white"/>
                </TouchableOpacity> */}

                <View style={{alignItems:'center', flex:1}}>

                  <Text style={{fontFamily:'Asap-Bold', fontSize:28, color:'rgb(214, 186, 140)'}}>
                  Votre plan de repas
                  </Text>

                </View>

              </View>

              <View>
                <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white', marginTop:20, marginBottom:15}}>
                Combien de jours par semaine?
                </Text>
              </View>

              <View style={{position:'absolute', zIndex:9, top:180, alignItems:'center'}}>
                {this.props.onValueChange(this.state.angle)<=51 &&
                  <Text style={{fontFamily:'Asap-Bold',color:'white', fontSize:100}}>
                    1
                  </Text>
                }
                {(this.props.onValueChange(this.state.angle)>51 && this.props.onValueChange(this.state.angle)<=103) &&
                  <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:100}}>
                    2
                  </Text>
                  
                }
                {(this.props.onValueChange(this.state.angle)>103 && this.props.onValueChange(this.state.angle)<=154) &&
                  <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:100}}>
                    3
                  </Text>
                }
                {(this.props.onValueChange(this.state.angle)>154 && this.props.onValueChange(this.state.angle)<=206) &&
                  <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:100}}>
                    4
                  </Text>
                }
                {(this.props.onValueChange(this.state.angle)>206 && this.props.onValueChange(this.state.angle)<=257) &&
                  <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:100}}>
                    5
                  </Text>
                }
                {(this.props.onValueChange(this.state.angle)>257 && this.props.onValueChange(this.state.angle)<=309) &&
                  <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:100}}>
                    6
                  </Text>
                }
                {(this.props.onValueChange(this.state.angle)>309 && this.props.onValueChange(this.state.angle)<=360) &&
                  <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:100}}>
                    7
                  </Text>
                }
                {this.props.onValueChange(this.state.angle)<=51 &&
                  <View style={{position:'relative', zIndex:9, bottom:20}}>
                    <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:16}}>journée</Text>
                  </View>
                }
                {this.props.onValueChange(this.state.angle)>51 &&
                  <View style={{position:'relative', zIndex:9, bottom:20}}>
                   <Text style={{fontFamily:'Asap-Bold', color:'white', fontSize:16}}>journées</Text>
                  </View>
                }
              </View>

            <Svg
              ref="circleslider"
              width={width}
              height={width}>
              <Svg.Circle r={dR}
                cx={width/2}
                cy={width/2}
                stroke='rgb(230, 154, 42)'
                strokeWidth={1}
                fill='none'/>

              <Svg.Path stroke={this.props.meterColor}
                strokeWidth={this.props.dialWidth}
                fill='none'
                d={`M${startCoord.x} ${startCoord.y} A ${dR} ${dR} 0 ${this.state.angle>180?1:0} 1 ${endCoord.x} ${endCoord.y}`}/>

              <Svg.G x={endCoord.x-bR} y={endCoord.y-bR}>
                <Svg.Circle r={bR}
                  cx={bR}
                  cy={bR}
                  fill={this.props.meterColor}
                  {...this._panResponder.panHandlers}/>
                {/* <Svg.Text x={bR}
                  y={bR-(this.props.textSize/2)}
                  fontSize={this.props.textSize}
                  fill={this.props.textColor}
                  textAnchor="middle"
                >
                  {this.props.onValueChange(this.state.angle)+''}
                </Svg.Text> */}
              </Svg.G>
            </Svg>

            <View>
              <Text style={{fontFamily:'Poppins-Bold', fontSize:18, color:'white', marginTop:20, marginBottom:10}}>
              combien de repas par jour?
              </Text>
            </View>

            <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>

              <View>

                <View style={{ height:10}}>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    this.toggleStatus(2);
                  }}
                >
                  {(this.state.statustoggle2) &&
                  <View style={{ justifyContent:'center', alignItems:'center', height:88, width:93}}>

                    <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width:60, justifyContent:'center', alignItems:'center'}}>

                      <Text style={{color: 'rgb(243,165,51)', fontFamily:'Asap-Bold', fontSize:48}}>2</Text>

                    </View>

                  </View>
                  }

                  {(!this.state.statustoggle2) &&
                  <View style={{borderWidth:2, borderColor:'rgb(243,165,51)', justifyContent:'center', alignItems:'center', height:88, width:93}}>

                    <View style={{elevation:7, backgroundColor:'rgb(243,165,51)', borderRadius:8, height:60, width:60, justifyContent:'center', alignItems:'center'}}>

                      <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:48}}>2</Text>

                    </View>

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
                  <View style={{justifyContent:'center', alignItems:'center', height:88, width:93}}>

                    <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width:60, justifyContent:'center', alignItems:'center'}}>

                      <Text style={{color: 'rgb(243,165,51)', fontFamily:'Asap-Bold', fontSize:48}}>3</Text>

                    </View>

                  </View>
                  }

                  {(!this.state.statustoggle3) &&
                  <View style={{ borderWidth:2, borderColor:'rgb(243,165,51)', justifyContent:'center', alignItems:'center', height:88, width:93}}>

                    <View style={{elevation:7, backgroundColor:'rgb(243,165,51)', borderRadius:8, height:60, width:60, justifyContent:'center', alignItems:'center'}}>

                      <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:48}}>3</Text>

                    </View>

                  </View>
                  }

                </TouchableOpacity>

              </View>

              <View style={{}}>

                <View style={{ height:10}}>
                </View>

                {(!this.state.statustoggle4) &&

                  <View style={{position:'absolute', zIndex:9, left:5, bottom:80, paddingHorizontal:2, backgroundColor: 'rgb(68,120,97)'}}>
                    <Text style={{fontFamily:'Asap-Bold', color: 'rgb(243,165,51)', fontSize:11}}>
                    conseillé 
                    </Text>
                  </View>
                }

                <TouchableOpacity
                  onPress={() => {
                    this.toggleStatus(4);
                  }}
                >
                  {(this.state.statustoggle4) &&
                  <View style={{ justifyContent:'center', alignItems:'center', height:88, width:93}}>

                    <View style={{elevation:7, backgroundColor:'white', borderRadius:8, height:60, width:60, justifyContent:'center', alignItems:'center'}}>

                      <Text style={{color: 'rgb(243,165,51)', fontFamily:'Asap-Bold', fontSize:48}}>4</Text>

                    </View>

                  </View>
                  }

                  {(!this.state.statustoggle4) &&

                  
                  <View style={{borderWidth:2, borderColor:'rgb(243,165,51)', justifyContent:'center', alignItems:'center', height:88, width:93}}>

                    <View style={{elevation:7, backgroundColor:'rgb(243,165,51)', borderRadius:8, height:60, width:60, justifyContent:'center', alignItems:'center'}}>

                      <Text style={{color: 'white', fontFamily:'Asap-Bold', fontSize:48}}>4</Text>

                    </View>

                  </View>
                  }

                </TouchableOpacity>
              </View>
            </View>


            <View style={{marginTop:40, flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
                
                <View style={{elevation:7, height:60, width:'48%', borderRadius:8, backgroundColor: 'rgb(68,120,97)', justifyContent:'center', alignItems:'center'}}>
                  <TouchableOpacity style={{height:60, width:'100%', borderRadius:8, justifyContent:'center',backgroundColor: 'rgb(250,204,49)', alignItems:'center'}}
                    onPress={() => this.props.navigation.goBack()}>
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
                        this.props.navigation.navigate('YourSummary');
                    }}
                  >
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

CircleSlider.defaultProps = {
  btnRadius: 20,
  dialRadius: 100,
  dialWidth: 15,
  meterColor: 'rgb(250, 204, 49)',
  textColor: '#fff',
  textSize: 10,
  value: 0,
  xCenter: Dimensions.get('window').width/2,
  yCenter: Dimensions.get('window').height/2,
  onValueChange: x => x,
}