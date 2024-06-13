import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';

import {MMKV, useMMKVString} from 'react-native-mmkv';
export const storage = new MMKV();

import {Realm, RealmProvider, useRealm, useQuery} from '@realm/react';

class Task extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  value!: string;

  static generate(value: string) {
    return {
      _id: new Realm.BSON.ObjectId(),
      value,
      createdAt: new Date(),
    };
  }

  static schema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      value: 'string',
    },
  };
}
function AppWrapper() {
  return (
    <RealmProvider schema={[Task]}>
      <App />
    </RealmProvider>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // AsyncStorage
  const [asyncStoreValue, setAsyncStoreValue] = useState<string | null>(null);
  const {getItem, setItem} = useAsyncStorage('@storage_key');

  const readItemFromStorage = async () => {
    const item = await getItem();
    setAsyncStoreValue(item);
  };

  const writeItemToStorage = async (newValue: string): Promise<void> => {
    await setItem(newValue);
    setAsyncStoreValue(newValue);
  };

  useEffect(() => {
    readItemFromStorage();
  });

  // MMKV
  const [mmkvValue, setMMKVValue] = useMMKVString('@MMKV');

  // Realm
  const realm = useRealm();
  const tasks = useQuery(Task);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text style={{fontSize: 20}}>Now on Expo</Text>
          <View style={{margin: 30}}>
            <Text style={{fontSize: 20}}>Async Storage</Text>
            <Text>Async Storage, Current value: {asyncStoreValue}</Text>
            <TouchableOpacity
              style={{padding: 10, backgroundColor: '#37c7cc'}}
              onPress={() =>
                writeItemToStorage(Math.random().toString(36).substr(2, 5))
              }>
              <Text>Update Async Storage value</Text>
            </TouchableOpacity>
          </View>
          <View style={{margin: 30}}>
            <Text style={{fontSize: 20}}>MMKV</Text>
            <Text>MMKV, Current value: {mmkvValue}</Text>
            <TouchableOpacity
              style={{padding: 10, backgroundColor: '#37c7cc'}}
              onPress={() =>
                setMMKVValue(Math.random().toString(36).substr(2, 5))
              }>
              <Text>Update MMKV value</Text>
            </TouchableOpacity>
          </View>
          <View style={{margin: 30}}>
            <Text style={{fontSize: 20}}>Realm</Text>
            <FlatList
              data={tasks}
              keyExtractor={item => item._id.toHexString()}
              renderItem={({item}) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      margin: 10,
                    }}>
                    <Text style={{paddingHorizontal: 10}}>{item.value}</Text>
                    <Pressable
                      onPress={() => {
                        realm.write(() => {
                          realm.delete(item);
                        });
                      }}>
                      <Text>{'🗑️'}</Text>
                    </Pressable>
                  </View>
                );
              }}
            />
            <TouchableOpacity
              style={{padding: 10, backgroundColor: '#37c7cc'}}
              onPress={() => {
                realm.write(() => {
                  realm.create(
                    'Task',
                    Task.generate(Math.random().toString(36).substr(2, 5)),
                  );
                });
              }}>
              <Text>Add Realm value</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AppWrapper;
