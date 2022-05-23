import React from 'react';
import { View, StyleSheet, Text, Image, TouchableWithoutFeedback } from 'react-native';
import lang from "../../../assets/lang";
import colors from "../../../assets/colors";
import G from '../../../utils/G';

const Item = props => (

    <View style={ style.container }>

        <TouchableWithoutFeedback onPress={ () => props.onPress ? props.onPress(props.item) : null }>

            <View style={ style.content }>

                <View style={ style.textContainer }>

                    {/* name */}
                    <Text style={ style.title } numberOfLines={1}>
                        { props.item.person.name+" "+props.item.person.lastname }
                    </Text>

                    {/* REGISTRATION DATE */}
                    <Text numberOfLines={1}>
                        { lang.registrationDate+G.dateFormat(props.item.created_at) }
                    </Text>

                    <Text numberOfLines={1}>
                        { lang.points+": "+props.item.person.points+lang.pts }
                    </Text>

                </View>

                <View>

                    <View style={ { flex: 1 } }/>

                    <TouchableWithoutFeedback onPress={ () => props.onDelete ? props.onDelete(props.item) : null }>
                        <View style={ style.iconContainer }>
                            <Image
                                style={ style.icon }
                                source={ require("../../../assets/icons/trash_1.png") }
                                tintColor={ colors.primary }/>
                        </View>
                    </TouchableWithoutFeedback>

                </View>

            </View>

        </TouchableWithoutFeedback>

    </View>
);

const style = StyleSheet.create({
    container: {
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: colors.gray,
        borderRadius: 10,
        width: '90%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        elevation: 5
    },
    textContainer: {
        flex: 1
    },
    title: {
        color: colors.primary,
        paddingBottom: 5,
        fontWeight: 'bold'
    },
    text: {

    },
    iconContainer: {

    },
    icon: {
        tintColor: 'black',
        width: 20,
        height: 20
    }
});

export default Item;
