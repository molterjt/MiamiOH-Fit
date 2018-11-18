import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image,} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {withNavigation} from 'react-navigation';
import gql from 'graphql-tag';
import {graphql, compose } from 'react-apollo';

const CreateWorkoutCheckIn = gql`
    mutation($checked: Boolean, $workoutIdsArr: [ID!], $userIdsArr: [ID!]){
        createCheckin(checked: $checked, workoutsIds: $workoutIdsArr, usersIds: $userIdsArr){
            id
            createdAt
            workouts{title}
        }
    }    
`

const CREATE_EX_SET = gql`
    mutation createExerciseSets($userId:[ID!], $repsHit: String, $setName: String, $workout:ID, $weightUsed: String, $exercise:[ID!]){
        createExerciseSets(
            setName:$setName,
            repsHit:$repsHit,
            weightUsed:$weightUsed,
            exercisesIds: $exercise,
            usersSetsIds: $userId,
            workoutSetsId: $workout,
        ){
            id
            setName
            repsHit
            weightUsed
            exercises{name, reps}
            usersSets{firstName}
            workoutSets{title}
        }
    }
`

class Workout extends React.Component{
    constructor(props){
        super(props);
        this.state={
            checked: true,
            workout: '',
            sets: [],
            weightUsed: undefined,
            workoutId: undefined,
            repsHit: undefined,
            setName: undefined,
            exerciseIds: [],
            userId: undefined,
        };
        this._submitClassCheckIn = this._submitClassCheckIn.bind(this);
        this._createComment = this._createComment.bind(this);
        this.showMyWorkoutModal = this.showMyWorkoutModal.bind(this);
        this._submitUserWorkoutRecord = this._submitUserWorkoutRecord.bind(this);
        this.handleCompleteWorkout = this.handleCompleteWorkout.bind(this);
    }

    handleCompleteWorkout = (workout) => {
        this.props.navigation.navigate("SubmitWorkout", {itemId: workout});
    };

    _submitUserWorkoutRecord = async () => {
        const {userId, repsHit, weightUsed, setName, exerciseIds, workoutId} = this.state;

        await this.props.createExerciseSets({
            variables:{
                userId: userId,
                repsHit: repsHit,
                setName: setName,
                workout: workoutId,
                weightUsed: weightUsed,
                exercise: exerciseIds
            }
        });
        console.log('submitted workout record')
    };

    _submitClassCheckIn = async () => {
        const {checked} = this.state;
        await this.props.CreateWorkoutCheckInByUser({
            variables: {
                checked: checked,
                userIdsArr: [this.props.userCheckinId],
                workoutIdsArr: [this.props.workoutCheckinId],
            }
        });
        console.log('Workout Check-In Mutation Complete')
    };
    _createComment = async () => {
        const {workout} = this.state;
        console.log('workout: ' + workout);
        this.setState({workout: ""});
        return this.showUserWorkoutModal(false);
    };
    showMyWorkoutModal(visible){
        this.setState({myWorkoutModalVisible: visible})
    };

    render(){
        const {sets} = this.state;

        return(
            <View style={styles.rowCard} key={this.props.id}>
                <View style={styles.imageRowContainer}>
                    <Image source={{uri: this.props.image}}
                           style={styles.image}
                           resizeMode="cover"
                           alt={'Workout Thumbnail'}
                    />
                </View>
                <View style={styles.rowContainer} key={this.props.id}>
                    <View style={styles.rowText} >
                        <Text style={styles.date} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.date}
                        </Text>
                        <Text style={styles.title} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.title}
                        </Text>
                        <Text key={this.props.id} style={styles.date} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.type}
                        </Text>
                        <Text style={styles.description} numberOfLines={4} ellipsizeMode ={'tail'}>
                            {this.props.description}
                        </Text>
                        <View  style={styles.exerciseCard}>
                            {this.props.exercises}
                        </View>
                        <View style={{alignItems:'center', justifyContent: 'center', alignContent: 'center',
                            textAlign: 'center', alignSelf: 'center', marginTop: 10}}>
                            <TouchableOpacity
                                accessible={true}
                                accessibilityLabel={'Workout Record Link Button'}
                                accessibilityRole={'link'}
                                style={{alignSelf: 'center', alignItems: 'center', textAlign: 'center',
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                }}
                                disabled={false}
                                onPress={() => this.handleCompleteWorkout(this.props.id)}
                            >
                                <Ionicons name={"md-checkmark-circle-outline"} size={30} color={'red'} />
                                <Text style={{
                                    alignContent: 'center',
                                    justifyContent: 'center',color:"#fff", alignSelf:'center', fontSize: 12, marginTop: 3}}>Enter Workout Record</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

export default compose(
    graphql(CreateWorkoutCheckIn, {name: 'CreateWorkoutCheckInByUser'}),
    graphql(CREATE_EX_SET, {name: 'CreateExerciseSets'})
)(withNavigation(Workout));


const styles = StyleSheet.create({

    rowCard:{
        marginTop: 10,
        padding:5,
        borderRadius: 4,
        shadowOffset:{  width: -1,  height: 1,  },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3
    },
    exerciseCard:{
        marginTop: 10,
        padding: 2,
        borderRadius: 2,
        borderColor: 'white',
        borderWidth: 1,
    },
    rowContainer: {
        flexDirection: 'row',
        backgroundColor: '#29282A',
        height: 'auto',
        padding: 10,
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 10,
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#CCC',
        shadowOpacity: 1.0,
        shadowRadius: 3,
    },
    imageRowContainer: {
        flexDirection: 'row',
        height: 300,
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
        borderRadius: 10,


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
        color: '#ffffff'
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
        paddingRight: 2,
        paddingBottom: 5,
        fontSize: 10,
        color: '#ACACAC',
        alignSelf: 'flex-end'
    },
    image: {
        flex: 1,
        height: undefined,
        width: 'auto'
    },
    rowText: {
        flex: 1,
        flexDirection: 'column'
    }
});
