import React, {Component} from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';
import {
    StyleSheet, ActivityIndicator, Image, Text, View,
    ScrollView, TouchableOpacity,
} from 'react-native';

const getInstructor = gql`
    query($id: ID!){
        Instructor(id: $id){
            id
            firstName
            lastName
            email
            blurb
            imageUrl
            description
            classes(orderBy:sortTime_ASC, filter:{isPublished: true}){
                title, time, id,
                days{name},location{buildingName,facilityName}
            }
            alsoTrainer{workouts{title, imageUrl, type{title} }}
        }
    }
`

class InstructorContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    render(){
        return(
            <View>
                <View style={styles.rowContainer}>
                    <Image source={{uri: this.props.image}}
                           style={styles.image}
                           alt={'Instructor Profile'}
                           resizeMode="contain" />
                    <View style={styles.rowText}>
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode ={'tail'}>
                            {this.props.firstName + " " + this.props.lastName}
                        </Text>
                        <Text style={styles.instructor} numberOfLines={1} ellipsizeMode ={'tail'}>
                            {this.props.email}
                        </Text>
                        <Text style={styles.description}>
                            {this.props.blurb}
                        </Text>
                    </View>
                </View>
                <View style={styles.rowContainer}>
                    <Text style={styles.description}>
                        {this.props.description}
                    </Text>
                </View>
                <Text style={styles.classListHeader}>My Classes: </Text>
                <View>{this.props.classListings}</View>
            </View>

        );
    }
}

class SingleInstructorDetail extends React.Component {
    static navigationOptions = ({navigation}) => {
        const { params } = this.props.navigation.state;
    };
    constructor(props){
        super(props);
    }
    _keyExtractor = (item) => item.id;

    render() {
        const { params } = this.props.navigation.state;
        const {Instructor, loading, error} = this.props.data;

        if(loading){return <ActivityIndicator />}
        if(error){return alert("Error" + error) }
        return (

            <ScrollView style={{marginBottom: 30}}>
                <InstructorContainer
                    image={Instructor.imageUrl}
                    firstName={Instructor.firstName}
                    lastName={Instructor.lastName}
                    email={Instructor.email}
                    blurb={Instructor.blurb}
                    description={Instructor.description}
                    classListings=
                    {Instructor.classes.map(({title, time, days, id, location}) => (
                        <TouchableOpacity
                            key={id}
                            accessible={true}
                            accessibilityLabel={'Class Detail Link'}
                            accessibilityHint={'Opens a new screen of respective fitness class'}
                            accessibilityRole={'link'}
                            onPress={() => this.props.navigation.navigate('ClassDetail', {itemId: id}) }
                            style={styles.scheduleBox}
                        >
                            <View style={{flexDirection:'row'}}>
                                <Text style={styles.title}>{title} </Text>
                                <Text style={styles.time}>{time}</Text>
                            </View>
                            <View>
                                <Text style={styles.days}>{days.map(({name}) => name).join(' | ')} </Text>
                                <Text style={styles.days}>{location.buildingName}: {location.facilityName}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                />
                <Text style={styles.classListHeader}>{}</Text>
                {Instructor.alsoTrainer.map(({workouts}) => (
                    workouts.map(({title, imageUrl, type}, index) => (
                        <TouchableOpacity
                            key={index}
                            accessible={true}
                            accessibilityLabel={'Workouts Screen Link Button'}
                            accessibilityHint={'Opens a to Workouts Screen'}
                            accessibilityRole={'link'}
                            onPress={() => this.props.navigation.navigate('Workouts')}
                            style={styles.scheduleBox}
                        >
                            <View style={{flexDirection:'row'}}>
                                <Image
                                    resizeMode={"cover"}
                                    source={{uri: imageUrl}}
                                    style={{height: 90, width: 110, borderWidth: 1, borderRadius: 16}}
                                    alt={'Workout Image'}
                                />
                                <View style={{marginLeft: 5}}>
                                    <Text style={styles.title}>{title} </Text>
                                    <Text style={{fontSize: 12, fontStyle:'italic', marginLeft: 5, marginTop: 5}}>Focus:</Text>
                                        {type.map( ({title}) =>
                                            <Text style={{fontSize:10, marginTop: 5, paddingLeft: 10,}}>{title} </Text>
                                        )}
                                </View>
                            </View>
                        </TouchableOpacity>
                        )
                    )
                ))}
            </ScrollView>
        );
    }
}

SingleInstructorDetail.propTypes = {
    data: PropTypes.shape({
        loading: PropTypes.bool.isRequired,
        error: PropTypes.object,
        Instructor: PropTypes.object,
    })
};

const WithInstructorInfo = graphql(getInstructor, {
        options: ({navigation}) => {
            return {
                variables: {id: navigation.state.params.itemId},
            }
        }})(SingleInstructorDetail);

class InstructorScreen extends Component{
    render(){
        return(
            <WithInstructorInfo navigation = {this.props.navigation} />
        );
    }
}
export default InstructorScreen;

const styles = StyleSheet.create({
    scheduleBox: {
        backgroundColor: '#DFE7EB',
        marginLeft: 5,
        marginRight: 5,
        marginTop: 5,
        padding: 8,
        borderRadius: 4,
        borderColor: '#931414',
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#000000',
        shadowOpacity: 1.0,
        shadowRadius: 1
    },
    classListHeader: {
        height: 30,
        justifyContent: 'center',
        marginTop: 8,
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#931414'
    },
    title: {
        paddingLeft: 5,
        paddingTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#931414'
    },
    time: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#4F4F54'
    },
    days: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 12,
        color: '#6A7275'
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
        width: 90,
        borderColor: '#ffffff'
    },
    rowText: {
        flex: 4,
        flexDirection: 'column'
    },
    rowCard:{
        marginTop: 10,
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
        height: 200,
        padding: 5,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 10,
    },
    instructor: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 12,
        color: '#ffffff'
    },
    description: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        fontStyle: 'italic',
        color: '#ACACAC'
    },
    category: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC'
    },
    image: {
        flex: 4,
        height: 200,
        width: 160
    },

});
