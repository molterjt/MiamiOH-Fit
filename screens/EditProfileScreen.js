import React from 'react';
import {
    Text, View, StatusBar, ActivityIndicator, TextInput, TouchableOpacity,StyleSheet,
    Dimensions, ScrollView, Alert, AccessibilityInfo,AsyncStorage, Platform
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { CheckBox } from 'react-native-elements'
import gql from "graphql-tag";
import { graphql, compose, Query } from "react-apollo";
import {withNavigation} from 'react-navigation';
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const AUTH_TOKEN = 'auth-token';

class EditScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.navigation.state.params.itemId,
            firstName: undefined,
            lastName: undefined,
            dateOfBirth: undefined,
            interests: [],
            checkedInterests: [],
            checked: false
        };
        this._updateInfo = this._updateInfo.bind(this);
        this._deleteThisUser=this._deleteThisUser.bind(this);
        this._handleInterestListCheck = this._handleInterestListCheck.bind(this);
    }

    _handleInterestListCheck(id){
        let checkedInterests = this.state.checkedInterests;
        if(checkedInterests && checkedInterests.includes(id)){
            const index = checkedInterests.indexOf(id);
            checkedInterests.splice(index, 1);
        } else {
            checkedInterests = checkedInterests.concat(id);
        }
        this.setState({checkedInterests});
        console.log(checkedInterests);
    }

    _updateInfo = async () => {
        const {userId, firstName, lastName, dateOfBirth} = this.state;
        await this.props.updateUser({
            variables: {
                id: userId,
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: dateOfBirth,
                interestsArray: this.state.checkedInterests,
            }
        });
        console.log(firstName);
        this.props.navigation.goBack(null);
    };

    _deleteThisUser = async () => {
        const {userId} = this.state;
         Alert.alert(
            'Alert',
            "Are you really, really sure you want to DELETE your account?  There's no take backs!",
            [
                {
                    text: 'DELETE', onPress: async () => {
                        await this.props.deleteUser({
                            variables: {
                                id: userId,
                            }
                        });
                        AsyncStorage.removeItem(AUTH_TOKEN);
                        AsyncStorage.clear();
                        this.props.navigation.navigate('Auth');



                    }
                },
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')}
            ],
            { cancelable: true },
        );
    };

    render() {
        const {params} = this.props.navigation.state;
        return (
            <ScrollView style={styles.rowContainer}>
                <StatusBar barStyle="default"/>
                <View accessible={true} accessiilityLabel={'Profile Form Field Container'}>
                    <TextInput
                        accessible={true}
                        accessibilityLabel={'First Name Form Field'}
                        onChangeText={(firstName) => this.setState({firstName})}
                        type={"text"}
                        placeholder={"First Name"}
                        style={styles.textInput}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        value={this.state.firstName}
                        keyboardAppearance={'dark'}
                    />
                    <TextInput
                        accessible={true}
                        accessibilityLabel={'Last Name Form Field'}
                        onChangeText={(lastName) => this.setState({lastName})}
                        type={"text"}
                        placeholder={"Last Name"}
                        style={styles.textInput}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        value={this.state.lastName}
                        keyboardAppearance={'dark'}
                    />
                    <TextInput
                        accessible={true}
                        accessibilityLabel={'Birth Date Form Field'}
                        onChangeText={(dateOfBirth) => this.setState({dateOfBirth})}
                        type={"text"}
                        placeholder={"Birthday: dd/mm/yyyy"}
                        style={styles.textInput}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        value={this.state.dateOfBirth}
                        keyboardAppearance={'dark'}
                    />
                </View>
                <ScrollView>
                    <Text
                        style={{textAlign:'center', fontStyle:'italic', color: '#fff', fontSize: (Platform.isPad ? WIDTH*.02 : 12),}}
                        accessibilityLabel={'Interest Check Box Header'}
                        accessibilityRole={'header'}
                    >
                        Select Your Interests & Press Submit:
                    </Text>
                    <Query query={INTEREST_LIST} >
                        {({loading, error, data}) => {
                            if(loading){
                                return <ActivityIndicator/>
                            }
                            if(error){
                                console.log(error);
                                return <Text>Sorry, there was an error. Check that you are connected to the internet or cellular data?</Text>
                            }
                            return(
                                <View style={{flexDirection:'row', flexWrap: 'wrap', marginBottom: 10, justifyContent:'center',}}>
                                    {data.allInterests.map((obj, index) =>

                                            <View
                                                accessibilityLabel={'Checkbox Option'} accessibilityHint={'Tap to select if interested'}
                                                key={index} style={styles.containerRow}
                                            >
                                                <CheckBox
                                                    // ref={obj.id}
                                                    containerStyle={{ borderRadius:15, borderWidth:2, borderColor:'#000', backgroundColor: '#fff'}}
                                                    textStyle={{color: '#000', fontSize: (Platform.isPad ? WIDTH*.02 : 12),}}
                                                    value={obj.id}
                                                    title={obj.title}
                                                    checkedColor={'#931414'}
                                                    checkedIcon={'dot-circle-o'}
                                                    uncheckedIcon={'circle-o'}
                                                    onPress={() => this._handleInterestListCheck(obj.id)}
                                                    checked={this.state.checkedInterests && this.state.checkedInterests.includes(obj.id)}
                                                />
                                            </View>
                                    )}
                                </View>
                            );
                        }}
                    </Query>
                </ScrollView>
                <TouchableOpacity
                    accessibilityLabel={'Press to Submit Interest List'}
                    accessibilityRole={'button'}
                    onPress={() => this._updateInfo()}
                    style={styles.formButton}
                >
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    accessibilityLabel={'Press to Delete you user account'}
                    accessibilityRole={'button'}
                    style={{marginBottom: 40, marginTop: 0, borderRadius: 8, padding:3, alignSelf: 'center', justifyContent: 'center',alignItems:'center', width: '40%', borderWidth:1, borderColor: '#fff'}}
                    onPress={() => this._deleteThisUser()}>
                    <MaterialCommunityIcons
                        name={"delete-forever"}
                        size={38}
                        color={'#fff'}
                    />
                    <Text style={{color: "#fff", fontSize: 12, fontWeight:'bold', marginTop:5, alignSelf: 'center'}}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }
}
const updateProfile = gql`
    mutation updateUser($id:ID!, $firstName: String, $lastName: String, $dateOfBirth: String, $interestsArray: [ID!]){
        updateUser(id: $id, firstName: $firstName, lastName:$lastName, dateOfBirth: $dateOfBirth, interestsIds: $interestsArray){
            firstName
            lastName
            phone
            dateOfBirth
            interests{title}
        }
    }
`;
const INTEREST_LIST = gql`
    query{
        allInterests(orderBy: title_ASC){
            id
            title
        }
    }
`;
const DELETE_PROFILE = gql`
    mutation deleteUser($id:ID!){
        deleteUser(id: $id){
            username
        }
    }
`


