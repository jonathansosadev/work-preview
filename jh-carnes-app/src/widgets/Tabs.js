import React from 'react'
import { View, Text, TouchableWithoutFeedback, StyleSheet} from "react-native";
import Color from "../assets/colors";

const Tab = props => (
    <TouchableWithoutFeedback onPress={ props.onPress } >
        <View style={ [
                styles.container,
                props.selected ? styles.selected : {},
                props.first ? styles.first : {},
                props.last ? styles.last : {}
            ] }>
            <Text style={ props.selected ? styles.textSelected : {} }>
                { props.text }
            </Text>
        </View>
    </TouchableWithoutFeedback>
);

const styles = StyleSheet.create( {
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
        flex: 1,
        backgroundColor: Color.gray,
    },
    selected: {
        backgroundColor: Color.primary
    },
    textSelected: {
        fontWeight: 'bold',
        color: Color.white
    },
    first: {
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    last: {
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15
    }
} );

export default Tab;
