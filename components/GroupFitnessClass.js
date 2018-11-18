import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Modal, TextInput, WebView, Platform,
} from 'react-native';
import {Constants, Location, Permissions} from 'expo';
import gql from 'graphql-tag';
import {graphql, compose } from 'react-apollo';
import {FontAwesome, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import moment from 'moment';
import {withNavigation} from "react-navigation";



const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const GEOLOCATION_OPTIONS = { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 };
const REC_LAT = '39.502590979032284';
const REC_LONG = '-84.73775267601013';
const CHECK_IN_BOUNDARY =  100.00;

const isLandscapeWidth = () => {
    const dim = Dimensions.get('screen');
    if(dim.width >= dim.height) return dim.width;
};
const isLandscapeHeight = () => {
    const dim = Dimensions.get('screen');
    if(dim.width >= dim.height) return dim.height;
};


moment.relativeTimeThreshold('m', 59);
moment.relativeTimeThreshold('h', 23);


const CreateClassCommentByUser = gql`
    mutation createComment($content: String!, $userCommentId: ID!, $classCommentId: ID!){
        createComment(
            content: $content,
            userCommentId: $userCommentId,
            classCommentId: $classCommentId
        ){
            id
            content
            classComment{title}
            userComment{username}
        }
    }
`

const CreateClassCheckInByUser = gql`
    mutation createCheckin($checked: Boolean, $classIdsArr: [ID!], $userIdsArr: [ID!]){
        createCheckin(classesIds:$classIdsArr, usersIds: $userIdsArr, checked: $checked){
            id
            createdAt
            checked
        }
    }
`

class GroupFitnessClass extends React.Component{
    constructor(props){
        super(props);
        this.state={
            addCommentModalVisible: false,
            videoModalVisible: false,
            userComment: '',
            commentError: '',
            location: null,
            errorMessage: null,
            userLatitude: undefined,
            userLongitude: undefined,
            userLocationAccuracy: undefined,
            userDistanceFromRSC: undefined,
            classIdsArr: [],
            userIdsArr: [],
            checked: true,
            checkInDisable: false,
            goodToCheckIn: false,
        };
        this._createComment = this._createComment.bind(this);
        this._degreesToRadians = this._degreesToRadians.bind(this);
        this._distanceBetweenCoordinates = this._distanceBetweenCoordinates.bind(this);
        this._distanceUserFromRSC = this._distanceUserFromRSC.bind(this);
        this._timeCheckInControl = this._timeCheckInControl.bind(this);
        this._getLocationAsync = this._getLocationAsync.bind(this);
        this._checkinAvailable = this._checkinAvailable.bind(this);
        this._submitClassCheckIn = this._submitClassCheckIn.bind(this);
        this._switchCheckInDisable = this._switchCheckInDisable.bind(this);
    }

    _switchCheckInDisable = () =>
        this.setState({checkInDisable: true});

    _createComment = async () => {
        const {userComment} = this.state;
        await this.props.CreateClassCommentByUser({
            variables: {
                content: userComment,
                userCommentId: this.props.userCommentId,
                classCommentId: this.props.classCommentId,
            }
        });
        console.log(userComment);
        this.setState({userComment: ""});
        return this.showCommentModal(false);
    };

    _submitClassCheckIn = async () => {
        const {checked} = this.state;
        await this.props.CreateClassCheckInByUser({
            variables: {
                checked: checked,
                userIdsArr: [this.props.userCheckinId],
                classIdsArr: [this.props.classCheckinId],
            }
        })

    };
    showCommentModal(visible){
        this.setState({addCommentModalVisible: visible})
    }
    showVideoModal(visible){
        this.setState({videoModalVisible: visible})
    }

    componentWillMount(){
        if(Platform.OS === 'android' && !Constants.isDevice){
            this.setState({errorMessage: 'This will not work on Android Simulator. Try on device'});
        } else {
            this._getLocationAsync();
        }
        this._timeCheckInControl(this.props.classStart);

    }
    checkCommentCredentials(){
        const {userComment, commentError} = this.state;
        if(userComment < 1 || commentError) return true;
        else return false;
    };

    _getLocationAsync = async () => {
        let {status} = await Permissions.askAsync(Permissions.LOCATION);
        if(status !== 'granted'){
            alert('Hey! You might want to enable Location if you would like to use any check-in features');
            this.setState({
                errorMessage: 'Permission to access location was denied'
            });
        }
        let location = await Location.getCurrentPositionAsync(GEOLOCATION_OPTIONS);
        this.setState({
            location: location,
            userLatitude: location.coords.latitude,
            userLongitude: location.coords.longitude,
            userLocationAccuracy: location.coords.accuracy,
        });
        console.log('From State: ' + "\n" + this.state.userLatitude + '\n' + this.state.userLongitude + '\n' + this.state.userLocationAccuracy)
    };

    _degreesToRadians(degrees){
        return degrees * Math.PI / 180;
    };
    _distanceBetweenCoordinates(lat1, long1, lat2, long2){

        let earthRadiusKm = 6371;

        let dLat = this._degreesToRadians(lat2 - lat1);

        let dLong = this._degreesToRadians(long2 - long1);


        lat1 = this._degreesToRadians(lat1);
        lat2 = this._degreesToRadians(lat2);

        let a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.sin(dLong/2) * Math.cos(lat1) *Math.cos(lat2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return earthRadiusKm * c;
    };

    _haversineFormula_GlobeDistance(lat1, long1, lat2, long2){

        let R = 6371; // km

        let dLat = (lat2-lat1)*Math.PI/180;
        let dLong = (long2-long1)*Math.PI/180;
        let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLong/2) * Math.sin(dLong/2);
        let c = 2 * Math.asin(Math.sqrt(a));
        console.log(R);
        console.log(dLat);
        console.log(dLong);
        console.log(a);
        console.log(c);
        console.log(R*c);
        const d =  (R * c) * 1000;

        return d;
    };

    _distanceUserFromRSC = async () => {
        const {userLatitude, userLongitude, userLocationAccuracy} = this.state;
        try {
            let userDistance =  await this._haversineFormula_GlobeDistance(REC_LAT, REC_LONG, userLatitude, userLongitude);
            console.log('UserDistance: ' + userDistance);

            if(userDistance < 70 + userLocationAccuracy){
                console.log('You are good; proximal enough to checkin*************************');
                this.setState({goodToCheckIn: true});
                Alert.alert(
                    'Check-In is Available',
                    'Press OK to Check-in',
                    [
                        {text: 'OK', onPress: () => {
                                this._submitClassCheckIn()
                                    .then((data) => console.log(data.id))
                                    .catch((error) => console.log(error))
                                    .done();
                                Alert.alert('','You have successfully checked-in!');
                                console.log('Check In Success');
                                this._switchCheckInDisable();
                                console.log('*************************************')
                            },

                        },
                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')}

                    ],
                    { cancelable: true }
                )
                return true;
            }else{
                console.log('You need to be closer to the Rec Center to checkin *********************');
                this.setState({goodToCheckIn: false})
                return false;
            }
        }
        catch(error){
            console.log("_distanceUserFromRSC Error: ******************* " + error);
        }
    };

    _timeCheckInControl = async (e) => {
        try{
            let current = moment().format();
            let currentTime = moment(current).format('hh:mm:ss a');
            let currentDay = moment(current).format('dddd');
            console.log('Current: ' + current);
            console.log('Current Day: ' + currentDay);
            console.log('Current Time:' + currentTime);

            let classDays = this.props.days;
            let containsClassDay = (classDays.indexOf(currentDay) > -1);
            console.log(containsClassDay);  //true or false

            let classDate = await moment(e).format();
            let classDateTime = moment(classDate).format('hh:mm:ss a');
            console.log("class: " + classDate);
            console.log(classDateTime);

            let HH = moment.utc(moment(currentTime, "hh:mm:ss a").diff(moment(classDateTime, "HH:mm:ss a"))).format("HH");
            let MM = moment.utc(moment(currentTime, "hh:mm:ss a").diff(moment(classDateTime, "HH:mm:ss a"))).format("mm");
            console.log("HH: " + HH);
            console.log("MM: " + MM);
            let ZeroHour = parseInt(HH);
            let ZeroMinute = parseInt(MM);

            let differenceCurrentTimeToClassTime = moment(currentTime, 'hh:mm:ss a').from(moment(classDateTime, 'hh:mm:ss a'), "minutes");
            console.log("Difference From Current Time to Class Time is: " + differenceCurrentTimeToClassTime);
            let timeBoundary = parseInt(differenceCurrentTimeToClassTime);
            console.log(timeBoundary);

            if(containsClassDay === true){
                console.log('Contains Class Day is True');
                if(ZeroHour === 0 || ZeroHour === 23){
                    console.log('Class is available for check-in within the hour');
                    if(timeBoundary < 21 || ZeroMinute === 0 || ZeroMinute === 59){
                        console.log('Class is available for check-in within 20 minutes of start time');
                        console.log('Check-in for this class');
                        this.setState({goodToCheckIn: true})
                        return true;
                    }else{
                        console.log('Check-in Not Available: Must Check-in within a 20 minutes of class start time');
                        return false;
                    }
                }else{
                    console.log('Check-in Not Available: Must Check-in within a 20 minutes of class start time');
                    return false;
                }
            }else{
                console.log('Check-in Not Available: Check-in on Day of Class');
                return false;
            }
        } catch (error) {
            console.log('_timeCheckinControl Error: ' + error);
        }

    };

    _checkinAvailable(e){
        if(this._timeCheckInControl(e) === true){
            if(this._distanceUserFromRSC() === true){
                return true;
            } else{
                console.log('Checkin Not Available: Proximity Restraint.');
                return false;
            }

        }else{
            console.log('Checkin Not Available: Time Restraint.');
            return false;
        }
    };

    render(){
        return(
            <View style={styles.rowCard}>
                <View style={styles.imageRowContainer}>
                    <Image
                        source={{uri: this.props.image}}
                        alt={'Group Fit Class Example'}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.rowContainer}>
                    <View style={styles.rowText}>
                        <View style={{flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                            <View style={{justifyContent:'flex-start'}}>
                                <Text style={styles.title} numberOfLines={2} ellipsizeMode ={'tail'}>
                                    {this.props.title}
                                </Text>
                            </View>
                            <View style = {{position: 'absolute', right: 0, alignItems: 'center'}}>
                                <TouchableOpacity
                                    accessible={true}
                                    accessibilityLabel={'Group Fit Programs Link Button'}
                                    accessibilityRole={'link'}
                                    style={{marginBottom: 0, marginTop: 1,  textAlign:'center', justifyContent:"center", alignItems:"center"}}
                                    onPress={() => this.props.navigation.navigate('GroupFitPrograms')}>
                                    <MaterialCommunityIcons
                                        name={"checkbox-marked-circle-outline"}
                                        size={30}
                                        color={'#fff'}
                                    />
                                    <Text style={{color: "#fff", fontSize: 10, marginTop: 1, alignSelf: 'center'}}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.time}>
                            {this.props.time}
                        </Text>
                        <Text style={styles.instructor} >
                            {this.props.instructor}
                        </Text>
                        <Text style={styles.days} >
                            {this.props.days}
                        </Text>
                        <Text style={styles.location} >
                            {this.props.location}
                        </Text>
                        <Text style={styles.description} >
                            Type: {this.props.category}
                        </Text>
                        <Text style={styles.description}>
                            Description: {this.props.description}
                        </Text>
                        <View style={{flexDirection: "row", justifyContent:"center", alignItems:"center", marginTop: 25, }}>
                            {
                                this.props.videoUrl
                                ?
                                (
                                    <TouchableOpacity
                                        accessible={true}
                                        accessibilityLabel={'Play Group Fit Class Preview Video Button'}
                                        accessibilityRole={'button'}
                                        disabled={false}
                                        onPress={() => {
                                            Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE_RIGHT);
                                            this.showVideoModal(true)}
                                        }
                                        style={{alignItems: "center", flex:3}}
                                    >
                                        <MaterialIcons
                                            name={"ondemand-video"}
                                            size={30}
                                            color={'#fff'}
                                        />
                                        <Text style={{color:"#fff", alignSelf: "center", fontSize: 10, marginTop: 3}}>Class Video</Text>
                                    </TouchableOpacity>
                                )
                                :
                                (null)
                            }

                            {this.state.goodToCheckIn === true
                                ? (<TouchableOpacity
                                    accessible={true}
                                    accessibilityLabel={'Group Fit Class Check-in Button'}
                                    accessibilityRole={'button'}
                                    style={{alignItems: "center", flex:3}}
                                    disabled={this.state.checkInDisable}
                                    onPress={() => this._distanceUserFromRSC()}
                                >
                                    <MaterialCommunityIcons name={"target"} size={36} color={'#fff'} />
                                    <Text style={{color:"#fff", alignSelf: "center", fontSize: 10, marginTop: 0}}>Check-In</Text>
                                </TouchableOpacity>)
                                : (<TouchableOpacity
                                    style={{alignItems: "center", flex:3}}
                                    disabled={false}
                                    onPress={ () => {
                                        Alert.alert(
                                            'Alert',
                                            'Check-In is not Available: Must Check-in within 20 minutes of class start time & be located at Rec Center',
                                            [
                                                {text: 'OK', onPress: () => console.log('OK Pressed')},
                                            ],
                                            { cancelable: true }
                                        )
                                    }}>
                                    <MaterialCommunityIcons name={"target"} size={36} color={'#fff'} />
                                    <Text style={{color:"#fff", alignSelf: "center", fontSize: 10, marginTop: 0}}>Check-In</Text>
                                </TouchableOpacity>)

                            }
                            <TouchableOpacity
                                accessible={true}
                                accessibilityLabel={'Leave a Class Comment Button'}
                                accessibilityRole={'button'}
                                onPress={() => {this.showCommentModal(true)}}
                                style={{alignItems: "center", flex:3}}>
                                <FontAwesome name={"commenting-o"} size={30} color={'#fff'}/>
                                <Text style={{color:"#fff", alignSelf: "center", fontSize: 10, marginTop: 3}}>Comment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Modal
                        transparent={true}
                        animationType={"none"}
                        visible={this.state.addCommentModalVisible}
                        onRequestClose={() => {this.showCommentModal(!this.state.addCommentModalVisible)} }
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.ModalInsideView}>
                                <TouchableOpacity
                                    accessible={true}
                                    accessibilityLabel={'Close Class Comment Button'}
                                    accessibilityRole={'button'}
                                    onPress={() => {this.showCommentModal(!this.state.addCommentModalVisible)}}
                                    style={styles.closeButton}
                                >
                                    <MaterialCommunityIcons name={"close-box-outline"} size={30} color={"#156DFA"}/>
                                </TouchableOpacity>

                                <Text style={{fontStyle: "italic", fontWeight: "bold"}}>Have a comment?</Text>
                                <TextInput
                                    multiline={true}
                                    numberOfLines={9}
                                    accessibilityLabel={'Paragraph form field to leave a class comment'}
                                    onChangeText={ (userComment) => this.setState({userComment})}
                                    value={this.state.userComment}
                                    blurOnSubmit={true}
                                    type={"text"}
                                    placeholder={'Please provide your feedback'}
                                    style={styles.textInput}
                                    underlineColorAndroid={'transparent'}
                                    autoCorrect={true}
                                />
                                <TouchableOpacity
                                    accessible={true}
                                    accessibilityLabel={'Submit Class Comment Button'}
                                    accessibilityRole={'button'}
                                    disabled={this.checkCommentCredentials()}
                                    onPress={ () => this._createComment()}
                                    style={styles.formButton}
                                >
                                    <Text style={styles.buttonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        transparent={false}
                        animationType={"fade"}
                        visible={this.state.videoModalVisible}
                        onRequestClose={() => {this.showVideoModal(!this.state.videoModalVisible)} }
                    >
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Close Group Fit Class Video Button'}
                            accessibilityRole={'button'}
                            disabled={false}
                            onPress={() => {
                                Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
                                this.showVideoModal(!this.state.videoModalVisible)
                            }}
                            style={{backgroundColor:'transparent', alignSelf:'center'}}
                        >
                            <Text style={{color:'red'}}>CLOSE</Text>
                        </TouchableOpacity>

                        {/*<Video*/}
                            {/*source={{ uri: 'https://www.youtube.com/watch?v=A-CArHYqcfo' }}*/}
                            {/*shouldPlay*/}
                            {/*resizeMode="cover"*/}
                            {/*style={{ width: HEIGHT, height: WIDTH }}*/}
                        {/*/>*/}
                        <WebView
                            style={{flex:1}}
                            javaScriptEnabled={true}
                            source={{uri: this.props.videoUrl}}

                        />
                    </Modal>
                </View>
            </View>
        );
    }

}


