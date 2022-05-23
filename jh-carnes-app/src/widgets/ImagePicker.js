import React, { Component } from "react";
import {View, Dimensions, Image, TouchableWithoutFeedback, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import picker from "react-native-image-picker";
import Permission from '../utils/permissions';

const width = Dimensions.get("window").width;
const height = width/1.2;
const h = width-height;

const ImageView = props => (
    <TouchableWithoutFeedback onPress={ props.onPress }>
        <View style={ props.style }>
            <Image
                style={ { width: '100%', height: '100%' } }
                source={ props.source }
                resizeMode={ props.resizeMode || 'cover' }
                tintColor={ props.tintColor || null }/>
        </View>
    </TouchableWithoutFeedback>
);

class ImagePicker extends Component {

    state = {
        photos: [],
        photo: null,
        index: 0
    };

    chooseFile = async () => {

        const granted = await Permission.register(['camera', 'photo']);
        if (!granted) return false;

        const options = {
            title: 'Seleccione',
            cancelButtonTitle: 'Cancelar',
            takePhotoButtonTitle: 'Usar la Cámara',
            chooseFromLibraryButtonTitle: 'Usar la Galería',
            quality: 0.5,
            maxWidth: 1000,
            maxHeight: 1000,
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            noData: true,
        };

        picker.showImagePicker(options, async r => {
            if (r && r.fileSize>0) {
                try {
                    const photo = {
                      uri: r.uri,
                      path: r.path,
                      size: r.fileSize,
                      name: r.fileName,
                    };
                    photo.rotation = 0;
                    this.state.photos.push( photo );
                    const index = this.state.photos.length-1;
                    this.setState( {
                        photos: this.state.photos,
                        photo,
                        index
                    }, this.onUpdate );
                } catch(e) {
                    if (this.props.onError) this.props.onError(e);
                }
            } else if (r.error) {
                if (this.props.onError) this.props.onError(r.error);
            }

        });
    };

    selectPhoto = (photo, index) => this.setState( { photo, index} );

    delete = () => {
        if (this.state.photo.uri.indexOf('http')>=0 && this.props.onDelete) {
            this.props.onDelete(this.state.photo);
        } else {
            const photos = [ ...this.state.photos ];
            photos.splice(this.state.index, 1);
            const photo = photos.length ? photos[0] : null;
            this.setState( {
                photos,
                photo,
                index: 0
            }, this.onUpdate );
        }
    };

    setPhotos = photos => {
        photos = photos.map( photo => ({ ...photo, rotation: 0 }) );
        this.setState( { photos, photo: photos[0] } );
    };

    rotate = degree => {

        const photo = { ...this.state.photo };
        photo.rotation += degree;

        const photos = [...this.state.photos];
        photos[this.state.index] = photo;

        this.setState( { photo, photos }, this.onUpdate )

    };

    positiveRotation = () => this.rotate(90);

    negativeRotation = () => this.rotate(-90);

    getWidth = () => {
        if (!this.state.photo) return width;
        let rot = this.state.photo.rotation;
        return ((rot/90)%2)===0 ? width : height;
    };

    getHeight = () => {
        if (!this.state.photo) return height;
        let rot = this.state.photo.rotation;
        return ((rot/90)%2)===0 ? height : width;
    };

    onUpdate = () => {
        const photos = this.state.photos;
        this.setState( { photos } );
        if (this.props.onUpdate) this.props.onUpdate(this.state.photos);
    };

    render() {
        return(
            <View style={ { width, height: width, ...this.props.containerStyle } }>

                <View style={ { position: 'relative', width, height } }>

                    {/* CONTROLLER CONTAINER */}
                    {
                        this.state.photos.length
                            ?
                            <View style={ { zIndex: 1, position: 'absolute', height, top: 0, right: 0, padding: 4 } }>

                                <View style={ { flex: 1 } }/>

                                {
                                    this.state.photo.uri.indexOf('http')<0
                                        ?
                                        <View >

                                            <ImageView
                                                tintColor='white'
                                                style={ { ...style.buttonContainerController, ...this.props.buttonControllerStyle } }
                                                source={ require("../assets/icons/right_rotation.png") }
                                                onPress={ this.positiveRotation }/>

                                            <ImageView
                                                tintColor='white'
                                                style={ { ...style.buttonContainerController, ...this.props.buttonControllerStyle } }
                                                source={ require("../assets/icons/left_rotation.png") }
                                                onPress={ this.negativeRotation }/>

                                        </View>
                                        :
                                        null
                                }

                                <ImageView
                                    onPress={ this.delete }
                                    style={ { ...style.buttonContainerController, ...this.props.buttonControllerStyle } }
                                    source={ require("../assets/icons/trash.png") }
                                    tintColor='white'/>

                            </View>
                            :
                            null
                    }

                    {/* LABEL */}
                    {
                        this.state.photos.length
                            ?
                            <View style={ { position: 'absolute', zIndex: 1, left: 5, bottom: 5, backgroundColor: 'gray', borderRadius: 5, paddingHorizontal: 4 } }>
                                <Text style={ { color: 'white', fontSize: 12 } }>
                                    { (this.state.index+1)+"/"+this.state.photos.length }
                                </Text>
                            </View>
                            :
                            null
                    }

                    <View style={ { justifyContent: 'center', alignItems: 'center', width, height } }>
                        <Image
                            style={ {
                                width: this.getWidth(),
                                height: this.getHeight(),
                                transform: [
                                    {
                                        rotate: (this.state.photo ? this.state.photo.rotation : 0)+'deg'
                                    }
                                ]
                            } }
                            source={ this.state.photos.length ? { uri: this.state.photo.uri } : this.props.defaultImage }
                            resizeMode='cover'/>
                    </View>


                </View>

                <View style={ { flexDirection: 'row', height: h } }>

                    <ImageView
                        onPress={ this.chooseFile }
                        style={ { width: h, height: h, padding: 7 } }
                        source={ this.props.iconButton }/>

                    <ScrollView horizontal>
                        {
                            this.state.photos.map( (photo, i) =>
                                <ImageView
                                    onPress={ () => this.selectPhoto(photo, i) }
                                    key={ i.toString() }
                                    style={ { width: h, height: h, borderColor: 'red', borderWidth: (i===this.state.index ? 1: 0 )} }
                                    source={  { uri: photo.uri } }/>
                            )
                        }
                    </ScrollView>

                </View>

            </View>
        );
    }

}

const style = StyleSheet.create({
    container: {

    },
    buttonContainerController: {
        elevation: 4,
        width: 30,
        height: 30,
        padding: 7,
        backgroundColor: 'gray',
        borderRadius: 15,
        marginTop: 8,
        tintColor: 'white'
    }
});

export default ImagePicker;
