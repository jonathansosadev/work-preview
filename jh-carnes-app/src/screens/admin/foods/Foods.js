import React, {Component} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import Toast from 'react-native-root-toast';
import {connect} from 'react-redux';
import Colors from '../../../assets/colors';
import createDish from '../../../assets/icons/add.png';
import empty from '../../../assets/icons/food_big.png';
import hand from '../../../assets/icons/hand.png';
import search from '../../../assets/icons/search.png';
import Strings from '../../../assets/lang';
import API from '../../../utils/Api';
import ConfirmDialog from '../../../utils/ConfirmDialog';
import Globals from '../../../utils/globals';
import LoadingModal from '../../../utils/LoadingModal';
import ImageView from '../../../widgets/ImageView';
import SelectPicker from '../../../widgets/SelectPicker';
import Item from './Item';

class Foods extends Component {
  static navigationOptions = {
    title: Strings.plates,
  };

  state = {
    foods: this.props.foods,
    categoryID: 0,
    categories: null,
    loading: false,
  };

  async componentDidMount() {
    this.backButtonListener = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );

    LoadingModal.show();
    const categories = await API.getCategories();
    if (!categories) {
      Alert.alert('Alerta', 'Ha ocurrido un error', [
        {text: 'Aceptar', onPress: dismissLoadingModal},
      ]);

      return;
    }

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState(
      {categories, categoryID: categories[0].id},
      dismissLoadingModal,
    );

    const foods = await API.getFoods(this.props.foods.length === 0);
    this.updateFoods(foods);
  }

  onBack = () => {
    this.props.navigation.navigate('HomeAdmin');
    return true;
  };

  componentWillUnmount() {
    this.backButtonListener.remove();
  }

  createDish = () => this.props.navigation.navigate('CreatePlate');

  updateFoods = foods => {
    if (!foods) {
      return false;
    }

    this.props.dispatch({type: 'SET_FOODS', payload: foods});
    this.setState({foods});
  };

  deleteDish = item => {
    ConfirmDialog.show({
      title: Strings.deleteFood,
      message: Strings.deleteFoodConfirmMsg,
    })
      .onNegativeButton(Strings.cancel)
      .onPositiveButton(Strings.delete, async () => {
        const foods = await API.deleteFood(item.id);
        this.updateFoods(foods);
      });
  };

  editDish = item => this.props.navigation.navigate('CreatePlate', {item});

  search = text => {
    const foods = this.props.foods.filter(food => food.name.indexOf(text) >= 0);
    this.setState({foods});
  };

  render() {
    return (
      <View style={styles.container}>
        <ImageView
          onPress={this.createDish}
          style={styles.createDishButton}
          source={createDish}
        />
        <View style={styles.header}>
          <View style={styles.search}>
            <View style={styles.searchIconContainer}>
              <Image
                style={styles.searchIcon}
                source={search}
                tintColor="gray"
                resizeMode="cover"
              />
            </View>
            <TextInput
              style={styles.searchText}
              numberOfLines={1}
              placeholder={Strings.search}
              onChangeText={this.search}
            />
          </View>
        </View>
        <View style={styles.tutorialContainer}>
          <Image source={hand} style={styles.tutorialImage} />
          <Text style={styles.tutorialText}>
            {Strings.dishesOrganizationTutorial}
          </Text>
        </View>
        <View style={styles.selectContainer}>
          <SelectPicker
            data={this.state.categories}
            value={
              (this.state.categories &&
                this.state.categories.find(
                  it => it.id === this.state.categoryID,
                )) ||
              ''
            }
            keyText="name"
            selectStyle={styles.select}
            onChangeValue={({id}) => this.setState({categoryID: id})}
          />
        </View>
        <View style={styles.selectSeparator} />
        {(() => {
          const dishes = this.state.categoryID
            ? this.state.foods.filter(
                it => it.category_id === this.state.categoryID,
              )
            : [];

          if (!dishes.length) {
            return (
              <View style={styles.empty}>
                <View style={styles.emptyImageContainer}>
                  <Image
                    style={styles.emptyImage}
                    source={empty}
                    resizeMode="cover"
                    tintColor={Colors.primary}
                  />
                </View>
                <Text style={styles.emptyText}>{Strings.notPlates}</Text>
              </View>
            );
          }

          return (
            <DraggableFlatList
              data={dishes}
              renderItem={({item, drag, isActive}) => (
                <Item
                  item={item}
                  onDelete={this.deleteDish}
                  onEdit={this.editDish}
                  onReorder={drag}
                  isActive={isActive}
                />
              )}
              ListFooterComponent={Footer}
              autoscrollThreshold={60}
              keyExtractor={({id}) => id.toString()}
              onDragEnd={this.updateOrders}
            />
          );
        })()}
      </View>
    );
  }

  updateOrders = ({data}) => {
    const oldData = [...this.state.foods];
    let orders = data.map(({id}, order) => ({id, order}));

    LoadingModal.show();
    this.setState({foods: data}, () => {
      API.updateFoodOrders(orders)
        .then(() => {
          Globals.quitLoading();
          return API.getFoods(false);
        })
        .then(dishes => {
          this.updateFoods(dishes);
          Toast.show('Se ha actualizado el orden de los platos');
          dismissLoadingModal();
        })
        .catch(() => {
          this.setState({foods: oldData});
          Alert.alert('Alerta', 'Ha ocurrido un error', [
            {
              text: 'Aceptar',
              onPress: dismissLoadingModal,
            },
          ]);
        });
    });
  };
}

// Esto debería ser padding en el contentContainerStyle de la lista,
// pero parece romper el auto-scroll en iOS.
//
// eslint-disable-next-line react-native/no-inline-styles
const Footer = () => <View style={{height: 72}} />;

const dismissLoadingModal = () => {
  setTimeout(() => LoadingModal.dismiss(), 600);
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  header: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 80,
    padding: 5,
    paddingHorizontal: 15,
  },
  search: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 30,
    marginTop: 40,
    borderRadius: 15,
  },
  searchIconContainer: {
    width: 30,
    height: 30,
    padding: 5,
  },
  searchIcon: {
    width: '100%',
    height: '100%',
  },
  searchText: {
    flex: 1,
    height: '100%',
    padding: 0,
    textAlignVertical: 'center',
  },
  createDishButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    bottom: 10,
    right: 10,
    zIndex: 1,
    borderRadius: 25,
    elevation: 5,
    backgroundColor: Colors.primary,
    padding: 15,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  emptyImageContainer: {
    width: 124,
    height: 124,
  },
  emptyImage: {
    width: '100%',
    height: '100%',
    tintColor: Colors.primary,
  },
  emptyText: {
    fontSize: 16,
    marginVertical: 40,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  selectContainer: {
    backgroundColor: Colors.gray,
    paddingVertical: 0,
    fontSize: 14,
    minHeight: 32,
    borderRadius: 0,
    borderColor: '#c4c4c4',
    margin: 8,
    borderWidth: 1,
  },
  select: {
    paddingTop: 5,
    paddingLeft: 4,
  },
  selectSeparator: {
    backgroundColor: '#c4c4c4',
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  list: {
    paddingBottom: 72,
  },
  tutorialContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
    margin: 8,
    marginBottom: 0,
    borderRadius: 8,
    // borderWidth: 4,
    backgroundColor: Colors.accent,
  },
  tutorialImage: {
    height: 48,
    marginEnd: 8,
    tintColor: Colors.primary,
    width: 48,
  },
  tutorialText: {
    color: 'black',
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default connect(state => ({
  foods: state.foods,
}))(Foods);
