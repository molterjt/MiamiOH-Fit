import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions,} from 'react-native';
import {Entypo} from '@expo/vector-icons'
import {withNavigation} from 'react-navigation';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

class UserProfile extends React.Component{
    constructor(props){
        super(props);
        this.state ={};
    }
    render(){
        return(
            <View style={{ padding: 5}}>
                <View style={styles.rowContainer}>
                    <View style={styles.rowText}>
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Edit Profile Link Button'}
                            accessibilityRole={'link'}
                            style={{alignItems:'flex-end', paddingRight: 16}}
                            onPress={() => this.props.navigation.navigate('Edit', {itemId: this.props.id})}
                        >
                            <Entypo
                                name={"edit"} type={"MaterialIcons"} size={30} color={'#156DFA'}
                            />
                        </TouchableOpacity>

                        <Text style={styles.headText} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.username}
                        </Text>
                        <Text style={styles.supportText} numberOfLines={1} ellipsizeMode ={'tail'}>
                            {this.props.firstName} {this.props.lastName}
                        </Text>
                        <Text style={styles.headText} numberOfLines={2} ellipsizeMode ={'tail'}>
                            {this.props.email}
                        </Text>
                        <Text style={styles.location} numberOfLines={1} ellipsizeMode ={'tail'}>
                            {this.props.dateOfBirth}
                        </Text>
                        <View sytle={{paddingTop: 8}}>
                            <Text style={styles.headText}>Interests: </Text>
                            <Text style={styles.supportText}>
                                {this.props.interests}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
export default withNavigation(UserProfile);

const styles = StyleSheet.create({
    rowContainer: {
        backgroundColor: '#FFF',
        height: 'auto',
        padding: 10,
        marginRight: 3,
        marginLeft: 3,
        marginTop: 10,
        borderRadius: 4,
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#CCC',
        shadowOpacity: 1.0,
        shadowRadius: 1
    },
    rowText: {
        flex: 1,
        height: 'auto',
        width: WIDTH*.95,
        paddingBottom: 20,
        paddingLeft: 10,
        paddingRight: 10
    },
    headText: {
        paddingLeft: 10,
        paddingTop: 8,

        fontSize: 16,
        fontWeight: 'bold',
        color: '#777'
    },
    supportText: {
        paddingLeft: 10,
        paddingRight:4,
        marginTop: 5,
        fontSize: 14,
        color: '#777'
    },
    blurb: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#777'
    },
    location: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#777'
    },
    thumbnail: {
        flex: 1,
        height: 'auto',
        width: 120
    },

    categoryThumb:{
        width: 220,
        height: 175,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 10,
    },
});