export default compose(
    graphql(updateProfile, {name: 'updateUser'}),
    graphql(DELETE_PROFILE, {name: 'deleteUser'})
)(withNavigation(EditScreen));



const styles = StyleSheet.create({

    container:{
        flex: 1,
        justifyContent: 'space-around',
        margin: 1,
        width: WIDTH*.99
    },
    containerRow:{
        borderRadius:15,
        width: WIDTH*.46 || 'auto',
        backgroundColor: 'transparent'

    },
    rowColumn:{
        flex:2,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: WIDTH * .4,
    },
    textInput: {
        alignSelf: 'center',
        width: WIDTH*.65,
        height: (Platform.isPad ? HEIGHT*.05 : 40),
        margin: 10,
        padding: 10,
        borderColor: '#000000',
        borderWidth: 1,
        backgroundColor: '#fff'
    },
    formButton: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'rgba(155, 10, 2, 0.9)',
        backgroundColor: '#3072b2',
        padding: 8,
        marginTop: 20,
        marginBottom: 40,
        width: '33%',
        height: 'auto',
        borderWidth:1,
        borderRadius: 15,
        borderColor: '#fff',
    },
    buttonText:{
        fontSize: (Platform.isPad ? WIDTH*.03 : 16),
        fontWeight: 'bold',
        color: "#ffffff",
        alignSelf: 'center',
        alignContent:'center',
        justifyContent:'center',

    },
    rowContainer: {
        flexDirection: 'column',
        backgroundColor: '#931414',
        height: 'auto',
        padding: 10,
        marginRight: 3,
        marginLeft: 3,
        marginTop: 10,
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#CCC',
        shadowOpacity: 1.0,
        shadowRadius: 1,
        paddingBottom:100
    },
    rowText: {
        flex: 1,
        height: 'auto',
        width: WIDTH*.7,
        paddingBottom: 20,
        paddingLeft: 10,
        paddingRight: 10
    },
});