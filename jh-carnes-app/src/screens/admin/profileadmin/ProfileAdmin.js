import React, { Component } from "react";
import {View, StyleSheet, BackHandler, ScrollView, ImageBackground, Image, Dimensions } from 'react-native';
import colors from '../../../assets/colors';
import TabsContainer from '../../../widgets/TabsContainer';
import Edit from './Edit';
import lang from '../../../assets/lang';
import Password from './Password';

const tabs = {
    PROFILE: 0,
    PASSWORD: 1
};

const width = Dimensions.get("window").width;

class ProfileAdmin extends Component {

    state = {
        tab: tabs.PROFILE,
    };

    componentDidMount() {
        const client = this.props.navigation.getParam('client');
        if (this.edit) this.edit.setClient( client );
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onBack);
    }

    onBack = () => {
        this.props.navigation.navigate("Clients");
        return true;
    };

    componentWillUnmount() {
        this.backHandler.remove();
    }

    getRation = () => {
        const { width, height } = Image.resolveAssetSource( require("../../../assets/imgs/profilebg.jpg") );
        return width/height;
    };

    render() {
        return (
            <ScrollView>

                <View style={ style.head }/>

                <ImageBackground
                    style={ { width: '100%', height: width/this.getRation(), justifyContent: 'center', alignItems: 'center' } }
                    source={ require("../../../assets/imgs/profilebg.jpg") }>

                </ImageBackground>

                <View style={ style.container }>

                    {
                        this.state.tab === tabs.PROFILE
                            ? <Edit client={ this.props.navigation.getParam('client') } />
                            : <Password client={ this.props.navigation.getParam('client') }  />
                    }

                    <TabsContainer
                        tabs={ [lang.editData, lang.editPassword] }
                        onChangeTab={ tab => this.setState({tab}) }
                        tabSelected={ this.state.tab } />

                </View>

            </ScrollView>
        );
    }

}

const style = StyleSheet.create( {
    container: {
        alignItems: 'center'
    },
    head: {
        width: '100%',
        height: 40,
        backgroundColor: colors.primary
    },
    submit: {
        height: 30,
        backgroundColor: colors.primary,
        borderRadius: 15,
        width: '33%'
    },
    textSubmit: {
        color: 'white',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'center'
    }
} );

export default ProfileAdmin;
