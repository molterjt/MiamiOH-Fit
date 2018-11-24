import React from 'react';
import PropTypes from 'prop-types';
import {
    Text, View, StatusBar, StyleSheet, ImageBackground, TouchableOpacity, FlatList, TextInput, ScrollView,Dimensions,
    AsyncStorage, Animated, Modal, Image, Linking, ActivityIndicator, RefreshControl,KeyboardAvoidingView,Platform
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome} from '@expo/vector-icons';
import NewsItem from '../components/NewsItem';
import {graphql,Query} from "react-apollo";
import {withNavigation} from 'react-navigation';
import gql from "graphql-tag";

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

const accessToken = "903600607.3fbfc0b.7141650ef26342dd8706c5e30e476ba1"
const instaUserId = "903600607"

const GET_NEWSITEMS = gql`
    query{
        allNewsItems(filter:{isPublished:true}, orderBy:updatedAt_DESC){
            id
            imageUrl
            title
            blurb
            instructor
            location
        }
    }
`

const CreateCommentByUser = gql`
    mutation createComment($content: String!, $userCommentId: ID!){
        createComment(
            content: $content,
            userCommentId: $userCommentId,
        ){
            id
            content
            classComment{title}
            userComment{username}
        }
    }
`

let queryUserId;

class NewsItemWindow extends React.Component{
    constructor(props){
        super(props);
        this.state={
            refreshing: false
        };
        this._renderItem=this._renderItem.bind(this);
    }
    _renderItem = ({item}) => (
        <NewsItem
            id={item.id}
            title={item.title}
            instructor={item.instructor}
            blurb = {item.blurb}
            location={item.location}
            thumbnail={item.imageUrl}
        />
    );
    _keyExtractor = (item, index) => item.id;

    _onRefresh = () => {
        this.setState({refreshing:true});
        this.props.data.refetch().then(() => {
            this.setState({refreshing: false});
        });
    };

    render(){
        return(
            <Query query={GET_NEWSITEMS}>
                {({loading, error, data}) => {
                    if(loading){
                        return <ActivityIndicator size={'large'} color={'#fff'} />
                    }
                    if(error){
                        console.log('newsItems err ' + error);
                        return <Text style={{backgroundColor:'#4048e1', padding:10, fontWeight:'bold', color:'#fff', textAlign:'center'}}>Sorry, we have encountered an error!  Are you connected to the internet or cellular data?</Text>
                    }
                    return(
                        <FlatList
                            data={data.allNewsItems}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                            horizontal={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}
                                    tintColor={'#fff'}
                                />
                            }
                        />
                    );
                }}
            </Query>
        );
    }
}

const NewsItemWindowWithData = graphql(GET_NEWSITEMS)(NewsItemWindow);

