import React, { Component } from "react";
import {Modal, View, StyleSheet, TouchableWithoutFeedback, Text} from 'react-native';
import colors from "../assets/colors";

class ConfirmDialog extends Component {

    state = {
        visible: false,
        title: "",
        message: "",
        textCancelButton: "",
        textPositiveButton: "",
        cancelable: true
    };

    show = config => {
        this.setState({visible: true, ...config});
    };

    dismiss = () => this.setState( {
        visible: false,
        title: "",
        message: "",
        textCancelButton: "",
        textPositiveButton: "",
        cancelable: true
    } );

    onNegativeButton = (textCancelButton, cancelButtonCallback=null) => {
        this.setState( { textCancelButton: textCancelButton } );
        this.cancelButtonCallback = cancelButtonCallback;
    };

    onPositiveButton = (textPositiveButton, positiveButtonCallback=null) => {
        this.setState( { textPositiveButton: textPositiveButton } );
        this.positiveButtonCallback = positiveButtonCallback;
    };

    onBackgroundPress = () => {
        if (this.state.cancelable) this.dismiss();
    };

    onPositiveButtonPress = () => {
        if (this.positiveButtonCallback) this.positiveButtonCallback();
        this.dismiss();
    };

    onNegativeButtonPress = () => {
        if (this.cancelButtonCallback) this.cancelButtonCallback();
        this.dismiss();
    };

    render() {
        return(
            <Modal
                animationType='fade'
                transparent
                visible={ this.state.visible }
                hideModalContentWhileAnimating
                useNativeDriver>

                <TouchableWithoutFeedback onPress={ this.onBackgroundPress }>

                    <View style={ style.container }>

                        <View style={ style.card }>

                            {
                                this.state.title
                                    ? <Text style={ style.title }> { this.state.title } </Text>
                                    : null
                            }

                            <Text style={ style.message }>
                                { this.state.message }
                            </Text>

                            <View style={ style.buttonsContainer }>

                                {/* NEGATIVE BUTTON */}
                                {
                                    this.state.textCancelButton
                                        ?
                                        <TouchableWithoutFeedback onPress={ this.onNegativeButtonPress }>
                                            <View style={ { ...style.button, elevation: 0} }>
                                                <Text style={ {...style.textBtn, color: colors.black} }> { this.state.textCancelButton } </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        : null
                                }

                                {/* POSITIVE BUTTON */}
                                {
                                    this.state.textPositiveButton
                                        ?
                                        <TouchableWithoutFeedback
                                            onPress={ this.onPositiveButtonPress}>
                                            <View style={ { backgroundColor: colors.primary, ...style.button } }>
                                                <Text style={style.textBtn}> { this.state.textPositiveButton } </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        : null
                                }

                            </View>

                        </View>

                    </View>

                </TouchableWithoutFeedback>

            </Modal>
        );
    }

}

const style = StyleSheet.create({

    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.17)',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    card: {
        backgroundColor: "white",
        minWidth: '50%',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    },
    title: {
        padding: 5,
        fontSize: 18,
        paddingLeft: 10,
        width: '100%',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    message: {
        width: '100%',
        textAlign: 'center',
        padding: 5,
        paddingVertical: 15,
        margin: "auto",
        justifyContent: 'center',
        alignItems: 'center',

    },
    buttonsContainer: {
        width: '100%',
        flexDirection: "row",
        borderTopColor: 'gray',
        borderTopWidth: .5,
        padding: 5
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 7,
        borderRadius: 15,
        elevation: 5,
        height: 30,
        marginHorizontal: 15
    },
    textBtn: {
        width: '100%',
        textAlign: 'center',
        color: 'white',
        paddingHorizontal: 15
    }
});

export default ConfirmDialog;
