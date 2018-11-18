import React from "react";
import {View, Text, StyleSheet, Image,} from 'react-native';

class Facility extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <View style={styles.rowCard}>
                <View style={styles.imageRowContainer}>
                    <Image source={{uri: this.props.image}}
                           style={styles.image}
                           resizeMode="contain"
                           alt={this.props.title}
                    />
                </View>
                <View style={styles.rowContainer}>
                    <View style={styles.rowText}>
                        <Text style={styles.title} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.title}
                        </Text>
                        <Text style={styles.days} numberOfLines={3} ellipsizeMode ={'tail'}>
                            {this.props.hours}
                        </Text>
                        <Text style={styles.location} numberOfLines={1} ellipsizeMode ={'tail'}>
                            {this.props.location}
                        </Text>
                        <Text style={styles.location} numberOfLines={1} ellipsizeMode ={'tail'}>
                            {this.props.address}
                        </Text>
                        <Text style={styles.description} numberOfLines={5} ellipsizeMode ={'tail'}>
                            {this.props.description}
                        </Text>
                    </View>
                </View>
            </View>

        );
    }
}

export default Facility;

const styles = StyleSheet.create({

    rowCard:{
        marginTop: 5,
        borderRadius: 4,
        shadowOffset:{  width: -1,  height: 1,  },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3,
        paddingBottom: 5
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
    instructor: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ffffff'
    },
    days: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC'
    },
    description: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC'
    },
    location: {
        paddingLeft: 10,
        marginTop: 5,
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
        flex: 4,
        height: undefined,
        width: 160
    },
    rowText: {
        flex: 4,
        flexDirection: 'column',
        paddingBottom: 5,
    }
});