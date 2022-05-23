import React, { Component } from 'react';
import { View, Modal, Text, FlatList, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Colors from "../assets/colors";

class Select extends Component {

    state = {
        visible: false
    };

    show = () => this.setState(state => state.visible = true);

    dismiss = () => this.setState( { visible: false } );

    onChangeValue = value => {
        this.props.onChangeValue ? this.props.onChangeValue(value) : null;
        this.dismiss();
    };

    getText = item => this.props.formatText
        ? this.props.formatText.replace( '%x', item[this.props.keyText])
        : item[this.props.keyText];

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={ true }
                visible={ this.state.visible }
                hideModalContentWhileAnimating
                useNativeDriver>

                <TouchableWithoutFeedback onPress={ this.dismiss }>

                    <View style={ styles.container }>

                        <View style={ styles.card }>

                            {/* TITLE */}
                            {
                                this.props.title
                                    ? <Text style={styles.title}> { this.props.title } </Text>
                                    : null
                            }

                            {/* LIST */}
                            {
                                this.props.data && this.props.data.length>0
                                    ?
                                    <FlatList
                                        keyExtractor={ (item, index) => index.toString() }
                                        data={ this.props.data }
                                        renderItem={ ({item}) =>
                                            <TouchableWithoutFeedback onPress={ () => this.onChangeValue(item) }>
                                                <Text style={ styles.item }>
                                                    {
                                                        this.getText(item)
                                                            .replace("&ccedil;", "ç")
                                                            .replace("&#197;", "Å")
                                                    }
                                                </Text>
                                            </TouchableWithoutFeedback>
                                        } />
                                    : null
                            }

                        </View>

                    </View>

                </TouchableWithoutFeedback>

            </Modal>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.17)',
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    card: {
        backgroundColor: "white",
        width: "80%",
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        maxHeight: '50%'
    },
    title: {
        paddingBottom: 7,
        fontSize: 18,
        paddingLeft: 10
    },
    item: {
        height: 50,
        textAlignVertical: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.25,
    },
    textButton:{
        color: Colors.primary,
        fontSize: 15,
        fontWeight: 'bold',
        paddingVertical: 5
    },
    message: {
        paddingVertical: 14,
        margin: "auto",
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 14,
    },
    buttons: {
        flexDirection: "row",
        borderTopColor: "gray",
        borderTopWidth: .5,
        fontWeight: 'bold',
    },
    button: {
        flex: 1,
        shadowColor: "#0000",
        backgroundColor: "#0000",
        fontWeight: 'bold',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 7
    }
});

export default Select;
