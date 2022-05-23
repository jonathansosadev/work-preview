import React from 'react';
import {Image, TouchableWithoutFeedback, View} from 'react-native';

const ImageView = props => (
    <TouchableWithoutFeedback onPress={ props.onPress }>
        <View style={ props.style }>
            <Image
                style={ {
                    width: props.width || '100%',
                    height: props.height || '100%',
                    transform: [
                        {
                            rotate: (props.rotate||0)+'deg'
                        }
                    ]
                } }
                source={ props.source }
                resizeMode={ props.resizeMode || 'cover' }
                tintColor={ props.tintColor || null }/>
        </View>
    </TouchableWithoutFeedback>
);

export default ImageView;
