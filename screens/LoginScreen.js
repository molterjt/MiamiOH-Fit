import React from 'react';
import {
    Button, Text, TextInput, Alert, ActivityIndicator,Dimensions,KeyboardAvoidingView,
    View, StyleSheet, ImageBackground,Animated,Easing, Image, Platform,
    TouchableOpacity, AsyncStorage
} from 'react-native';
import {withNavigation} from 'react-navigation';
import gql from 'graphql-tag';
import {graphql, compose} from 'react-apollo';
import {AUTH_TOKEN} from "../constants/auth";
import validation from 'validate.js';

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

let queryUserId;


const constraints = {
    email:{
        presence: {
            message: '^Please enter an email address',
        },
        email: {
            message: '^Please enter a valid email address'
        },
    },
    password: {
        presence: {
            message: '^Please enter a password'
        },
        length: {
            minimum: 7,
            message: '^Your password must be at least 8 characters'
        }
    },
    username: {
        presence: {
            message: '^Please enter a username'
        },
        length: {
            minimum: 8,
            message: '^Your username must be at least 8 characters'
        },
    }
}

const validate = (fieldName, value) => {
    let formValues = {};
    formValues[fieldName] = value;

    let formFields = {};
    formFields[fieldName] = constraints[fieldName];

    const result = validation(formValues, formFields);
    if(result){
        return result[fieldName][0]
    }
    return null;
};


