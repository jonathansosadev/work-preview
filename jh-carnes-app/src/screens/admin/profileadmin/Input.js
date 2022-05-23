import React, { Component } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import Validator from '../../../utils/Validator';
import lang from "../../../assets/lang";
import colors from "../../../assets/colors";

class Input extends Component {

    state = {
        error: null,
        text: ""
    };

    componentDidMount() {
        this.validator = new Validator()
            .notEmpty( lang.requiredValidatorMessage );
        this.validator.notPass = error => this.setState( { error } );
        this.setState( { text: this.props.value } )
    }

    onChangeText = text => {
        if (this.props.onChangeText) this.props.onChangeText(text);
        this.setState( {text} );
    };

    onFocus = () => {
        if (!this.props.required) return false;
        this.setState( { error: null} );
        if (this.props.onFocus) this.props.onFocus();
    };

    onBlur = () => {
        if (!this.props.required) return false;
        // this.validator.validate(this.state.text);
        if (this.props.onBlur) this.props.onBlur();
    };

    render() {

        return (
            <View style={ { ...style.container, ...this.props.containerStyle } }>

                {/* LABEL*/}
                {
                    this.props.label
                        ?
                        <Text style={ { ...style.label, ...this.props.labelStyle } }>
                            { this.props.label }
                        </Text>
                        :
                        null
                }

                {/* INPUT */}
                <TextInput
                    style={ {
                        ...style.input,
                        ...( this.props.multiline ? { height: 80, textAlignVertical: 'top', padding: 5 } : null ),
                        ...this.props.inputStyle,
                    } }
                    placeholder={ this.props.placeholder }
                    onChangeText={ this.onChangeText }
                    onFocus={ this.onFocus }
                    onBlur={ this.onBlur }
                    keyboardType={ this.props.keyboardType || "default" }
                    multiline={ this.props.multiline }
                    value={ this.props.value }
                    secureTextEntry={ this.props.password }/>

                {/* ERROR */}
                {
                    this.state.error || this.props.error
                        ?
                        <Text style={ { ...style.error, ...this.props.errorStyle } }>
                            { this.state.error || this.props.error }
                        </Text>
                        :
                        <View style={ style.error }/>
                }

            </View>
        );

    }

}

const style = StyleSheet.create({

    container: {
        paddingHorizontal: 7,
        width: '80%'
    },
    label: {
        paddingLeft: 5,
        paddingVertical: 2,
        width: '100%',
        textAlign: 'center'
    },
    input: {
        borderColor: colors.primary,
        borderWidth: 1,
        height: 35,
        padding: 0,
        paddingHorizontal: 10,
        backgroundColor: colors.gray,
    },
    error: {
        color: 'red',
        fontSize: 12,
        width: "100%",
        padding: 2,
        paddingLeft: 5,
        height: 16
    }

});

export default Input;
