
import React from 'react';
import {Text, View, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Alert, AsyncStorage, Dimensions, Platform} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import gql from 'graphql-tag';
import {graphql, compose} from 'react-apollo';
import {withNavigation} from 'react-navigation';
import moment from 'moment';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const CreateWorkoutCheckIn = gql`
    mutation($checked: Boolean, $workoutIdsArr: [ID!], $userIdsArr: [ID!], $timeCheck:String){
        createCheckin(checked: $checked, workoutsIds: $workoutIdsArr, usersIds: $userIdsArr, timeCheck: $timeCheck){
            id
            createdAt
            timeCheck
            workouts{title}
        }
    }
`
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


const CREATE_WORKOUT_RECORD = gql`
    mutation createWorkoutRecord($usersSetsIds:[ID!], $repsHit: String, $setName: String, $workoutSetsId:ID, $weightUsed: String, $exercisesIds: [ID!], $timeCheck: String, $setOrderNo: Int){
        createExerciseSets(setName: $setName, repsHit:$repsHit, weightUsed:$weightUsed, workoutSetsId: $workoutSetsId, exercisesIds: $exercisesIds, usersSetsIds: $usersSetsIds, timeCheck: $timeCheck, setOrderNo:$setOrderNo ){
            id
            setName
            repsHit
            weightUsed
            exercises{name, reps}
            usersSets{firstName}
            workoutSets{title}
            timeCheck
        }
    }
`;

let queryUserId;

class SubmitWorkoutScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={
            checked: true,
            timeCheck: undefined,
            setTimeCheck: undefined,
            setOrder: undefined,
            myWorkoutModalVisible: false,
            workout: '',
            ExSets: [],
            CompletedSets: [],
            repHit: undefined,
            weightHit: undefined,
            UniqueSets: [],
            AllSets: [],
            Loaded: true,
            weightUsed: undefined,
            workoutId: undefined,
            repsHit: undefined,
            setName: undefined,
            exerciseIds: [],
            userIds: [],
            isLoading:true,
            // currentUserId: '',
        };
        this.SetBuilder = [];
        this.createExerciseSet = this.createExerciseSet.bind(this);
        this.handleSetRepUpdate = this.handleSetRepUpdate.bind(this);
        this.handleSetWeightUpdate = this.handleSetWeightUpdate.bind(this);
        this.submitUserWorkoutRecord = this.submitUserWorkoutRecord.bind(this);
        this._submitWorkoutCheckIn = this._submitWorkoutCheckIn.bind(this);
        this._CheckinThenSubmitMyWorkoutRecord = this._CheckinThenSubmitMyWorkoutRecord.bind(this);

        AsyncStorage.getItem("MyUserId").then( (dataId) => {
            queryUserId = dataId;
            console.log('submitWorkout Screen dataId ' + JSON.stringify(dataId));
            console.log("submitWorkout ScreenqueryUserId:" + queryUserId);
            return queryUserId;
        }).done();
    }

    _submitWorkoutCheckIn = async (workoutId) => {
        const {checked, timeCheck} = this.state;
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
        const UserSet = JSON.parse(queryUserId);

        await this.props.CreateWorkoutCheckInByUser({
            variables: {
                checked: checked,
                timeCheck: subTime,
                userIdsArr: UserSet,
                workoutIdsArr: workoutId,
            }
        });
        console.log('Workout Check-In Mutation Complete');
        console.log('timeCheck: ' + moment(timeCheck).format('M/D/Y h a'));
    };

    createExerciseSet(ExId, WorkId, Sets){
        const {ExSets} = this.state;
        let SetList = [];
        let q = 0;
        let z = 0;
        for(let x = 0; x < Sets; x++){
            q++;
            z++;
            let SetIdentity = ExId + q;
            let newEntry = {SetId: SetIdentity ,ExKey:ExId, workout: WorkId, setNo: z, weightUse: 0, repUse: 0};
            let contains = this.SetBuilder.some(elem =>{
                return JSON.stringify(SetIdentity) === JSON.stringify(elem.SetId);
            });
            if(contains) {

            } else {
                SetList = [...SetList, newEntry];
            }
        }
        this.SetBuilder = [...this.SetBuilder, ...SetList];
    }

    handleSetRepUpdate(id, repHit){
        this.SetBuilder.map((obj, index) => {
            if(obj.SetId === id){
                return obj.repUse = repHit;
            } else{
                return obj;
            }
        });
    }
    handleSetWeightUpdate(id, weightHit){
        this.SetBuilder.map((obj, index) => {
            if(obj.SetId === id){
                return obj.weightUse = weightHit;
            } else {
                return obj;
            }
        });
    }

    submitUserWorkoutRecord = async () => {
        const {setTimeCheck} = this.state;
        const currentTime = moment();
        const customTime = moment({
            year: moment(currentTime).year(),
            month: moment(currentTime).month(),
            day: moment(currentTime).date(),
            hour: moment(currentTime).hours()
        });
        const subTime = customTime.toISOString();
        this.setState({
            setTimeCheck: subTime
        });
        const UserSet = JSON.parse(queryUserId);
        console.log("userSet: "+ UserSet);
        let OrderOfSets = 0;
        this.SetBuilder.map((obj, index) => {
            if(obj.weightUse > 0  || obj.repUse > 0){
                OrderOfSets++;
                this.props.createWorkoutRecord({
                    variables: {
                        setName: obj.setNo.toString(),
                        repsHit: obj.repUse.toString(),
                        weightUsed: obj.weightUse.toString(),
                        workoutSetsId: obj.workout,
                        exercisesIds: obj.ExKey,
                        usersSetsIds: UserSet,
                        timeCheck: subTime,
                        setOrderNo: OrderOfSets
                    }
                });
            }
        });
        Alert.alert('You successfully submitted your workout!');
        console.log('Workout Record has been Submitted');
        console.log('Submit Time: ' + moment(setTimeCheck).format('M/D/Y h a'));
    };

    _CheckinThenSubmitMyWorkoutRecord = async (id) => {
        await Alert.alert(
            'Hey!',
            "Are you ready to submit your workout record?",
            [
                {
                    text: 'Submit', onPress: () => {
                        this._submitWorkoutCheckIn(id);
                        this.submitUserWorkoutRecord();
                        this.props.navigation.goBack(null);
                    }
                },
                {
                    text: 'Cancel',
                }
            ],
            { cancelable: true},
        );
    };



    render(){
        const { data: { loading, error, Workout } } = this.props;
        const {isLoading} = this.state;
        if(loading  ){return <Text>Loading...</Text>}
        if(error){
            return (
                <View>
                    <Text>Error</Text>
                    {console.log(error)}
                </View>
            )
        }

        Workout.exercises.map(({sets, id}) => {
            this.createExerciseSet(id, Workout.id, sets);
        });
        return(
            <ScrollView showsVerticalScrollIndicator={false} style={styles.rowCard}>
                <View style={styles.rowContainer}>
                    <View style={styles.rowText} >
                        <Text style={{fontSize: (Platform.isPad ? WIDTH*.035 : 18), textAlign:'center', color: '#fff'}} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {Workout.title}
                        </Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {Workout.exercises.map(({name, reps, sets, intensity, id, tempo}) => (
                                    <View key={id}>
                                        <Text style={styles.title} key={id}>
                                            {name}
                                        </Text>
                                        <Text style={styles.info} >
                                            Sets: {sets}
                                        </Text>

                                        <Text style={styles.info} >
                                            Reps: {reps}
                                        </Text>
                                        <Text style={styles.info} >
                                            Intensity: {intensity}
                                        </Text>
                                        {this.SetBuilder.filter((item) => item.ExKey === id).map((obj, index) =>
                                            <KeyboardAvoidingView style={{padding:2, }} behavior="padding" key={index}>
                                                <View style={{flexDirection: 'row', display:'flex', justifyContent:'center'}} key={obj.SetId}>
                                                    <Text style={{color:'white', margin:5,  fontSize: (Platform.isPad ? WIDTH*.025 : 14),}}>{obj.setNo}</Text>
                                                    <TextInput
                                                        style={{color:'#fff', borderColor:'#fff', borderWidth:1, height: HEIGHT*.045, width:'40%', padding:2, margin:5, textAlign:'center'}}
                                                        placeholder={'Weight Hit {lbs}'}
                                                        value={this.state.weightUsed}
                                                        // value={obj.weightUse}
                                                        accessibilityLabel={'Form field for weight used for workout exercise set'}
                                                        placeholderTextColor={'#fff'}
                                                        onChangeText={(weight) => this.handleSetWeightUpdate(obj.SetId, weight)}
                                                        underlineColorAndroid={'transparent'}
                                                        autoCorrect={false}
                                                        keyboardType={'numeric'}
                                                    />
                                                    <TextInput
                                                        style={{color:'#fff', borderColor:'#fff', borderWidth:1, width:'40%', padding:2, height: HEIGHT*.045, margin:5, textAlign:'center'}}
                                                        placeholder={'Reps Hit'}
                                                        accessibilityLabel={'Form field for reps completed for workout exercise set'}
                                                        value={this.state.repHit}
                                                        // value={obj.repUse}
                                                        placeholderTextColor={'#fff'}
                                                        onChangeText={(rep) => this.handleSetRepUpdate(obj.SetId,rep)}
                                                        underlineColorAndroid={'transparent'}
                                                        autoCorrect={false}
                                                        keyboardType={'numeric'}
                                                    />
                                                </View>
                                            </KeyboardAvoidingView>
                                        )}
                                    </View>
                                )
                            )}
                        </ScrollView>
                        <View style={{alignItems:'center', justifyContent: 'center', alignContent: 'center',
                            textAlign: 'center', alignSelf: 'center', marginTop: 10}}>
                            <TouchableOpacity
                                accessible={true}
                                accessibilityLabel={'Submission Button for Workout Completion'}
                                accessibilityHint={'Completes the submission process for a workout record'}
                                accessibilityRole={'button'}
                                style={{alignSelf: 'center', alignItems: 'center', textAlign: 'center',
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                }}
                                disabled={false}
                                onPress={() => {
                                    console.log('Complete Workout Button Press');
                                    this._CheckinThenSubmitMyWorkoutRecord(Workout.id);
                                    console.log(this.SetBuilder.map((obj) => (
                                        JSON.stringify(obj.SetId) + ', ' +  obj.setNo + ', ' + JSON.stringify(obj.weightUse) + ', ' + obj.repUse + '***' + obj.workout + ' **** '  )));
                                }}
                            >
                                <Ionicons name={"md-checkmark-circle-outline"} size={Platform.isPad ? WIDTH*.05 : WIDTH*.07} color={'red'} />
                                <Text style={{
                                    alignContent: 'center',
                                    justifyContent: 'center',color:"#fff", alignSelf:'center', fontSize: (Platform.isPad ? WIDTH*.025 : 14), marginTop: 3}}>Submit Workout Record</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
    }
}

