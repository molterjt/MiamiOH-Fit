import React from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    Button,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import {AUTH_TOKEN} from '../constants/auth';

class AuthLoadingScreen extends React.Component{
  constructor(){
    super();
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem(AUTH_TOKEN);
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render(){
    return(
        <View style={styles.container}>
          <ActivityIndicator/>
          <StatusBar barStyle={"default"}/>
        </View>
    );
  }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const AuthStack = createStackNavigator({SignIn: LoginScreen});

export default createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        App: MainTabNavigator,
        Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading'
    }
);

