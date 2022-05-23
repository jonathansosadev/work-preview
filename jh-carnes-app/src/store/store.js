import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import reducers from '../reducers/index';
import AsyncStorage from '@react-native-community/async-storage';

const persistConfig = {
    key: 'jhcarne',
    storage: AsyncStorage
};

const persistedReducer = persistReducer(persistConfig, reducers);
const store = createStore(persistedReducer);
const persistor = persistStore(store);

export { store, persistor };