export default compose(
    graphql(
        GET_WORKOUT,
        {options: ({navigation}) => {
                return {
                    variables: {id: navigation.state.params.itemId},
                }
            }
        },
        {name: 'getWorkout'}
    ),
    graphql(CreateWorkoutCheckIn, {name: 'CreateWorkoutCheckInByUser'}),
    graphql(CREATE_WORKOUT_RECORD, {name: 'createWorkoutRecord'})
)(withNavigation(SubmitWorkoutScreen));


const styles = StyleSheet.create({

    rowContainer: {
        flexDirection: 'row',
        backgroundColor: '#29282A',
        height: 'auto',
        padding: 10,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 4,
        // shadowOffset:{  width: 1,  height: 1,  },
        // shadowColor: '#CCC',
        // shadowOpacity: 1.0,
        // shadowRadius: 3,
    },

    rowCard:{
        marginTop: 10,
        borderRadius: 4,
        // shadowOffset:{  width: -1,  height: 1,  },
        // shadowColor: 'black',
        // shadowOpacity: 1.0,
        // shadowRadius: 3
    },
    exerciseCard:{
        marginTop: 10,
        padding: 2,
        borderRadius: 2,
        borderColor: 'white',
        borderWidth: 1,
    },
    title: {
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: (Platform.isPad ? WIDTH*.025 : 14),
        fontWeight: 'bold',
        color: 'red'
    },
    info: {
        paddingLeft: 40,
        paddingTop: 3,
        fontSize: (Platform.isPad ? WIDTH*.025 : 14),
        color: '#ACACAC'
    },
    rowText: {
        flex: 1,
        flexDirection: 'column',
        marginBottom: 200,
    }
});



