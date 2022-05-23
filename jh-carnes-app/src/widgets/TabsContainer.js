import React, { Component  } from 'react';
import { StyleSheet, View } from "react-native";
import Tab from "./Tabs";

class TabsContainer extends Component {

    render() {
        return (
            <View style={ styles.container }>

                {
                    this.props.tabs.map( (tab, i)  =>

                        <Tab
                            key={ i }
                            text={ tab }
                            selected={ i === this.props.tabSelected }
                            first={ i===0 }
                            last={ i===(this.props.tabs.length-1) }
                            onPress={ () => {
                                if (i!==this.props.tabSelected) {
                                    this.props.tabSelected = i;
                                    if (this.props.onChangeTab) this.props.onChangeTab(i);
                                    // this.forceUpdate();
                                }
                            } }/>

                    )
                }

            </View>
        )
    }

}

const styles = StyleSheet.create( {
    container: {
        width: '80%',
        flexDirection: 'row',
        marginTop: 30
    },
    tab: {
        flex: 1,
        height: 40
    }
} );

export default TabsContainer;