class HomeScreen extends React.Component{

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: (
                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel={'Navigation to Settings Button'}
                    accessibilityHint={'Opens a new window Settings Screen'}
                    accessibilityRole={'link'}
                    style={{marginRight: 15, marginTop:7}}
                    onPress={() => navigation.navigate('Settings')}>
                    {Platform.isPad
                        ? <FontAwesome name={"gear"} type={"MaterialIcons"} size={W/20} color={'#931414'}/>
                        : <FontAwesome name={"gear"} type={"MaterialIcons"} size={30} color={'#931414'}/>
                    }

                </TouchableOpacity>
            ),
            headerLeft: (
                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel={'Navigation to Workouts Button'}
                    accessibilityHint={'Opens a new window Workouts Screen'}
                    accessibilityRole={'link'}
                    style={{marginLeft: 15, marginTop:7}}
                    onPress={() => navigation.navigate('Workouts')}>
                    {Platform.isPad
                        ? <MaterialIcons name={"fitness-center"} type={"MaterialIcons"} size={W/20} color={'#931414'}/>
                        : <MaterialIcons name={"fitness-center"} type={"MaterialIcons"} size={30} color={'#931414'}/>

                    }
                </TouchableOpacity>
            ),
            headerStyle: {
                height: (Platform.isPad ? H*.07 : H*.08)
            }
        };
    };
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            userComment: '',
            commentError:'',
            data: undefined,
            comments: [],
            springVal: new Animated.Value(0),
            showModal: false,
            currentUserId: '',
            currentUserToken: '',

        };
        this._createComment = this._createComment.bind(this);
        this.checkCommentCredentials = this.checkCommentCredentials.bind(this);
        this.findYourFitModal=this.findYourFitModal.bind(this);
        AsyncStorage.getItem("MyUserId").then( (dataId) => {
            queryUserId = JSON.parse(dataId) || 'none';
            this.setState({currentUserId: queryUserId, isLoading: false});
            console.log("Home Screen => queryUserId === " + queryUserId);
            return queryUserId;
        }).catch((err) => console.log('asyncStore homescreen err:  '+ err)).done();
    }
    findYourFitModal(visible){
        this.setState({showModal: visible})
    }

    // componentDidMount(){
    //     // AsyncStorage.getItem("MyUserId").then( (dataId) => {
    //     //     queryUserId = JSON.parse(dataId);
    //     //     this.setState({currentUserId: queryUserId, isLoading: false});
    //     //     console.log("Home Screen => queryUserId === " + queryUserId);
    //     //     return queryUserId;
    //     // }).done();
    // }
    _createComment = async () => {
        const {userComment} = this.state;
        await this.props.createComment({
            variables: {
                content: userComment,
                userCommentId: queryUserId,
            }
        });
        console.log('user comment: ' + userComment);
        this.setState({userComment: ""});
        this.findYourFitModal(!this.state.showModal)
    };
    checkCommentCredentials(){
        const {userComment, commentError} = this.state;
        if(userComment < 1 || commentError) return true;
        else return false;
    };
    render(){
        return (
        <View style={{flex: 1, backgroundColor: 'transparent'}}>

            <StatusBar barStyle="default"/>
            <ImageBackground
                source={require('../assets/images/Rig-FullView.jpg')}
                style={{flex: 1, backgroundColor: 'transparent', justifyContent: 'center'}}
                resizeMode='cover'
            >
                <View style={styles.overlay} />
                <View style={{alignItems: 'center', alignContent: 'center',}}>
                    <Text style={styles.whatNew}>News</Text>
                </View>
                <NewsItemWindowWithData/>
                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel={'FindYourFit Form Button'}
                    accessibilityHint={'Opens a new modal window for find your fitness form'}
                    accessibilityRole={'button'}
                    onPress={() => {
                        this.findYourFitModal(true)
                    }}
                    style={{
                        marginTop: 20, marginBottom: 60, flexDirection: "row", justifyContent: 'center',
                        alignItems: 'center', backgroundColor: "#931414", width: "50%", alignSelf: "center",
                        borderRadius: 10,
                    }}>
                    <Text style={{color: "#fff", fontSize: Platform.isPad ? W*.035 : 18}}>
                        FindYourFIT
                    </Text>
                    <MaterialCommunityIcons
                        name={"checkbox-marked-circle-outline"}
                        size={Platform.isPad ? W*.04 :35}
                        color={"white"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel={'Navigation to MiamiUniversityFitness Instagram'}
                    accessibilityHint={'Opens a new window Settings Screen'}
                    accessibilityRole={'link'}
                    onPress={() => Linking.openURL("https://www.instagram.com/miamiuniversityfitness/")}
                    style={{
                          marginBottom: 20,marginTop: 10, flexDirection: "row",
                          justifyContent: 'center', alignItems: 'center',
                          alignSelf: "center"
                    }}>
                    <FontAwesome
                        name={"instagram"}
                        size={20}
                        color={"white"}
                    />
                    <Text style={styles.instaLink}> MiamiUniversityFitness</Text>
                </TouchableOpacity>
                <Modal
                    transparent={false}
                    animationType={"none"}
                    visible={this.state.showModal}
                    onRequestClose={() => {
                        this.findYourFitModal(!this.state.showModal)
                    }}
                >
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Close FindYourFit Form Button'}
                        accessibilityHint={'Closes modal window for find your fitness form'}
                        accessibilityRole={'button'}
                        onPress={() => {
                            this.findYourFitModal(!this.state.showModal)
                        }}
                        style={{marginLeft: 5, marginTop: 50, flexDirection: "row"}}>
                        <Ionicons name={"md-arrow-back"} size={30} color={"#156DFA"}/>
                        <Text style={{color: "#156DFA", marginTop: 7, marginLeft: 8}}>Go Back</Text>
                    </TouchableOpacity>
                    <ScrollView style={{alignContent:'center'}}>
                        <KeyboardAvoidingView behavior="position" enabled keyboardVerticalOffset={-20}>
                        <Image
                            accessibilityRole={'image'}
                            source={{uri: "https://i.imgur.com/xfTySI5.jpg"}}
                            alt={'Miami Recreation Fitness design element'}
                            resizeMode={'cover'}
                            style={{width: H*.3, height: H*.3, alignSelf:'center'}}
                        />
                        <Text style={{fontStyle:'italic', padding: 20, textAlign:'center', fontSize: Platform.isPad ? W*.02 : 12}}>
                            The Fitness Department strives to create an environment of
                            inclusion for the Miami Recreation community to develop their
                            fitness identity through a variety of options to reach and discover
                            their individual fitness goals.
                        </Text>

                            <Text style={{textAlign:'center', fontSize: Platform.isPad ? W*.02 : 12}}>
                                Tell us how we can help you find your Fit:
                            </Text>

                            <TextInput
                                multiline={true}
                                numberOfLines={9}
                                accessibilityLabel={'Paragraph form field to leave a question or concern'}
                                onChangeText={ (userComment) => this.setState({userComment})}
                                value={this.state.userComment}
                                blurOnSubmit={true}
                                type={"text"}
                                placeholder={'Please provide your feedback'}
                                style={styles.textInput}
                                underlineColorAndroid={'transparent'}
                                autoCorrect={true}
                                keyboardAppearance={'dark'}
                            />
                            <TouchableOpacity
                                accessible={true}
                                accessibilityLabel={'Submit Comment Button'}
                                accessibilityRole={'button'}
                                disabled={this.checkCommentCredentials()}
                                onPress={ () => this._createComment()}
                                style={styles.formButton}
                            >
                                <Text style={{color:'#fff', fontWeight:'bold', fontSize: Platform.isPad ? W*.02 : 12}}>Submit</Text>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </ScrollView>
                </Modal>
            </ImageBackground>
        </View>
        );
    }
}
HomeScreen.propTypes = {
    data: PropTypes.shape({
        loading: PropTypes.bool,
        error: PropTypes.object,
        User: PropTypes.object,
    }),
};

export default graphql(CreateCommentByUser, {name: 'createComment'})(withNavigation(HomeScreen));

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',

    },
    whatNew:{
        color: '#ffffff',
        fontSize: (Platform.isPad ? W/44 :15),
        fontWeight: 'bold',
        marginTop: 20,
        marginRight: 5,
        shadowOffset:{  width: 1.0,  height: 1.5,  },
        shadowColor: '#000',
        shadowOpacity: 1.0,
        shadowRadius: 8
    },
    logo: {
        flex: 1,
        resizeMode: 'cover',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    title: {
        color: 'white'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'black',
        opacity: 0.3
    },
    textInput: {
        alignSelf: 'stretch',
        height: 200,
        margin: 12,
        padding: 5,
        borderBottomColor: '#000000',
        borderWidth: 1,
    },
    formButton: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(155, 10, 2, 0.9)',
        padding: 8,
        marginTop: 10,
        marginBottom: 40,
        width: '33%',
        height: 'auto',
        borderWidth: 2,
        borderRadius: 15,
        borderColor: "#000000"
    },
    instaLink:{
        color:'#fff',
        fontSize: (Platform.isPad ? W/44 :14)
    }
});
