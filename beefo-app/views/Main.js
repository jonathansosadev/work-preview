import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, Image, FlatList, ImageBackground, AsyncStorage } from 'react-native';
import { Font } from 'expo';
import { Entypo } from '@expo/vector-icons';
import Accordion from 'react-native-collapsible/Accordion';
import * as Animatable from 'react-native-animatable';

const options = [
	{
		name: 'DÉBUTANTE',
		fire: 1
	},
	{
		name: 'AMATRICE',
		fire: 2
	},
	{
		name: 'PROFESSIONNELLE',
		fire: 3,
	}
]

const CONTENT = [
  {
    title: 'Maigre',
    content: options,
  },
  {
    title: 'En bonne santé',
    content: options,
  },
  {
    title: 'Se muscler',
    content: options,
  },
];

export default class Login extends React.Component {
	state = {
	    fontLoaded: false,
		activeSections: [],
	};

	async componentWillMount() {
	    await Font.loadAsync({
	      'asap-bold': require('../assets/fonts/Asap-Bold.ttf'),
	      'poppins-regular': require('../assets/fonts/Poppins-Regular.ttf'),
	      'poppins-medium': require('../assets/fonts/Poppins-Medium.ttf'),
	      'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
	    });
	    this.setState({ fontLoaded: true });
	}

	_storeData = async (estado) => {
        console.log('entro a la funcion');
        try {
          await AsyncStorage.setItem('meta', estado);
          console.log('guardando');
        } catch (error) {
            console.log(error)
          // Error saving data
        }
	}
	
	_retrieveData = async () => {
        try {
          const value = await AsyncStorage.getItem('meta');
          if (value !== null) {
            // We have data!!
            console.log(value);
          }
         } catch (error) {
           // Error retrieving data
         }
    }

	onModify(title, level) {

		//console.log(`${title} y ${level}`);

		var nivel;
		var titulo;

		if(level=='PROFESSIONNELLE'){
			
			nivel='intenso';

		} else if(level=='DÉBUTANTE'){
			nivel='ligero';

		} else if(level=='AMATRICE'){
			nivel='moderado';

		}

		if(title=='Maigre'){
			titulo='bajado';

		} else if(title=='En bonne santé'){
			titulo='normal';

		} else if(title=='Se muscler'){
			titulo='aumento';

		}

		var estado = titulo + ' ' + nivel;

		this._storeData(estado);
		this._retrieveData();

		
	}

	renderFire(quantity) {
		if (quantity == 1)
			return <Image source={require('../assets/images/fireCopy2.png')} style={{resizeMode: 'contain'}}/>;
		if (quantity == 2)
			return (
				<View style={{flexDirection:'row', justifyContent:'flex-end', alignItems:'center'}}>
					<View style={{marginRight: 3}}>
	              		<Image source={require('../assets/images/fireCopy4.png')} style={{resizeMode: 'contain'}}/>
	              	</View>
	              	<Image source={require('../assets/images/fireCopy2.png')} style={{resizeMode: 'contain'}}/>
	              </View>
				);
		if (quantity == 3)
			return (
				<View style={{flexDirection:'row', justifyContent:'flex-end', alignItems:'center'}}>
	              	<View style={{marginRight: 3}}>
	              		<Image source={require('../assets/images/fireCopy6.png')} style={{resizeMode: 'contain'}}/>
	              	</View>
	              	<View style={{marginRight: 3}}>
	              		<Image source={require('../assets/images/fireCopy4.png')} style={{resizeMode: 'contain'}}/>
	              	</View>
	              	<Image source={require('../assets/images/fireCopy2.png')} style={{resizeMode: 'contain'}}/>
	              </View>
				);
		return null;
	}

	renderColap(title, isActive){
		if(title == 'Maigre') {
			return (
				<ImageBackground source={require('../assets/images/grupo1_3x.png')} style={styles.colap}>
		      		<Animatable.Text
		      			style={styles.textColapAct, isActive ? styles.textColapInact : styles.textColapInact}
		      			animation={isActive ? 'bounceIn' : undefined}>
		      			{title}
		      		</Animatable.Text>
	      		</ImageBackground>
			);
		}
		if(title == 'En bonne santé' && !isActive) {
			return (
				<ImageBackground source={require('../assets/images/grupo2_3x.png')} style={styles.colap}>
		      		<Animatable.Text
		      			style={styles.textColapAct, isActive ? styles.textColapAct : styles.textColapInact}
		      			animation={isActive ? 'bounceIn' : undefined}>
		      			{title}
		      		</Animatable.Text>
	      		</ImageBackground>
			);
		}
		if(title == 'En bonne santé' && isActive) {
			return (
				<ImageBackground source={require('../assets/images/grupo2d_3x.png')} style={styles.colap}>
		      		<Animatable.Text
		      			style={styles.textColapAct, isActive ? styles.textColapAct : styles.textColapInact}
		      			animation={isActive ? 'bounceIn' : undefined}>
		      			{title}
		      		</Animatable.Text>
	      		</ImageBackground>
			);
		}
		if(title == 'Se muscler') {
			return (
				<ImageBackground source={require('../assets/images/grupo3_3x.png')} style={styles.colap}>
		      		<Animatable.Text
		      			style={styles.textColapAct, isActive ? styles.textColapInact : styles.textColapInact}
		      			animation={isActive ? 'bounceIn' : undefined}>
		      			{title}
		      		</Animatable.Text>
	      		</ImageBackground>
			);
		}
	}

