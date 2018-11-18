import React from 'react';
import PropTypes from 'prop-types';
import {View, Button, Text, AsyncStorage, TouchableOpacity} from 'react-native';
import { ApolloClient, gql } from 'react-apollo';
import {withNavigation} from 'react-navigation';

const AUTH_TOKEN = 'auth-token';

class Logout extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }
    componentDidMount(){
        try{
            AsyncStorage.getItem(AUTH_TOKEN).then((value) => {
                if(value === null){
                    console.log('No authToken found in AsyncStorage')
                }
                else{
                    const authToken = JSON.parse(value);
                    this.setState({auth: authToken});
                    console.log("auth === " + authToken);
                    return authToken;
                }

            }).done();
        } catch (error){
            console.log(error);
        }
    }
     async removeItemsByKey(key) {
         try {
             await AsyncStorage.removeItem(key);
             return true;
         }
         catch(exception) {
             return false;
         }
    }
    render(){
        const {auth} = this.state;
        const {client} = this.props;
        return(
            <View>
                <View>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Logout Link Button'}
                        accessibilityRole={'link'}
                        onPress={ () => {
                            AsyncStorage.clear();
                            this.removeItemsByKey(AUTH_TOKEN);
                            this.removeItemsByKey("MyUserId");
                            AsyncStorage.clear();

                            try {
                                // clear apollo client cache/store
                                if (client && typeof client.resetStore === 'function') {
                                    client.resetStore();
                                    console.log('resetStore() fired');
                                    console.log('auth: ' + auth);
                                }
                            } catch (e) {
                                console.error('err client', e)
                            }
                            console.log(auth);
                            //this.props.navigation.navigate('SignedOut');
                            this.props.navigation.navigate('AuthLoading')
                        }}
                    >
                        <Text style={{fontSize:16, color: 'blue', marginRight: 8}}>{this.props.buttonText}</Text>
                        {this.props.children}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
Logout.propTypes = {
    client: PropTypes.instanceOf(ApolloClient),
}

export default withNavigation(Logout);