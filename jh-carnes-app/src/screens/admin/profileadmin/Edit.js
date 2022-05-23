import React, { Component } from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Text} from 'react-native';
import Input from './Input';
import lang from '../../../assets/lang';
import Validator from '../../../utils/Validators';
import Toast from '../../../utils/Toast';
import Api from '../../../utils/Api';
import colors from '../../../assets/colors';

class Edit extends Component {

    state = {
        client: null,
        err_name: "",
        err_lastname: "",
        err_email: "",
        err_phone: ""
    };

    componentDidMount() {
        this.setState( { client: this.props.client } );
        this.validatorActions();
    }

    setClient = client => this.setState( { client } );

    validatorActions = () => {

        Validator.name.notPass = err_name => {
            Toast.show( lang.verifyFieldsMessage );
            this.setState( { err_name } );
        };

        Validator.lastname.notPass = err_lastname => {
            Toast.show( lang.verifyFieldsMessage );
            this.setState( { err_lastname } );
        };

        Validator.price.email = err_email => {
            Toast.show( lang.verifyFieldsMessage );
            this.setState( { err_email } );
        };

        Validator.category.phone = err_phone => {
            Toast.show( lang.verifyFieldsMessage );
            this.setState( { err_phone } );
        };

    };

    clearError = () => {
        this.setState( {
            err_name: "",
            err_lastname: "",
            err_email: "",
            err_phone: ""
        } );
    };

    validateForm = () =>  (
        !Validator.name.validate( this.state.client.person.name )         ||
        !Validator.lastname.validate( this.state.client.person.lastname ) ||
        !Validator.email.validate( this.state.client.email )              ||
        !Validator.phone.validate( this.state.client.person.phone )
    );

    submit = async () => {

        if (this.validateForm()) return false;

        const client = await Api.updateUser(this.state.client);

        if (client) {
            Toast.show(lang.updateSuccess);
            this.setState( { client } );
            this.props.dispatch( { type: "UPDATE_CLIENT", payload: client } );
        }

    };

    render() {
        return(
            <>
                {/* DESCRIPTION */}
                <Input
                    label={ lang.name }
                    placeholder={ lang.name }
                    required
                    onChangeText={ name => {
                        this.state.client.person.name = name;
                        this.setState( { client: this.state.client } );
                    } }
                    error={ this.state.err_name }
                    onFocus={ this.clearError }
                    value={ this.state.client ? this.state.client.person.name : ""}/>

                {/* DESCRIPTION */}
                <Input
                    label={ lang.lastname }
                    placeholder={ lang.lastname }
                    required
                    onChangeText={ lastname => {
                        this.state.client.person.lastname = lastname;
                        this.setState( { client: this.state.client } );
                    } }
                    error={ this.state.err_lastname }
                    onFocus={ this.clearError }
                    value={ this.state.client ? this.state.client.person.lastname : ""}/>

                {/* EMAIL */}
                <Input
                    label={ lang.email }
                    placeholder={ lang.email }
                    required
                    keyboardType="email-address"
                    onChangeText={ email => {
                        this.state.client.email = email;
                        this.setState( { client: this.state.client } );
                    } }
                    error={ this.state.err_email }
                    onFocus={ this.clearError }
                    value={ this.state.client ? this.state.client.email : ""}/>

                {/* PHONE */}
                <Input
                    label={ lang.phone_number }
                    placeholder={ lang.phone_number }
                    required
                    onChangeText={ phone => {
                        this.state.client.person.phone = phone;
                        this.setState( { client: this.state.client } );
                    } }
                    keyboardType="number-pad"
                    error={ this.state.err_phone }
                    onFocus={ this.clearError }
                    value={ this.state.client ? this.state.client.person.phone : ""}/>

                <TouchableWithoutFeedback onPress={ this.submit }>
                    <View style={ style.submit }>
                        <Text style={ style.textSubmit }>
                            { lang.saveData }
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </>
        );
    }

}

const style = StyleSheet.create( {
    container: {
        alignItems: 'center'
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

export default Edit;
