import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {View, Text} from 'react-native';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';

import ExerciseCard from '../components/Exercise'

const EXERCISE_QUERY = gql`
    query SingleExercise($id: ID!){
        Exercise(id: $id) {
            id
            name
            description
            sets
            reps
            intensity
            tempo
            imageUrl
            restIntervals
            videoUrl
        }
    }
`
class ExerciseDetail extends Component {

    static navigationOptions = ({navigation}) => {
        const { params } = this.props.navigation.state;
        return{
            title: `${params.name}`
        }
    };
    render() {
        const { params } = this.props.navigation.state;
        const itemId = params ? params.itemId : null;
        const { data: { loading, error, Exercise } } = this.props;
        if(loading){return <Text>Loading...</Text>}
        if(error){
            return (
                <View>
                    <Text>Error</Text>
                    {console.log(error)}
                </View>
            )
        }
        return (
            <View style={{flex: 1, justifyContent: 'center'}}>
                <ExerciseCard
                    key={this.props.data.Exercise.id}
                    name={this.props.data.Exercise.name}
                    sets={this.props.data.Exercise.sets}
                    reps={this.props.data.Exercise.reps}
                    tempo={this.props.data.Exercise.tempo}
                    intensity={this.props.data.Exercise.intensity}
                    restIntervals={this.props.data.Exercise.restIntervals}
                    description={this.props.data.Exercise.description}
                    image={this.props.data.Exercise.imageUrl}
                    videoUrl={this.props.data.Exercise.videoUrl}
                    theReFetched={this.props.data}
                />
            </View>
        );
    }
}
ExerciseDetail.propTypes = {
    data: PropTypes.shape({
        loading: PropTypes.bool.isRequired,
        error: PropTypes.object,
        Exercise: PropTypes.object,
    }).isRequired
};

const WithExerciseInformation = graphql(EXERCISE_QUERY, {
    options: ({navigation}) => {
        return {
            variables: {id: navigation.state.params.itemId},
        }
    }
})(ExerciseDetail);

class ExerciseView extends Component{
    render(){
        return(
            <WithExerciseInformation navigation = {this.props.navigation} />
        );
    }
}
export default ExerciseView;
