import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, AsyncStorage, Text, View, ActivityIndicator, ScrollView,Platform,
    TouchableOpacity, Dimensions, StyleSheet, RefreshControl, Easing, Animated
} from 'react-native';
import {Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import UserProfile from '../components/UserProfile';
import Logout from '../components/Logout';
import gql from "graphql-tag";
import {graphql, compose} from "react-apollo";
import WorkoutRecord from '../components/WorkoutRecord';

import moment from 'moment';
import {AUTH_TOKEN} from "../constants/auth";

const { width, height } = Dimensions.get("window");

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const GET_WORKOUT = gql`
    query($id:ID!){
        Workout(id:$id){
            id
            title
            type{title}
            description
            exercises{name, sets, reps, intensity, tempo, id}
            imageUrl
        }
    }
`;


const GET_USER = gql`
    query ProfileUser($id: ID!){
        User(id: $id){
            id
            username
            firstName
            lastName
            email
            phone
            dateOfBirth
            usersSets{
                workoutSets{
                    title
                    exercises{
                        name, sets, reps
                    }
                    exerciseSets{setName, repsHit, weightUsed, usersSets{firstName}}
                }
            }
            imageUrl
            interests{title}
            workouts{id, createdAt, title, days{name}, type{title}}
            memberships{title}
            classes{title}
            classCheckIns: checkins( filter:{workouts_none:{} AND: {events_none:{}}} orderBy: createdAt_DESC, first:1){
                classes{
                    id, title, category{title}, time, days{name}
                },
                timeCheck, 
                createdAt
            }
            workoutCheckins: checkins(filter:{classes_none: {} AND: {events_none:{}}} orderBy: createdAt_DESC, first:1){
                workouts{
                    id,
                    title,
                    type{title},
                    exercises{
                        name,
                        reps,
                        sets
                    }
                }
                timeCheck
                createdAt
            }
            
        }
    }
`

let queryUserId;
// setTimeout(() => {}, 1000);

class ProfileScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={
            springVal: new Animated.Value(0.8),
            loading: true,
            refreshing:false,
            currentUserToken: '',
            currentUserId: '',
            profileUpdate: false,
            isLoading: true,
            profileRefresh: false,
            showAllClassCheckins:false,
        };
        this.toggleClassCheckinsModal=this.toggleClassCheckinsModal.bind(this);
        this.jumpToUserCheckinHistory=this.jumpToUserCheckinHistory.bind(this);
        this._onRefresh=this._onRefresh.bind(this);
        this.fetchUserIdentity=this.fetchUserIdentity.bind(this);
        this.spinValue= new Animated.Value(0);

        AsyncStorage.getItem("MyUserId").then( (dataId) => {
            queryUserId = JSON.parse(dataId);
            // this.setState({currentUserId: queryUserId});
            console.log("Profile => queryUserId === " + queryUserId);
            return queryUserId;
        }).done();
        // this.queryValue = this.fetchUserIdentity();
    }
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerRight: (
                <Logout buttonText={'Logout'} style={{fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}/>
            ),
        };
    };
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

    _onRefresh = () => {
        this.setState({refreshing:true});
        this.props.data.refetch().then(() => {
            this.setState({refreshing: false});
        });
    };

    fetchUserIdentity = async () => {
        const UserIdentity = await AsyncStorage.getItem("MyUserId");
        console.log("Profile => queryUserId === " + JSON.parse(UserIdentity));
        queryUserId = JSON.parse(UserIdentity);
        console.log("Profile => queryUserId ===**** " + queryUserId);
        this.setState({isLoading: false});
    };
    componentDidMount(){
        //setTimeout(() => this.fetchUserIdentity(), 800);
        this.fetchUserIdentity();
        this.spring();
        setTimeout(() => this.setState({isLoading:false}), 2000);

    }
    componentWillMount(){
        this.fetchUserIdentity();
    }
    jumpToUserCheckinHistory = (userIdentity) => {
        this.props.navigation.navigate("CheckinHistory", {itemId: userIdentity});
    };
    toggleClassCheckinsModal(visible){
        this.setState({showAllClassCheckins: visible});
    }
    render(){
        if(this.state.isLoading){
            const spin = this.spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '720deg']
            });
            return (
                <View style={styles.animationContainer}>
                    <Animated.View
                        style={{
                            transform: [{scale: this.state.springVal }]
                        }}>
                        <Animated.Image
                            style={{
                                width: 150,
                                height: 150,
                                transform: [{rotate: spin}] }}
                            source={require('../assets/images/MiamiFitnessSplash.png')}
                        />
                    </Animated.View>
                </View>
            )
        }
        this.props.data.refetch({id: queryUserId});

        const { loading, error, User,  } = this.props.data;
        console.log('Profile Screen => queryUserId:  ' + queryUserId);
        if(loading || error){
            console.log("err: "+ error);
            const spin = this.spinValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '720deg']
            });

            return (
                <View style={styles.animationContainer}>
                    <Animated.View
                        style={{
                            transform: [{scale: this.state.springVal }]
                        }}>
                        <Animated.Image
                            style={{
                                width: 150,
                                height: 150,
                                transform: [{rotate: spin}] }}
                            source={require('../assets/images/MiamiFitnessSplash.png')}
                        />
                    </Animated.View>
                </View>
            )
        }
        return(
            <View style={{flex: 1, backgroundColor: '#931414', marginBottom: 0, paddingTop: 0}}>
                <ScrollView
                    style={{padding: 5, paddingBottom:20, marginBottom: 10}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                            tintColor={'#156DFA'}
                        />
                    }
                >
                    <View style={{width: WIDTH, backgroundColor: "transparent", alignContent:'center',justifyContent:'center', alignItems:'center' }}>
                        <Text style={{color:'white', fontSize: (Platform.isPad ? WIDTH*.015 : 10)}}>Pull-To-Refresh</Text>
                        <MaterialCommunityIcons
                            name={"chevron-double-down"} type={"MaterialCommunityIcons"} size={Platform.isPad ? WIDTH*.05 : 35} color={'blue'}
                        />
                    </View>
                    <UserProfile
                        id={User.id}
                        username={User.username}
                        firstName={User.firstName}
                        lastName={User.lastName}
                        email={User.email}
                        dateOfBirth={User.dateOfBirth}
                        interests={User.interests.map(({title}) => title).join(', ')}
                    />
                    <View sytle={{flexDirection:'row',alignContent: 'center', justifyContent:'center', alignSelf: 'center', marginTop:10}}>
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Check-in and Workout History Link Button'}
                            accessibilityHint={'Links to new screen with check-in history'}
                            accessibilityRole={'link'}
                            style={{alignItems:'center', flexDirection:'column', justifyContent:'center',marginTop:10}}
                            onPress={() => {
                                this.jumpToUserCheckinHistory(User.id);
                            }}
                        >
                            <Text style={{textAlign:"center", color: "#fff", marginRight: 0,
                            fontSize: (Platform.isPad ? WIDTH*.02 : 12),}}>All Workout, GroupFit & Event Records</Text>
                            <MaterialCommunityIcons
                                name={"library-books"} type={"MaterialCommunityIcons"} size={Platform.isPad ? WIDTH*.05 : 35} color={'#fff'}
                                style={{textAlign:"center"}}
                            />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <View style={{borderRadius: 4, shadowOffset:{  width: 1,  height: 1,  }, shadowColor: '#CCC',backgroundColor: '#fff', margin:5, padding:5, borderColor: '#000', borderWidth: 2, alignItems: 'center'}}>
                            <Text style={{fontStyle: 'italic', fontWeight: 'bold', fontSize: (Platform.isPad ? WIDTH*.03 : 16)}}>Latest Workout Completed</Text>
                        </View>
                        {User.workoutCheckins.map(({workouts, createdAt, timeCheck}, index) => (
                            workouts.map((obj) => (
                                <View key={index} style={{borderRadius: 4,
                                    shadowOffset:{  width: 1,  height: 1,  }, shadowColor: '#CCC',backgroundColor: '#eff4f4', margin:2, padding:5, borderColor: '#000', borderWidth: 2}}>
                                    <View style={{flexDirection: 'row', display: 'flex'}}>
                                        <Text style={{fontSize: (Platform.isPad ? WIDTH*.03 : 16), fontWeight: 'bold', color: '#931414', marginBottom: 4}}>{obj.title}</Text>
                                    </View>
                                    <View style={{flexDirection:'row', marginTop: 5, marginBottom:5}}>
                                        <Text style={{fontWeight: 'bold', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>TimeStamp: </Text>
                                        <Text style={{fontStyle: 'italic', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{moment(createdAt).format('M/D/Y')} at {moment(createdAt).format('hh:mm a')}</Text>
                                    </View>
                                    <View style={{flexDirection:'row', flexWrap:'wrap', marginBottom: 5}}>
                                        <Text style={{fontWeight: 'bold', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>Type: </Text>
                                        <Text style={{fontStyle: 'italic', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{obj.type.map(({title}) => title).join(', ')}</Text>
                                    </View>
                                    <View style={{borderWidth: 1, padding: 5}}>
                                    <View style={{flex:1, flexDirection:'row', flexWrap:'wrap', marginTop:10}}>
                                        <Text style={{width: '55%', fontWeight:'bold', paddingLeft: 10, fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>Exercises:</Text>
                                        <Text style={{width: '20%', fontWeight:'bold', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>Sets:</Text>
                                        <Text style={{width: '20%', fontWeight:'bold', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>Reps:</Text>
                                    </View>
                                    {obj.exercises.map(({name, sets, reps}, index) => (
                                        <View key={index} style={{flex:1, flexDirection:'row', flexWrap:'wrap',}}>
                                            <Text style={{ fontStyle: 'italic', padding:3, width: '55%', paddingLeft:10, fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{name}</Text>
                                            <Text style={{ fontStyle: 'italic', padding:3, width: '20%', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{sets}</Text>
                                            <Text style={{fontStyle: 'italic', padding:3, width: '20%',fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{reps}</Text>
                                        </View>
                                    ))}
                                    </View>
                                    <View style={{marginBottom: 6}}/>
                                    <WorkoutRecord userId={User.id} timeCheck={timeCheck} workoutId={obj.id} workoutTitle={obj.title}/>
                                </View>
                            ))
                        ))}
                    </View>
                    <View style={{marginTop:20}}>
                        <View style={{borderRadius: 4, shadowOffset:{  width: 1,  height: 1,  }, shadowColor: '#CCC',backgroundColor: '#fff', margin:5, padding:5, borderColor: '#000', borderWidth: 2, alignItems: 'center'}}>
                            <Text style={{fontStyle: 'italic', fontWeight: 'bold', fontSize: (Platform.isPad ? WIDTH*.03 : 16)}}>Latest GroupFit Class Checkin</Text>
                        </View>
                        {User.classCheckIns.map(({createdAt, classes}) => (
                            classes.map((obj, index) => (
                                <View key={index} style={{borderRadius: 4,
                                    shadowOffset:{  width: 1,  height: 1,  },
                                    shadowColor: '#CCC',backgroundColor: '#eff4f4', margin:2, padding:5, borderColor: '#000', borderWidth: 2}}>
                                    <View style={{flexDirection: 'row', display: 'flex'}}>
                                        <Text style={{fontWeight: 'bold', color: '#931414',fontSize: (Platform.isPad ? WIDTH*.03 : 16)}}>{obj.title}</Text>
                                        <Text style={{position:'absolute', right: 0, fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{obj.time}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', display: 'flex'}}>
                                        <Text style={{fontWeight:'bold', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>Type: </Text>
                                        <Text style={{fontStyle: 'italic', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}> {obj.category.map(({title}) => title).join(', ')}</Text>
                                        <Text style={{position:'absolute', right: 0, fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{obj.days.map(({name}) => name).join(', ')}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', display: 'flex'}}>
                                        <Text style={{fontWeight:'bold', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>TimeStamp: </Text>
                                        <Text style={{fontStyle: 'italic', fontSize: (Platform.isPad ? WIDTH*.02 : 12)}}>{moment(createdAt).format('M/D/Y')} at {moment(createdAt).format('hh:mm:ss a')}</Text>
                                    </View>
                                </View>
                            ))
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    }
}
ProfileScreen.propTypes = {
    data: PropTypes.shape({
        loading: PropTypes.bool,
        error: PropTypes.object,
        User: PropTypes.object,
    }),
    currentUserId: PropTypes.string,
};

export default
    graphql(GET_USER,{
        options: ({props}) => {
            return{
                fetchPolicy: 'network-only',
                variables: {
                    id: queryUserId
                },
                notifyonnetworkstatuschange: true
            }
        },
    })(ProfileScreen);

const styles = StyleSheet.create({

    rowColumn:{
        flexDirection:'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
        width: WIDTH * .98,
        height: 80,
        borderWidth: 2,
        borderColor: "#000",
        backgroundColor: '#cdcdcd',
        margin:2,
        padding: 0,
    },
    container: {
        flex: 1,
        backgroundColor: "#000"
    },
    mapContainer:{
        height: height*.6,
    },
    scrollView: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },
    /****************/
    profileButton:{
        alignItems: 'center',
        padding:1,
        fontWeight: 'bold',
        backgroundColor: "#277bfa",
        borderRadius: 15,
    },

    modalContainer: {
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
    },
    ModalInsideView:{
        alignItems: 'center',
        backgroundColor : "#fff",
        height: 600 ,
        width: '90%',
        borderRadius:10,
        borderWidth: 3,
        borderColor: '#156DFA',
        opacity: 0.9,
        marginBottom: 30,
    },
    closeButton: {
        alignSelf: 'flex-end',
        position:'relative',
        justifyContent: "flex-end",
        top: 2,
        right: 7,
    },
    trainerDetailText: {
        color: "#fff",
        fontSize: (Platform.isPad ? WIDTH*.02 : 12),
    },
    trainerDetailName:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: (Platform.isPad ? WIDTH*.03 : 16),
    },
    animationContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        justifyContent:'center',
        alignItems:'center',
    }
});