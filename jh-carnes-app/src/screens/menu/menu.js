import PhotoView from '@merryjs/photo-viewer';
import React from 'react';
import {
  Dimensions,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button as ButtonNative} from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import Header from '../../navigation/header';
import {Alert, axios, Colors, ENV, Globals} from '../../utils';
import {Button, Modal, Select} from '../../widgets';
import ModalDescription from './modal-description';

class Menu extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    foods: [],
    categories: [],
    visible: false,
    item: null,
    photos: null,
    visibleViewer: false,
    form: {
      category: '',
    },
  };

  updateFormField = (event, name) => {
    this.setState({
      form: {
        ...this.state.form,
        [name]: event.nativeEvent.text,
      },
    });
  };

  componentDidMount() {
    Globals.setLoading();
    axios
      .post('foods/all')
      .then(res => {
        if (!res.data.result) {
          return;
        }

        this.props.dispatch({
          type: 'Dishes/SET',
          dishes: res.data.foods,
        });

        this.setState({
          foods: res.data.foods,
          categories: res.data.categories,
        });
      })
      .catch(err => {
        console.log('Menu: componentDidMount: ', err);
        Alert.showError();
      })
      .finally(() => Globals.quitLoading());
  }

  view = item =>
    this.setState({
      visible: true,
      item,
    });

  render() {
    const {orderAmount, navigation} = this.props;

    return (
      <>
        {this.state.visible && this.state.item != null && (
          <Modal visible={this.state.visible} transparent={true}>
            <ModalDescription
              item={this.state.item}
              onClose={() => this.setState({visible: false})}
              onPressAdd={quantity => {
                this.props.dispatch({
                  type: 'Order/ADD_DISH',
                  dishId: this.state.item.id,
                  quantity,
                });

                this.setState({visible: false});
              }}
            />
          </Modal>
        )}
        {this.state.visibleViewer && (
          <PhotoView
            visible={this.state.visibleViewer}
            data={this.state.photos}
            initial={0}
            hideShareButton={true}
            hideStatusBar={true}
            onDismiss={() =>
              this.setState({visibleViewer: false, photos: null})
            }
          />
        )}
        <View style={styles.listContainer}>
          <SectionList
            ListHeaderComponent={this.renderHeader}
            keyExtractor={this.extractItemKey}
            renderItem={this.renderItem}
            renderSectionHeader={this.renderSectionHeader}
            sections={this.makeSections()}
          />
          {orderAmount > 0 && (
            <View style={styles.buttonContainer}>
              <Button
                btnRed
                onPress={() => {
                  navigation.navigate('Order');
                }}
                title={`Mi orden: ${Globals.getPrice(orderAmount)}`}
              />
            </View>
          )}
        </View>
      </>
    );
  }

  renderItem = ({item, index}) => (
    <TouchableOpacity onPress={() => this.view(item)}>
      <View
        style={[
          index % 2 !== 0
            ? {
                backgroundColor: Colors.gray,
              }
            : null,
        ]}>
        <View style={styles.row}>
          <View style={styles.itemImage}>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  photos: item.images.map(({file}) => ({
                    source: {
                      uri: ENV.BASE_URL + file,
                    },
                  })),
                  visibleViewer: true,
                });
              }}>
              <FastImage
                style={styles.image}
                source={{
                  uri: ENV.BASE_URL + item.images[0].file,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.title}>{item.name}</Text>
            <Text>
              <Text style={styles.price}>
                Precio: {Globals.getPrice(item.price)}
              </Text>
            </Text>
            <Text numberOfLines={1}>{item.description}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  renderSectionHeader = ({section: {title}}) => (
    <Text style={styles.categoryTitle}>{title}</Text>
  );

  extractItemKey = ({id}) => id.toString();

  renderHeader = () => (
    <View style={styles.container}>
      <Header
        style={{
          backgroundColor: Colors.red,
          width: Dimensions.get('window').width,
        }}
        title="Menú"
        headerLeft={
          <ButtonNative
            type="clear"
            onPress={() => this.props.navigation.goBack(null)}
            icon={<Icon name="ios-arrow-back" size={30} color={Colors.white} />}
          />
        }
      />
      <Select
        label="Categoría"
        style={styles.categoryPicker}
        items={this.state.categories.map(it => {
          return {
            value: it.id,
            label: it.name,
          };
        })}
        placeholder="Todos"
        onChange={text => this.updateFormField(text, 'category')}
        value={this.state.form.category}
      />
    </View>
  );

  makeSections = () => {
    const categories = this.state.form.category
      ? this.state.categories.filter(({id}) => id === this.state.form.category)
      : this.state.categories;

    return categories.map(({id, name}) => ({
      title: name,
      data: this.state.foods.filter(({category_id}) => category_id === id),
    }));
  };
}

const styles = StyleSheet.create({
  itemImage: {
    flex: 0.3,
  },
  itemContent: {
    flex: 0.7,
    paddingLeft: 15,
    paddingVertical: 10,
  },
  categoryPicker: {
    marginBottom: 15,
  },
  container: {
    paddingTop: 40,
  },
  row: {
    flexDirection: 'row',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.gray,
  },
  bold: {
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    margin: 1.5,
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  title: {
    color: Colors.red,
    fontWeight: 'bold',
  },
  price: {
    fontWeight: 'bold',
  },
  listContainer: {
    height: '100%',
  },
  buttonContainer: {
    paddingTop: 10,
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    alignItems: 'center',
  },
});

export default connect(({order, dishes}) => ({
  orderAmount: Object.entries(order).reduce(
    (soFar, [dishId, quantity]) =>
      soFar +
      (dishes.find(({id}) => id === parseInt(dishId, 10))?.price ?? 0) *
        quantity,
    0,
  ),
}))(Menu);
