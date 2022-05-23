import React, { Component } from 'react';
import {View, StyleSheet, FlatList, Image, Text, TextInput, BackHandler} from 'react-native';
import {connect} from 'react-redux';
import Item from './Item';
import Api from '../../../utils/Api';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import lang from '../../../assets/lang';
import colors from '../../../assets/colors';

class Clients extends Component {

    state = {
        clients: [],
    };

    async componentDidMount() {

        this.props.navigation.addListener("didFocus", async () => {
            this.setState( { clients: this.props.clients } );
            const clients = await Api.getUsers( this.props.clients.length===0 );
            this.updateClients(clients);
		});
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.onBack);

    }
    
    onBack = () => {
        this.props.navigation.navigate("HomeAdmin");
        return true;
    };

    componentWillUnmount() {
        this.backHandler.remove();
    }

    updateClients = clients => {
        if (!clients) return false;
        this.setState( {clients} );
        this.props.dispatch( { type: 'SET_CLIENTS', payload: clients } );
    };

    deleteItem = item => {
        ConfirmDialog.show({ title: lang.deleteUser, message: lang.deleteuserConfirmMsg })
            .onNegativeButton(lang.cancel)
            .onPositiveButton(lang.delete, async () => {
                const clients = await Api.deleteUser(item.id);
                this.updateClients(clients);
            });
    };

    search = text => {
        const clients = this.props.clients.filter( client => client.person?.name.indexOf(text)>=0 );
        this.setState({ clients });
    };

    onPressItem = client => {
        this.props.navigation.navigate("ProfileAdmin", { client });
    };

    render() {
        return (
            <View>

                <View style={ style.head }/>

                <Text style={ style.title }>
                    { lang.clientsRegister }
                </Text>

                <View style={ style.searchContainer }>
                    <View style={ style.search }>
                        <TextInput
                            style={ style.searchInput }
                            placeholder={ lang.search }
                            onChangeText={ this.search }/>

                        <View style={ { width: 30, height: 30, padding: 5 } }>
                            <Image
                                style={ { width: '100%', height: "100%" } }
                                source={ require('../../../assets/icons/search.png') }
                                resizeMode='cover'
                                tintColor={ colors.primary }/>
                        </View>

                    </View>

                </View>

                {
                    this.state.clients.length===0
                        ?
                        <View style={ { justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' } }>

                            <View style={ { width: 124, height: 124 } }>
                                <Image
                                    style={ { width: '100%', height: '100%' } }
                                    source={ require('../../../assets/icons/user.png') }
                                    resizeMod='cover'
                                    tintColor={ colors.primary }/>
                            </View>

                            <Text style={ { fontSize: 16, marginVertical: 40, color: colors.primary, fontWeight: 'bold' } }>
                                { lang.notClients }
                            </Text>

                        </View>
                        :
                        <FlatList
                            data={ this.state.clients }
                            keyExtractor={ (item, i) => i.toString() }
                            contentContainerStyle={{
                                paddingBottom: 170
                            }}
                            renderItem={ ({item}) =>
                                <Item
                                    item={ item }
                                    onDelete={ this.deleteItem }
                                    onPress={ this.onPressItem }/>
                            }
                        />
                }

            </View>
        );
    }

}

const style = StyleSheet.create({
    head: {
        height: 40,
        width: '100%',
        backgroundColor: colors.primary
    },
    title: {
        width: '100%',
        paddingVertical: 5,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 25,
        color: colors.primary
    },
    searchContainer: {
        width: "100%",
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10
    },
    search: {
        backgroundColor: colors.gray,
        borderColor: 'gray',
        borderWidth: 0.5,
        height: 30,
        width: "80%",
        flexDirection: 'row'
    },
    searchInput: {
        flex: 1,
        height: "100%",
        padding: 0,
        paddingHorizontal: 5
    }
});

export default connect( state => ({
    clients: state.clients
}))(Clients);
