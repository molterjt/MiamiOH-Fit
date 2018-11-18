import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, Modal, WebView, Alert, ActivityIndicator, AsyncStorage} from 'react-native';
import { Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import gql from 'graphql-tag';
import {graphql, compose} from 'react-apollo';
import moment from 'moment';


const CreateEventCheckIn = gql`
    mutation CreateEventCheckInByUser($checked: Boolean, $eventsIds: [ID!], $usersIds: [ID!], $timeCheck:String){
        createCheckin(checked: $checked, eventsIds: $eventsIds, usersIds: $usersIds, timeCheck: $timeCheck){
            id
            createdAt
            timeCheck
            events{name}
            users{username}
        }
    }
`
let queryUserId;

class Event extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isLoading: true,
            eventRegisterModal: false,
            checked: true,
            timeCheck: undefined,
            currentUserId: undefined,
            setTimeCheck: undefined,
        };
        AsyncStorage.getItem("MyUserId").then( (dataId) => {
            queryUserId = JSON.parse(dataId);
            // this.setState({currentUserId: queryUserId, isLoading: false});
            console.log(" Event Screen -> ComponentDidMount => queryUserId === " + queryUserId);
            // console.log('Event Screen -> ComponentDidMount => currentUserId: ' + this.state.currentUserId);
            return queryUserId;
        }).done();
        this.showEventRegisterModal = this.showEventRegisterModal.bind(this);
        this._submitEventCheckIn = this._submitEventCheckIn.bind(this);
    }
    showEventRegisterModal(visible){
        this.setState({eventRegisterModal: visible})
    }
    componentDidMount(){
        // AsyncStorage.getItem("MyUserId").then( (dataId) => {
        //     queryUserId = JSON.parse(dataId);
        //     this.setState({currentUserId: queryUserId, isLoading: false});
        //     console.log(" Event Screen -> ComponentDidMount => queryUserId === " + queryUserId);
        //     console.log('Event Screen -> ComponentDidMount => currentUserId: ' + this.state.currentUserId);
        //     return queryUserId;
        // }).done();
        this.setState({currentUserId: queryUserId, isLoading: false});
    }
    _submitEventCheckIn = async (eventIdentity) => {
        const {checked, timeCheck, currentUserId} = this.state;
        const currentTime = moment();
        const customTime = moment({
            year: moment(currentTime).year(),
            month: moment(currentTime).month(),
            day: moment(currentTime).date(),
            hour: moment(currentTime).hours()
        });
        const subTime = customTime.toISOString();
        this.setState({
            timeCheck: subTime
        });
        // const UserSet = JSON.parse(queryUserId);
        // console.log('UserSet: ' + UserSet);
        await this.props.CreateEventCheckInByUser({
            variables: {
                checked: checked,
                timeCheck: subTime,
                usersIds: queryUserId,
                eventsIds: eventIdentity,
            }
        });
        console.log('Workout Check-In Mutation Complete');
        console.log('timeCheck: ' + moment(timeCheck).format('M/D/Y h a'));
    };

    render(){
        if(this.state.isLoading){
            return(
                <ActivityIndicator size={'large'} color={'blue'} />
            )
        }
        return(
            <View style={styles.rowCard} key={this.props.id}>
                <View style={styles.imageRowContainer}>
                    <Image source={{uri: this.props.image}}
                           style={styles.image}
                           resizeMode="contain"
                           alt={'Banner image for this event'}
                    />
                </View>
                <View style={styles.rowContainer} key={this.props.id}>
                    <View style={styles.rowText} >
                        <View style={{flexDirection: "row"}}>
                            <Text style={styles.date} numberOfLines={2} ellipsizeMode ={'tail'}>
                                {this.props.date}
                            </Text>
                            <Text style={styles.date} numberOfLines={1} ellipsizeMode ={'tail'}>
                                {this.props.days}
                            </Text>
                            <Text style={styles.date} numberOfLines={1} ellipsizeMode ={'tail'}>
                                {this.props.time}
                            </Text>
                            </View>
                        <Text style={styles.title} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.name}
                        </Text>
                        <Text key={this.props.id} style={styles.info} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.fees}
                        </Text>
                        <Text style={styles.description} numberOfLines={4} ellipsizeMode ={'tail'}>
                            {this.props.description}
                        </Text>
                        <Text style={styles.info} numberOfLines={4} ellipsizeMode ={'tail'}>
                            {this.props.location}
                        </Text>

                        {this.props.registerUrl
                            ? (<TouchableOpacity
                                    accessible={true}
                                    accessibilityLabel={'Show Registration Window Button'}
                                    accessibilityRole={'button'}
                                    onPress={() => {
                                        this._submitEventCheckIn(this.props.eventIdentity);
                                        this.showEventRegisterModal(true);

                                    }}
                                    style={{marginTop: 25, flexDirection: "row", justifyContent: 'center',
                                        alignItems: 'center', backgroundColor: "#931414", width: "50%", alignSelf: "center"

                                    }}
                            >
                                <Text style={{color: "#fff", fontSize: 12}}>Register</Text>
                                <MaterialCommunityIcons
                                    name={"checkbox-marked-circle-outline"}
                                    size={25}
                                    color={"white"}
                                />
                            </TouchableOpacity>)
                            : (<TouchableOpacity
                                    accessible={true}
                                    accessibilityLabel={'Show Registration Window Button'}
                                    accessibilityRole={'button'}
                                    onPress={() => {
                                         Alert.alert(
                                            '',
                                            "Are you ready to check-in for this event?",
                                            [
                                                {
                                                    text: 'Submit', onPress: () => {
                                                        this._submitEventCheckIn(this.props.eventIdentity);
                                                        Alert.alert('You successfully checked-in!');
                                                    }
                                                },
                                                {
                                                    text: 'Cancel',
                                                }
                                            ],
                                            { cancelable: true},
                                        );




                                    }}
                                    style={{marginTop: 25, flexDirection: "row", justifyContent: 'center',
                                        alignItems: 'center', backgroundColor: "#931414", width: "50%", alignSelf: "center"

                                    }}
                                >
                                    <Text style={{color: "#fff", fontSize: 12}}>Check-In</Text>
                                    <MaterialCommunityIcons
                                        name={"checkbox-marked-circle-outline"}
                                        size={25}
                                        color={"white"}
                                    />
                                </TouchableOpacity>

                            )
                        }
                    </View>
                </View>
                <Modal
                    transparent={false}
                    animationType={"fade"}
                    visible={this.state.eventRegisterModal}
                    onRequestClose={() => {this.showEventRegisterModal(!this.state.eventRegisterModal)} }
                >
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Close Event Registration Window Button'}
                        accessibilityRole={'button'}
                        onPress={() => {this.showEventRegisterModal(!this.state.eventRegisterModal)}}
                        style={{marginLeft: 5, marginTop: 50, flexDirection: "row"}}>
                        <Ionicons name={"md-arrow-back"} size={30} color={"#156DFA"}/>
                        <Text style={{color: "#156DFA", marginTop: 7, marginLeft: 8}}>Go Back</Text>
                    </TouchableOpacity>

                    {this.props.registerUrl
                        ?
                        (
                            <WebView
                                source={{uri:"http://recmiamioh.maxgalaxy.net/Registration.aspx?ActivityID=" + this.props.registerUrl}}
                                style={{flex: 1}}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                            />
                        )
                        :
                        (
                            <Text>No Need To Register {'\n'} Free Event</Text>
                        )
                    }
                </Modal>
            </View>
        );
    }
}

export default graphql(CreateEventCheckIn, {name: 'CreateEventCheckInByUser'})(Event);

const styles = StyleSheet.create({

    rowCard:{
        marginTop: 10,
        borderRadius: 4,
        shadowOffset:{  width: -1,  height: 1,  },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3,
        borderWidth:1,
        borderColor: '#fff'
    },

    rowContainer: {
        flexDirection: 'row',
        backgroundColor: '#29282A',
        height: 'auto',
        padding: 10,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 4,
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#CCC',
        shadowOpacity: 1.0,
        shadowRadius: 3,
    },
    imageRowContainer: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        height: 200,
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 10,
    },
    title: {
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red'
    },
    date: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ffffff',
        fontStyle: "italic"
    },
    info: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC'
    },
    description: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        fontStyle: 'italic',
        color: '#ACACAC'
    },
    location: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC'
    },
    author: {
        paddingRight: 30,
        marginTop: 2,
        fontSize: 10,
        color: '#ACACAC',
        alignSelf: 'flex-end'
    },
    image: {
        flex: 1,
        height: undefined,
        width: '100%',
        backgroundColor: 'transparent'
    },
    rowText: {
        flex: 4,
        flexDirection: 'column'
    }
});