class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            springVal: new Animated.Value(0.8),
            fadeVal: new Animated.Value(0.5),
            loading: true,
            login: true,
            registerActivity: false,
            email: '',
            password: '',
            username: '',
            graphQL_Error: null,
            emailError: '',
            passwordError: '',
            usernameError: '',
        };
        this._saveUserToken = this._saveUserToken.bind(this);
        this._saveUserId = this._saveUserId.bind(this);
        this._confirm = this._confirm.bind(this);
        this.checkRegisterCredentials = this.checkRegisterCredentials.bind(this);
        this.checkLoginCredentials = this.checkLoginCredentials.bind(this);
        this.clearUserFormInputs = this.clearUserFormInputs.bind(this);
        this.showRegisterActivity = this.showRegisterActivity.bind(this);
        this.hideActivityIndicator = this.hideActivityIndicator.bind(this);
        this.mounted=false;
        this.spinValue= new Animated.Value(0)

    }
    spin(){
        this.spinValue.setValue(0);
        Animated.timing(
            this.spinValue,{
                toValue:1,
                duration:6000,
                easing: Easing.linear()
            }
        ).start( () => this.spin());
    }

    spring(){
        this.spinValue.setValue(0);
        Animated.sequence([
            Animated.spring(this.state.springVal, {
                toValue: 0.25,
                friction: 10,
                tension: 12
            }),
            Animated.parallel([
                Animated.spring(this.state.springVal, {
                    toValue: 3.5,
                    friction: 10,
                    tension: 12
                }),
                Animated.timing(
                    this.spinValue,{
                        toValue:1,
                    }
                ),
            ])
        ]).start( () => this.spring());
    }


    checkRegisterCredentials(){
        const {email, password, username, emailError, passwordError, usernameError} = this.state;
        if(email < 7 || emailError) return true;
        else if(password < 7 || passwordError) return true;
        else if(username < 7 || usernameError) return true;
        else return false;
    };
    checkLoginCredentials(){
        const {email, password, emailError, passwordError} = this.state;
        if(email < 7  || emailError) return true;
        else if(password < 7 || passwordError) return true;
        else return false;
    };
    clearUserFormInputs(){
        this.setState({
            email: '',
            password: '',
            username: ''
        });
    };
    componentDidMount(){
        this.mounted=true;
        this.spring();
        setTimeout(() => this.setState({loading:false}), 2900);
    };
    componentWillUnmount() {
        this.mounted=false;
    }
    showRegisterActivity(){
        this.setState({registerActivity: true});
    };
    hideActivityIndicator(){
        this.setState({registerActivity:false});
    }
    _saveUserToken = token => {
        AsyncStorage.setItem(AUTH_TOKEN, JSON.stringify(token));
    };
    _saveUserId = id => {
        AsyncStorage.setItem("MyUserId", JSON.stringify(id));
    };

    _confirm = async () => {
        const {username, email, password, login} = this.state;
        console.log('u: ' + username + ', e: ' + email + ', p: ' +  password +', log: ' + login);

        if(this.state.login){
            const result = await this.props.authenticateUser({
                variables: {email, password},
            }).catch(error => {
                console.log(error.message);
                this.setState({graphQL_Error: error.message});
            });
            if(result){
                const {token} = result.data.authenticateUser;
                const {id} = result.data.authenticateUser;
                this._saveUserToken(token);
                this._saveUserId(id);
                console.log("LoginScreen => Token: " +token);
                console.log("LoginScreen => ID: " + id);
                this.props.navigation.navigate('Intro');
            }

        } else {
            const result = await this.props.signupUser({
                variables: {email, password, username}
            }).catch(error => {
                console.log(error.message);
                this.setState({graphQL_Error: error.message});
            });
            if(result){
                const {token} = result.data.signupUser;
                const {id} = result.data.signupUser;
                Alert.alert('','You have successfully registered. Now Login then update your Profile in Settings');
                console.log('LoginScreen => Token:' + token);
                console.log('LoginScreen => UserId:' + id);
                this._saveUserToken(token);
                this._saveUserId(id);
                this.hideActivityIndicator();
                this.setState({login: true});
                //this.props.navigation.navigate('Login');
            }
        }
    };

    render(){
        const {login, email, password, username, emailError, passwordError, usernameError, graphQL_Error, registerActivity} = this.state;
        if(this.state.loading){
            /*const animations = arr.map((a, i) => {
                return <Animated.View key={i} style={{opacity: this.animatedValue[a], height: H*.04, width: W*.1, backgroundColor: 'red', marginLeft: 1 , marginTop: 1, borderRadius: 50}} />
            });
            return (
                <View style={styles.container}>
                    {animations}
                </View>
            );*/
            const spin = this.spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '720deg']
            });

            return (
                <View style={styles.container}>
                    <Animated.View
                        style={{
                            // opacity: this.state.fadeVal,
                            transform: [{scale: this.state.springVal }]
                        }}>
                        <Animated.Image
                            style={{
                                width: 150,
                                height: 150,
                                transform: [{rotate: spin}] }}
                            source={require('../assets/images/MiamiFitnessSplashCircle.png')}
                        />
                    </Animated.View>
                </View>
            )
        }

        return(
            <View style={{flex: 1, backgroundColor: 'black'}}>
                <KeyboardAvoidingView behavior="position" enabled keyboardVerticalOffset={-140} style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', marginTop: -20}}>
                    <View style={{alignItems:'center'}}>
                        <Image
                            source={require('../assets/images/MiamiFitnessSplashCircle.png')}
                            resizeMode={'cover'}
                            style={{height:H*.3, width:H*.3, shadowOffset:{  width: 1.0,  height: 1.0  },
                                shadowColor: '#000',
                                shadowOpacity: 2.0,
                                shadowRadius: 4}}
                        />
                    </View>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>MiamiOH Fit</Text>
                    </View>
                    <View>
                        {!this.state.login && (
                            <View>
                            <TextInput
                                value={this.state.username}
                                onChangeText={ (username) => {
                                    this.setState({username});
                                    this.setState({usernameError: validate('username', username)})
                                }}
                                onBlur={() => this.setState({graphQL_Error: null})}
                                type={'text'}
                                accessibilityLabel={'Username field for Registration'}
                                placeholder={'Choose your username'}
                                style={styles.textInput}
                                autoCapitalize={'none'}
                                underlineColorAndroid={'transparent'}
                                autoCorrect={false}
                                placeholderTextColor={'#4f4f4f'}
                                keyboardAppearance={'dark'}
                            />
                                {usernameError
                                    ? <Text style={{color: '#c81515', textAlign:'center'}}>{usernameError}</Text>
                                    : null
                                }
                            </View>
                        )}

                        <TextInput
                            value={this.state.email}
                            onChangeText={ (email) => {
                                this.setState({email});
                                this.setState({emailError: validate('email', email)});
                            }}
                            onBlur={() => this.setState({graphQL_Error: null})}
                            type={"text"}
                            placeholder={'Enter your email (ex: UniqueId@MiamiOH.edu)'}
                            style={styles.textInput}
                            autoCapitalize={'none'}
                            accessibilityLabel={'Email field for Registration/Login'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            label={'Email'}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}

                        />
                        {emailError
                            ? <Text style={{color: '#c81515', textAlign:'center'}}>{emailError}</Text>
                            : null
                        }
                        <TextInput
                            value={this.state.password}
                            onChangeText={ (password) => {
                                this.setState({password});
                                this.setState({passwordError: validate('password', password)});
                            }}
                            onBlur={() => this.setState({graphQL_Error: null, registerActivity: false})}
                            type={"password"}
                            placeholder={'Enter your Password'}
                            secureTextEntry={true}
                            accessibilityLabel={'Password field for Registration/Login'}
                            underlineColorAndroid={'transparent'}
                            style={styles.textInput}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}

                        />
                        {passwordError
                            ? <Text style={{color: '#c81515', textAlign:'center'}}>{passwordError}</Text>
                            : null
                        }
                        {registerActivity && !passwordError && !emailError && !graphQL_Error
                            ? <ActivityIndicator size="large" color={'#0a3efa'}/>
                            : null
                        }
                    </View>
                    {graphQL_Error
                        ? <Text style={{color: '#c81515', textAlign:'center', fontWeight: 'bold'}}>{graphQL_Error.substring(34).toUpperCase()}!!</Text>
                        : null
                    }
                    {!login
                        ?
                        (<TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Register Button'}
                            accessibilityHint={'Complete form field then press Register Button'}
                            accessibilityRole={'button'}
                            onPress={ () => {
                                this.showRegisterActivity();
                                this._confirm();
                                this.clearUserFormInputs();

                            }}
                            style={styles.formButton}
                            disabled={this.checkRegisterCredentials()}

                        >
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>)
                        :
                        (<TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Login Button'}
                            accessibilityHint={'Complete form field then press Login Button'}
                            accessibilityRole={'button'}
                            onPress={ () => {
                                this.showRegisterActivity();
                                this._confirm();
                                this.clearUserFormInputs();

                            }}
                            style={styles.formButton}
                            disabled={this.checkLoginCredentials()}

                        >
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>)
                    }

                    <View style={{marginTop: 10}}>
                        <Text style={{color: '#000', alignSelf:'center'}}>
                            {this.state.login ? 'Need to create an account?' : 'Already have an account?'}
                        </Text>
                        {!this.state.login ?
                            <TouchableOpacity
                                accessible={true}
                                accessibilityLabel={'Login Switch Button'}
                                accessibilityHint={'Switch from register to login screen'}
                                accessibilityRole={'button'}
                                onPress={ () => this.setState({login: !this.state.login})}
                            >
                                <Text style={{color:'#0a3efa', textAlign:'center', fontSize: Platform.isPad ? W*.025 :14}}>
                                   Login
                                </Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity
                                accessible={true}
                                accessibilityLabel={'Register Switch Button'}
                                accessibilityHint={'Switch from login to register screen'}
                                accessibilityRole={'button'}
                                onPress={ () => this.setState({login: !this.state.login})}
                            >
                                <Text style={{color:'#0a3efa', textAlign:'center', fontSize: Platform.isPad ? W*.025 :14}}>
                                     Register
                                </Text>
                            </TouchableOpacity>

                        }
                    </View>
                </KeyboardAvoidingView>
            </View>

        );
    }

}

