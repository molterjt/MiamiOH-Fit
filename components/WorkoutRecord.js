import React from 'react';
import {
    Text, View, ActivityIndicator, ScrollView,
    TouchableOpacity, Dimensions, Modal, StyleSheet,
} from 'react-native';
import {Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import gql from "graphql-tag";
import {Query} from "react-apollo";

import moment from 'moment';

const { width, height } = Dimensions.get("window");

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const GET_WORKOUT_RECORD = gql`
    query WorkoutRecords($userId:ID, $timeCheck: String, $workout:ID){
        allExerciseSetses(
            filter: {
                usersSets_every:{id: $userId},
                workoutSets:{id: $workout},
                timeCheck_contains:$timeCheck

            }
            orderBy: setOrderNo_ASC){
            id
            createdAt
            usersSets{
                firstName
            }
            workoutSets{title, exercises{name, reps, sets}}
            exercises{name}
            setName
            repsHit
            weightUsed
            timeCheck
        }
    }
`;

class WorkoutRecord extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showWorkoutRecord: false
        };
        this.toggleWorkoutRecordModal = this.toggleWorkoutRecordModal.bind(this);
    }
    toggleWorkoutRecordModal(visible){
        this.setState({showWorkoutRecord: visible});
    }
    render(){
        return(
            <View>
                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel={'Open Workout Record Button'}
                    accessibilityRole={'button'}
                    onPress={() => this.toggleWorkoutRecordModal(true)}
                    style={{alignItems:'center', justifyContent:'center', backgroundColor: 'transparent', width: '30%', alignSelf:'center', borderRadius: 20, borderWidth:2, borderColor: '#931414'}}
                >
                    <Ionicons
                        name={"ios-expand"}
                        size={28}
                        alt={"expand facility info"}
                        color={"#931414"}
                        style={{fontWeight: 'bold'}}
                    />
                </TouchableOpacity>
                <Query query={GET_WORKOUT_RECORD} variables={{userId: this.props.userId, timeCheck: this.props.timeCheck, workout: this.props.workoutId}}>
                    {({loading, error, data}) => {
                        if (loading) return <View style={{alignContent:'center', justifyContent:'center'}}><ActivityIndicator color={"#931414"} size={"large"}/></View>;
                        if (error) return <Text>`Error! ${error.message}`</Text>;
                        return (
                            <View>
                                <Modal
                                    transparent={false} animationType={'none'}
                                    visible={this.state.showWorkoutRecord}
                                    onRequestClose={() => this.toggleWorkoutRecordModal(!this.state.showWorkoutRecord)}>
                                    <TouchableOpacity
                                        accessible={true}
                                        accessibilityLabel={'Close Workout Record Button'}
                                        accessibilityRole={'button'}
                                        onPress={() => {
                                            this.toggleWorkoutRecordModal(!this.state.showWorkoutRecord)
                                        }}
                                        style={{ marginTop:50, marginBottom: 5, marginLeft:2, flexDirection:'row' }}
                                    >
                                        <MaterialCommunityIcons name={"chevron-double-left"} size={40} color={"#277bfa"} />
                                    </TouchableOpacity>
                                    <ScrollView contentContainerStyle={{justifyContent: 'space-evenly',}} style={{flex: 1, }}>
                                        <View style={{flex:4, marginTop:5, marginBottom: 30, borderWidth:0, flexDirection:"column", justifyContent:'space-around', flexWrap: 'wrap'}}>
                                            <Text style={{fontSize: 16, padding: 8, textAlign: 'center', fontWeight: 'bold', color: '#931414', marginBottom: 5}}>{this.props.workoutTitle}</Text>
                                            <Text style={{fontSize: 12, padding: 1, textAlign: 'center',  color: '#000', marginBottom: 5}}>
                                                Completed: {moment(this.props.timeCheck).format('M/D/Y h a')}
                                            </Text>
                                            {data.allExerciseSetses.map(({exercises, setName, repsHit, weightUsed}, index) => (
                                                <View key={index} style={styles.rowColumn}>
                                                    {exercises.map(({name}, index) =>
                                                        <View
                                                            key={index}
                                                            style={{
                                                                height: 80, borderWidth: 3, borderColor:'#fff',
                                                                backgroundColor:'#29282A', width:'45%', justifyContent:'center'
                                                            }}
                                                        >
                                                            <Text style={{textAlign: 'center', color:'red', fontWeight:'bold'}}>{name}</Text>
                                                            <View style={{flexDirection:'row',  justifyContent:'center', marginTop:3}}>
                                                                <Text style={{fontWeight:'bold', textAlign:'center', color: '#fff'}}>Set:</Text>
                                                                <Text style={{marginLeft: 3,textAlign:'center', color: '#fff'}}>{setName}</Text>
                                                            </View>
                                                        </View>

                                                    )}
                                                    <View style={{flex:1, borderWidth:2, borderColor:'#fff'}}>
                                                        <View style={{flexDirection:'row', padding:5, alignContent:'center', justifyContent:'space-around', backgroundColor: '#931414', height: 35, borderWidth:3, borderColor:'#fff'}}>
                                                            <Text style={{fontWeight:'bold',textAlign:'center',width:'48%', color: '#fff',alignSelf:'center'}}>Weight:</Text>
                                                            <Text style={{fontWeight:'bold',textAlign:'center',width:'48%', color: '#fff',alignSelf:'center'}}>Reps:</Text>
                                                        </View>
                                                        <View style={{flexDirection:'row', padding:5, alignContent:'center', justifyContent:'space-around', height: 40, borderWidth:2, borderColor:'#fff'}}>
                                                            <Text style={{textAlign:'center',width:'48%', color: '#fff', borderWidth:1, borderColor:'#fff', alignSelf:'center'}}>{weightUsed} lbs</Text>
                                                            <Text style={{textAlign:'center',width:'48%', color: '#fff', borderWidth:1, borderColor:'#fff', alignSelf:'center'}}>{repsHit}</Text>
                                                        </View>
                                                    </View>

                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </Modal>
                            </View>
                        );
                    }}
                </Query>
            </View>
        );
    }
}

export default WorkoutRecord;

const styles = StyleSheet.create({

    rowColumn:{
        flexDirection:'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
        width: WIDTH * .98,
        height: 80,
        borderWidth: 2,
        borderColor: "#fff",
        backgroundColor: '#29282A',
        margin:1,
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
        fontSize: 12
    },
    trainerDetailName:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});