import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import Select from "./SelectModal";

class SelectPicker extends Component {

    onChangeValue = value => {
        this.setState( { value } );
        if (this.props.onChangeValue) this.props.onChangeValue(value);
    };

    getText = () => {
        if (this.props.value) {
            return this.props.formatText
                ? this.props.formatText.replace( '%x', this.props.value[this.props.keyText])
                : this.props.value[this.props.keyText];
        } else {
            return this.props.default || '';
        }
    };

    onPress = () => {
        if (this.props.onPress) this.props.onPress();
        this.select.show();
    };

    render() {

        return (
            <View style={ this.props.containerStyle }>

                {/* LABEL */}
                {
                    this.props.label
                        ? <Text style={ this.props.labelStyle }> { this.props.label } </Text>
                        : null
                }

                {/* SELECT */}
                <TouchableWithoutFeedback onPress={ this.onPress }>
                    <Text style={  { color: (!this.props.value ?  'gray' : null ), ...this.props.selectStyle} }>
                        { this.getText() }
                    </Text>
                </TouchableWithoutFeedback>

                {/* Select para metodo de pagos  */}
                <Select
                    ref={ select => this.select = select }
                    keyText={ this.props.keyText }
                    title={ this.props.label }
                    data={ this.props.data }
                    formatText={ this.props.formatText }
                    onChangeValue={ this.onChangeValue }/>

                {/* ERROR */}
                {
                    this.props.error
                        ?
                        <Text style={ this.props.errorStyle }>
                            { this.props.error }
                        </Text>
                        :
                        <View style={ this.props.errorStyle }/>
                }

            </View>
        );
    }

}

export default SelectPicker;