	setSections = sections => {
	    this.setState({
	      activeSections: sections.includes(undefined) ? [] : sections,
	    });
  	};

	renderHeader = (section, _, isActive) => {
	    return this.renderColap(section.title, isActive);
	};

	renderContent = (section, _, isActive) => {
	    return (
	        <FlatList
	          data={section.content}
	          renderItem={({item}) =>
	            <TouchableOpacity style={styles.optionBox}
	            	onPress={() => {
								this.onModify(section.title, item.name);
								this.props.navigation.navigate('AboutYou')
							}
					}>
		            <Text style={styles.textOption}>{item.name}</Text>
		            { this.renderFire(item.fire) }
	            </TouchableOpacity>
	          }
	          keyExtractor={item => item.name}
	        />
	    );
	  }

	render() {
	  	const { activeSections } = this.state;

	    return (
	      <View style={styles.external}>
	      	<StatusBar hidden = {true}/>
		      { this.state.fontLoaded ? (
		      	<View style={styles.container}>  	
			      	<ScrollView contentContainerStyle={{width:'100%'}}>
				      	<View style={styles.header}>
				      		{/* <TouchableOpacity>
			            		<Entypo name="menu" size={40} color='white'/>
			          		</TouchableOpacity> */}
				      		<Text style={styles.textTitle}>Ton but</Text>
				      		<View style={{width: 30, height:30}}></View>
				      	</View>

			            <Accordion
			              activeSections={activeSections}
			              sections={CONTENT}
			              touchableComponent={TouchableOpacity}
			              renderHeader={this.renderHeader}
			              renderContent={this.renderContent}
			              duration={400}
			              onChange={this.setSections}
			            />
			            
			        </ScrollView>
		      	</View>
		      ) : null }
	      </View>
	    );
	}
}

const styles = StyleSheet.create({
	external: {
		flex: 1,
		justifyContent: 'center',
	},
	container: {
	    flex: 1,
	    justifyContent: 'space-between',
		backgroundColor: 'rgb(68,120,97)',
	},
  	header: {
	  	flexDirection: 'row',
	    justifyContent: 'center',
	    alignItems: 'center',
	    width: '100%',
	    // paddingHorizontal: 24,
	    paddingTop: 24,
  	},
  	textTitle: {
	  	color: 'rgb(214,186,140)',
	  	fontFamily: 'asap-bold',
	  	fontSize: 28,
  	},
  	textBody: {
	  	color: 'rgb(205,205,205)',
	  	fontFamily: 'poppins-regular',
	  	fontSize: 18,
	  	textAlign: 'center',
	  	marginVertical: 10,
	  	marginTop: 50,
  	},
  	textLogin: {
	  	color: 'rgb(243,165,51)',
	  	fontFamily: 'poppins-medium',
	  	fontSize: 20,
	  	marginBottom: 20,
	  	textAlign: 'center',
	  	paddingBottom: 24,
  	},
  	colap:{
  		marginHorizontal: 20,
	    borderRadius: 8,
	    width: '86%',
	    height: 80,
	    alignItems:'center',
	    flexDirection:'row',
	    justifyContent:'space-between',
	    marginTop: 20,
  	},
  	textColapAct: {
	    fontFamily: 'poppins-bold',
	    fontSize: 24,
	    color: 'white',
	    marginLeft:30,
  	},
  	textColapInact: {
	    fontFamily: 'poppins-bold',
	    fontSize: 24,
	    color: 'rgb(68,120,97)',
	    marginLeft: 30,
  	},
  	optionBox: {
	    backgroundColor: 'white',
	    justifyContent: 'space-between',
	    alignItems: 'center',
	    flexDirection: 'row',
	    paddingHorizontal: 24,
	    marginHorizontal: 40,
	    height:40,
	    borderRadius: 8,
	    marginVertical:3,
	    shadowColor: 'black',
	    shadowOpacity: 0.3,
	    shadowOffset: {
	        height: 4,
	        width: -2,
	    },
	    elevation: 4,
	},
	textOption: {
		fontFamily: 'poppins-bold',
		fontSize: 18,
		color: 'rgb(243,165,51)',
	}
});