import React , {Component} from "react"
import {Text, View,StyleSheet} from "react-native"
import moment from "moment";
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from "../../../utils";

class itemAuditPointHistory extends Component{
    componentDidMount(): void {
        console.log(">>: props ",this.props);
    }

    render(){
        return (
            <View  style={ [styles.row,styles.rowRed] }>
                <View style={ styles.col }>
                    <Text style={ styles.textTable }>{ "F-"+this.props.item.bill_number }</Text>
                </View>
                <View style={ styles.col }>
                    <Text style={ [styles.center,styles.textTable] }>{ moment(this.props.item.created_at).format('DD-MM-YYYY') }</Text>
                </View>
                <View style={ styles.col }>
                    <Text style={ [styles.textTable,styles.right] }>
                        <Icon
                            name={ this.props.item.type == 1 ? 'ios-arrow-dropup-circle' : 'ios-arrow-dropdown-circle' }
                            size={ 15 }
                            color={ this.props.item.type == 1 ? Colors.green : Colors.red } />
                       { ' ' + this.props.item.quantity } pts
                    </Text>
                </View>
            </View>
        );
    }
}const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        width: '85%',
        alignSelf: 'center',
        paddingTop: 5
    },
    rowRed: {
        borderBottomWidth: .5,
        borderBottomColor: Colors.red,
        paddingBottom: 5,
        width: '85%',
        alignSelf: 'center'
    },
    col: {
        flex: .33
    },
    textTable: {
        fontSize: 12
    },
    center: {
        textAlign: 'center'
    },
    right: {
        textAlign: 'right'
    },
});export default itemAuditPointHistory;