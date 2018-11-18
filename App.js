import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import ApolloClient from 'apollo-client';
import {ApolloProvider} from 'react-apollo';
import {HttpLink} from "apollo-link-http";
import {InMemoryCache} from "apollo-cache-inmemory";
import { setContext } from 'apollo-link-context';

export const GRAPHQL_ENDPOINT = "https://api.graph.cool/simple/v1/cjf6zsqxj3n420141z09rpv9j";

const httpLink = new HttpLink({
    uri: GRAPHQL_ENDPOINT
});

// export const getToken = async () => {
//     if(token){
//         console.log('app Promise Token: ' + token);
//         return Promise.resolve(token);
//     }
//     token = await AsyncStorage.getItem(AUTH_TOKEN).valueOf();
//     console.log('app AsyncStore.getItem' + token);
// };


// const authLink = setContext(async(req, {headers}) => {
//     const token = await getToken();
//     return{
//         ...headers,
//         headers: {
//             authorization: token ? `Bearer ${token}` : null,
//         },
//     };
// });

// const httpAuthLink = authLink.concat(httpLink);

const cache = new InMemoryCache({
    dataIdFromObject: object => object.key || null
});

export const client = new ApolloClient({
    link: httpLink,
    cache: cache,
});


export default class App extends React.Component {
    state = {
        isLoadingComplete: false,
    };

    render() {
        if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
            return (
                <AppLoading
                    startAsync={this._loadResourcesAsync}
                    onError={this._handleLoadingError}
                    onFinish={this._handleFinishLoading}
                />
            );
        } else {
            return (
                <ApolloProvider client={client}>
                    <AppNavigator/>
                </ApolloProvider>

            );
        }
    }

    _loadResourcesAsync = async () => {
        return Promise.all([
            Asset.loadAsync([
                require('./assets/images/Rig-FullView.jpg'),
                require('./assets/images/MiamiFitnessSplashCircle.png'),
            ]),
            Font.loadAsync({
                // This is the font that we are using for our tab bar
                ...Icon.Ionicons.font,
                // We include SpaceMono because we use it in HomeScreen.js. Feel free
                // to remove this if you are not using it in your app
                'StardosStencil-Regular': require('./assets/fonts/StardosStencil-Regular.ttf'),
            }),
        ]);
    };

    _handleLoadingError = error => {
        // In this case, you might want to report the error to your error
        // reporting service, for example Sentry
        console.warn(error);
    };

    _handleFinishLoading = () => {
        this.setState({isLoadingComplete: true});
    };
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});