const SIGNUP_USER = gql`
    mutation SignUpUser($email: String!, $password: String!, $username: String!){
        signupUser(email:$email,password: $password, username: $username){
            id
            token
        }
    }
`

const LOGIN_USER = gql`
    mutation LoginUser($email: String!, $password: String!){
        authenticateUser(email: $email, password: $password){
            id
            token
            
        }
    }
`


export const LoginFlow =  compose(
    graphql(SIGNUP_USER, {name: 'signupUser'}),
    graphql(LOGIN_USER, {name: 'authenticateUser'}),
)(withNavigation(Login));


class LoginView extends React.Component{
    static navigationOptions = {
        header: null,
    };
    constructor(props){
        super(props);
    }
    render(){
        return(
            <View style={{flex: 1, backgroundColor: 'rgba(0, 10, 0, 0.0)'}}>
                <LoginFlow/>
            </View>
        );
    }
}

export default withNavigation(LoginView);

const styles = StyleSheet.create({
    textInput: {
        alignSelf: 'stretch',
        height: 40,
        margin: 20,
        padding: 10,
        borderWidth:0.5,
        borderColor:'#4f4f4f',
        // borderBottomColor: '#000000',
        // borderBottomWidth: 1,
        backgroundColor: "#fff"
    },
    header:{
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,

    },
    headerText:{
        fontSize: 40,
        fontFamily: 'StardosStencil-Regular',
        color:'#000'
        // color: '#c81515',
    },
    formButton: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'rgba(155, 10, 2, 0.9)',
        backgroundColor: '#3072b2',
        padding: 8,
        marginTop: 30,
        marginBottom: 20,
        width: '33%',
        height: 'auto',
        borderWidth:1,
        borderRadius: 15,
        borderColor: '#000',
    },
    buttonText:{
        fontSize: Platform.isPad ? W*.03 :16,
        color: "#ffffff",
        alignSelf: 'center',
        alignContent:'center',
        justifyContent:'center',
    },

    rowContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        height: 'auto',
        padding: 10,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 10,
        borderRadius: 4,
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#CCC',
        shadowOpacity: 1.0,
        shadowRadius: 1
    },
    title: {
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#777'
    },
    instructor: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#777'
    },
    blurb: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#777'
    },
    location: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#777'
    },
    thumbnail: {
        flex: 1,
        height: undefined,
        width: 90
    },
    rowText: {
        flex: 4,
        flexDirection: 'column',
        height: 'auto'
    },
    categoryThumb:{
        width: 220,
        height: 175,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'grey',
        opacity: 0.2
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        justifyContent:'center',
        alignItems:'center',
    }
});
