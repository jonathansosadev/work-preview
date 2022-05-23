import React from 'react';
import _Toast from 'react-native-root-toast';

export default class Toast {

    static show(message: string) {
        _Toast.show(message);
    }

}