import React from 'react';
import PropTypes from 'prop-types';
import {Text, View, TextInput, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, AsyncStorage} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';
import {withNavigation} from 'react-navigation';
import Workout from '../components/Workout';

const GET_WORKOUTS = gql`
    query($load:Int, $skip:Int){
        allWorkouts(filter:{isPublished: true} orderBy:createdAt_DESC, first:$load, skip:$skip){
            id
            title
            type{title}
            date
            description
            exercises{name, sets, reps, intensity, tempo, id}
            author{alsoInstructor{id, firstName}}
            imageUrl
        }
    }
`

let queryUserId;

class WorkoutView extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            refreshing: false,
            isLoading:true,
            currentUserId: '',
            theSets: [],
            setOne: undefined,
        };
        this.handlePressExercise = this.handlePressExercise.bind(this);
        this.handleCompleteWorkout = this.handleCompleteWorkout.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
        this.setTheSets = this.setTheSets.bind(this);
    }
    _onRefresh = () => {
        this.setState({refreshing:true});
        this.props.data.refetch().then(() => {
            this.setState({refreshing: false});
        });
    };

    handlePressExercise = (exercise) => {
        this.props.navigation.navigate("ExerciseDetail", {itemId: exercise});
    };

    handleCompleteWorkout = (workout) => {
        this.props.navigation.navigate("SubmitWorkout", {itemId: workout});
    };

    setTheSets = (setSets) => {
        this.setState({workoutSets: setSets})
    };

    componentDidMount(){
        AsyncStorage.getItem("MyUserId").then( (dataId) => {
            queryUserId = JSON.parse(dataId);
            this.setState({currentUserId: queryUserId, isLoading: false});
            console.log("Workout Screen => queryUserId === " + queryUserId);
            return queryUserId;
        }).done();
    }
    render() {
        const {data} = this.props;
        const { loading, error, allWorkouts } = this.props.data;
        const {navigation} = this.props;
        if(this.state.isLoading || loading){
            return <ActivityIndicator size={'large'} color={'#931414'} />
        }
        if(error){
            return <Text style={{textAlign:'center', fontWeight:'bold', marginTop: 30}}>{error.message}</Text>
        }
        return(
            <ScrollView
                style={{marginBottom:30}}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                        tintColor={'#156DFA'}
                    />
                }
            >
                {allWorkouts.map(( obj, index ) => (
                        <Workout
                            key={obj.id}
                            id={obj.id}
                            title={obj.title}
                            type={obj.type.map(({title, id}) => title).join(', ')}
                            exercises={obj.exercises.map(({name, reps, sets, intensity, id, tempo}, index) => (
                                    <View key={index}>
                                        <TouchableOpacity
                                            accessible={true}
                                            accessibilityLabel={'Exercise Detail Link Button'}
                                            accessibilityRole={'link'}
                                            onPress={() => this.handlePressExercise(id, name)}
                                            key={id}
                                            style={{flexDirection:'row'}}
                                        >
                                            <Text style={styles.title} key={id}>
                                                {name}
                                            </Text>
                                            <Ionicons
                                                name={'ios-add-circle-outline'}
                                                color={'white'}
                                                size={19}
                                                style={{marginLeft: 5, marginTop:3}}
                                            />
                                        </TouchableOpacity>
                                        <Text style={styles.info} >
                                            Sets: {sets}
                                        </Text>
                                        <Text style={styles.info} >
                                            Reps: {reps}
                                        </Text>
                                        <Text style={styles.info} >
                                            Intensity: {intensity}
                                        </Text>
                                    </View>
                                )
                            )}
                            description={obj.description}
                            image={obj.imageUrl}
                            userCheckinId={queryUserId}
                            workoutCheckinId={obj.id}
                        />
                    )
                )}
                <View sytle={{flexDirection:'row',alignContent: 'center', justifyContent:'center', alignSelf: 'center', marginTop: 10}}>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Show More Workouts Button'}
                        accessibilityRole={'button'}
                        style={{alignItems:'center', flexDirection:'column', justifyContent:'center'}}
                        onPress={ () => {
                            this.props.data.fetchMore({
                                variables:{
                                    load: 1,
                                    skip: data.allWorkouts.length
                                },
                                updateQuery: (previousResult, {fetchMoreResult}) => {
                                    if (!fetchMoreResult){
                                        console.log('NO FetchMore');
                                        return previousResult;
                                    }
                                    console.log('trying to copy data');
                                    return Object.assign({}, previousResult, {
                                        allWorkouts : [...previousResult.allWorkouts, ...fetchMoreResult.allWorkouts]
                                    });
                                }
                            })
                        }}
                    >
                        <Text style={{textAlign:"center", color: "#931414", marginTop:10}}>More</Text>
                        <MaterialCommunityIcons
                            name={"chevron-double-down"} type={"MaterialCommunityIcons"} size={45} color={'#931414'}
                            style={{textAlign:"center"}}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
}
WorkoutView.propTypes = {
    data: PropTypes.shape({
        loading: PropTypes.bool.isRequired,
        allWorkouts: PropTypes.array
    })
};

const AllWorkoutsViewWithData = graphql(
    GET_WORKOUTS,{
        options: () => {
            return {
                variables: {load:2, skip:0}
            }
        }
    })(WorkoutView);

class WorkoutScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={
            oneRepMax: '',
            weightLifted: '',
            repCount: '',
            intensityPercent: '',
            maxForPercent: '',
            intensityLevel: '',
        };
        this.estimated1RMLanderFormula = this.estimated1RMLanderFormula.bind(this);
        this.suggestedIntensity = this.suggestedIntensity.bind(this);
    }

    estimated1RMLanderFormula(W, R){
        if(R > 1 && R < 16){
            W=parseInt(W);
            R=parseInt(R);
            //let MAX = W * (36/(37-R));
            let MAX = W/(1.013 - (0.0267123 * R)) + 2;
            MAX = MAX.toFixed(1);
            this.setState({oneRepMax: MAX});
        }else if(R < 1){
            this.setState({oneRepMax: 0});
        }else if(R > 15){
            this.setState({oneRepMax: 'Reps: [2-15]'});
        }else{
            this.setState({oneRepMax: W});
        }
    };
    suggestedIntensity(m, p){

        let intensity = (p/100) * m;
        intensity = intensity.toFixed(1);
        this.setState({intensityLevel: intensity});
    };
    render(){
        const {oneRepMax, weightLifted, repCount, intensityPercent, maxForPercent, intensityLevel} = this.state;
        return(
            <View style={{marginBottom:80, paddingBottom:50}}>
                <Text style={{backgroundColor: '#156DFA', color: 'white', textAlign: 'center', fontStyle: 'italic', fontSize: 12}}>Estimated One-Rep Max:</Text>
                <View style={{paddingTop: 8, paddingBottom:8, flexDirection: 'row', alignItems:'center', justifyContent:'center', backgroundColor:'#29282A'}}>
                    <TextInput
                        style={{width: 80, borderWidth:1, borderColor: '#fff', padding: 8, marginRight: 10, textAlign: 'center', backgroundColor:'#fff'}}
                        type={'number'}
                        value={weightLifted}
                        onChangeText={ (weightLifted) => {
                            this.setState({weightLifted});
                        }}
                        accessibilityLabel={'Weight lifted input for estimated 1 Rep Max Equation'}
                        placeholder={'Weight'}
                        autoCapitalize={'none'}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        keyboardType={'number-pad'}
                    />
                    <Text style={{color:'#fff'}}> x </Text>
                    <TextInput
                        style={{width: 80, borderWidth:1, borderColor: '#fff', padding: 8, marginLeft: 10, textAlign: 'center', backgroundColor:'#fff'}}
                        value={repCount}
                        onChangeText={ (repCount) => {
                            this.setState({repCount: repCount});
                        }}
                        accessibilityLabel={'Repetitions of weight lifted input for estimated 1 Rep Max Equation'}
                        placeholder={'Reps'}
                        autoCapitalize={'none'}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        keyboardType={'number-pad'}
                    />
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'One Rep Max Intensity Calculation'}
                        accessibilityRole={'button'}
                        style={{marginLeft: 10, marginRight: 10}}
                        onPress={() => this.estimated1RMLanderFormula(weightLifted, repCount)}>
                        <MaterialCommunityIcons name={"arrow-right-bold-box-outline"} size={35} color={"#156DFA"}/>
                    </TouchableOpacity>
                    {oneRepMax > 0
                        ? (<Text style={{fontWeight:'bold', color: '#fff'}}>{oneRepMax} lbs</Text>)
                        : (<Text style={{fontWeight:'bold', color: '#fff'}}>{oneRepMax}</Text>)
                    }

                </View>
                <Text style={{backgroundColor: '#156DFA', color: 'white',textAlign: 'center', fontStyle: 'italic', fontSize: 12, }}>Estimated Intensity:</Text>
                <View style={{paddingTop: 8, paddingBottom:8, flexDirection: 'row', alignItems:'center', justifyContent:'center',borderWidth:1, backgroundColor:'#29282A' }}>
                    <TextInput
                        style={{width: 50, borderWidth:1, borderColor: '#fff', padding: 8, marginRight: 6, marginLeft:20, textAlign: 'center', backgroundColor: '#fff'}}
                        value={intensityPercent}
                        onChangeText={ (e) => {
                            this.setState({intensityPercent: e});

                        }}
                        accessibilityLabel={'Percentage level for intensity'}
                        placeholder={'80'}
                        autoCapitalize={'none'}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        keyboardType={'number-pad'}
                    />
                    <Text style={{color: "#fff"}}>% </Text>
                    <Text style={{marginLeft: 8, color: "#fff"}}> of </Text>
                    <TextInput
                        style={{width: 80, borderWidth:1, borderColor: '#fff', padding: 8, marginLeft: 16, textAlign: 'center',backgroundColor: '#fff'}}
                        value={maxForPercent}
                        onChangeText={ (e) => {
                            this.setState({maxForPercent: e});
                        }}
                        accessibilityLabel={'Weight input to calculate intensity percentage'}
                        placeholder={'1RM'}
                        autoCapitalize={'none'}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        keyboardType={'number-pad'}
                    />
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Percentage of Weight Calculation Button'}
                        accessibilityRole={'button'}
                        style={{marginLeft: 10, marginRight: 10}}
                        onPress={() => this.suggestedIntensity(maxForPercent, intensityPercent)}>
                        <MaterialCommunityIcons name={"arrow-right-bold-box-outline"} size={35} color={"#156DFA"}/>
                    </TouchableOpacity>
                    <Text style={{fontWeight:'bold', color:'#fff'}}>{intensityLevel} lbs</Text>
                </View>
                <AllWorkoutsViewWithData navigation = {this.props.navigation} />
            </View>
        );
    }
}

export default withNavigation(WorkoutScreen);

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
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#CCC',
        shadowOpacity: 1.0,
        shadowRadius: 3,
    },
    title: {
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'red'
    },
    info: {
        paddingLeft: 40,
        paddingTop: 3,
        fontSize: 14,
        color: '#ACACAC'
    },
    rowText: {
        flex: 4,
        flexDirection: 'column'
    }
});