export default compose(
    graphql(CreateClassCommentByUser, {name: 'CreateClassCommentByUser'}),
    graphql(CreateClassCheckInByUser, {name: 'CreateClassCheckInByUser'}),
)(withNavigation(GroupFitnessClass));


const styles = StyleSheet.create({
    commentBubble:{
        alignSelf: 'flex-end',
        justifyContent: "flex-end",
        position: "absolute",
        right: 1,
        top: 10,

    },
    commentBubbleText:{
        fontSize:10,
        fontFamily: "italic",
        color:"#fff",
        alignSelf: 'flex-end',
        justifyContent: "flex-end",
        position: "absolute",
        right: -3,
        top: -2
    },
    closeButton: {
        alignSelf: 'flex-end',
        position:'relative',
        justifyContent: "flex-end",
        top: 2,
        right: 7,
    },
    modalContainer: {
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
    },
    ModalInsideView:{
        alignItems: 'center',
        backgroundColor : "#fff",
        height: 400 ,
        width: '90%',
        borderRadius:10,
        borderWidth: 3,
        borderColor: '#931414',
        opacity: 1,
        padding: 5,
    },
    VideoModalInsideView:{
        alignItems: 'center',
        //backgroundColor : "#fff",
        height: 600 ,
        width: '95%',
        borderRadius:10,
        //borderWidth: 2,
        borderColor: 'red',
        opacity: 1,
        padding: 5,
    },
    textInput: {
        alignSelf: 'stretch',
        height: 200,
        margin: 5,
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
        marginTop: 40,
        marginBottom: 40,
        width: '33%',
        height: 'auto',
        borderWidth: 2,
        borderColor: "#000000",
        borderRadius: 15,
    },
    buttonText:{
        fontWeight:'bold',
        fontSize: 16,
        color: "#fff",
        textAlign:'center',
        // alignSelf: 'center',
        // alignContent:'center',
        // justifyContent:'center',
    },
    rowCard:{
        backgroundColor: 'transparent',
        marginTop: 5,
        borderRadius: 4,
        shadowOffset:{  width: -1,  height: 1,  },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3
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
        shadowRadius: 3
    },
    imageRowContainer: {
        flexDirection: 'row',
        height: HEIGHT*.28,
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 5,
    },
    title: {
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#931414'
    },
    time: {
        paddingLeft: 10,
        marginTop: 8,
        fontSize: 14,
        color: '#ACACAC',
        //position: 'absolute',
        //right: 0,
    },
    instructor: {
        paddingLeft: 10,
        marginTop: 8,
        fontSize: 15,
        //fontWeight: 'bold',
        color: '#ffffff'
    },
    days: {
        paddingLeft: 10,
        marginTop: 8,
        fontSize: 14,
        color: '#ACACAC'
    },

    description: {
        paddingLeft: 10,
        marginTop: 8,
        fontSize: 12,
        fontStyle: "italic",
        color: '#ACACAC'
    },
    location: {
        paddingLeft: 10,
        marginTop: 8,
        fontSize: 14,
        color: '#ACACAC'
    },
    category: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC'
    },
    image: {
       flex: 1,
        height: undefined,
        width: WIDTH*.93,
        backgroundColor: 'transparent',
    },
    rowText: {
        flex: 4,
        flexDirection: 'column'
    },
    checkinButton: {
        backgroundColor: '#ffffff', width: '33%', height: 22, alignSelf: 'center',
        marginTop: 15, padding: 5, justifyContent: 'center', alignContent:'center',
        borderColor: "#000000", borderWidth: 1
    },
});

