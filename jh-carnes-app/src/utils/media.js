import ImagePicker from 'react-native-image-picker';

const options = {
  title: 'Seleccione',
  cancelButtonTitle: 'Cancelar',
  takePhotoButtonTitle: 'Usar la Cámara',
  chooseFromLibraryButtonTitle: 'Usar la Galería',
  noData: true,
  maxWidth: 1000,
  maxHeight: 1000,
  quality: 0.5,
};

export default {
	open: () => {
		return new Promise((resolve,reject) => {
			ImagePicker.showImagePicker(options,response => {
				if (response.uri) {
					resolve(response.uri);
				}
				else {
					reject();
				}
			});
		});
	}
}