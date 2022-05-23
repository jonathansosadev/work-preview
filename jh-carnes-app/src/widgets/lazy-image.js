import React from 'react';
import { ActivityIndicator, ImageBackground } from 'react-native';
import { Image } from 'react-native-elements';

const LazyImage = props => (
	<Image
		ImageComponent={ ImageBackground }
		placeholderStyle={
			{
				backgroundColor: 'transparent'
			}
		}
		PlaceholderContent={ <ActivityIndicator size={ 35 } /> }
		{ ...props }
		style={ [props.style,{
			overflow: 'hidden'
		}] }
    />
)

export default LazyImage;