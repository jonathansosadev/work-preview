import React, { Component } from 'react';
import Input from './Input';
import lang from '../../../assets/lang';
import Validator from '../../../utils/Validators';
import Toast from '../../../utils/Toast';
import {View} from 'react-native';
import {Text} from 'react-native';
import {TouchableWithoutFeedback} from 'react-native';
import {StyleSheet} from 'react-native';
import colors from '../../../assets/colors';
import Api from '../../../utils/Api';

class Password extends Component {

    state = {
        err_password: "",
        password: ""
    };

    componentDidMount() {
        console.log(">>: EditPassword > client: ", this.props.client);
        this.validatorActions();
    }

    clearError = () => {
        this.setState( {
            err_password: ""
        } );
    };

    validateForm = () => !Validator.password.validate( this.state.password );

    submit = async () => {

        console.log(">>: Password > submit > validateForm: ", this.validateForm());

        if (this.validateForm()) return false;

        const response = await Api.updatePassword(this.props.client.id,  this.state.password);

        console.log(">>: Password > submit > response: ", response);

        if (response) {
            Toast.show(lang.updateSuccess);
            // this.setState( { client } );
            // this.props.dispatch( { type: "UPDATE_CLIENT", payload: client } );
        }

    };

    validatorActions = () => {

        Validator.password.notPass = err_password => {
            Toast.show( lang.verifyFieldsMessage );
            this.setState( { err_password } );
        };

    };

    render() {
        return(
            <>
                <Input
                    label={ lang.password }
                    placeholder={ lang.password }
                    required
                    password
                    onChangeText={ password => this.setState( { password } ) }
                    error={ this.state.err_password }
                    onFocus={ this.clearError }
                    value={ this.state.password } />

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

export default Password;
