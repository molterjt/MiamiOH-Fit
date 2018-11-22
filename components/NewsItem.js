import React from 'react';
import {View, Text, StyleSheet, Image, Dimensions,Platform} from 'react-native';

const WIDTH=Dimensions.get('window').width;
const HEIGHT=Dimensions.get('window').height;

class NewsItem extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        };
    }
    render(){
        return(
            <View style={styles.rowContainer}>
                <Image
                    source={{uri: this.props.thumbnail}}
                    style={styles.thumbnail}
                    resizeMode="stretch"
                    alt={'NewsItem Picture Representation Thumbnail'}
                />
                <View style={styles.rowText}>
                    <Text style={styles.title} numberOfLines={2} >
                        {this.props.title}
                    </Text>
                    <Text style={styles.instructor} numberOfLines={2} >
                        {this.props.instructor}
                    </Text>
                    <Text style={styles.blurb}>
                        {this.props.blurb}
                    </Text>
                    <Text style={styles.location} >
                        {this.props.location}
                    </Text>
                </View>
            </View>
        );
    }
}

export default NewsItem;

const styles = StyleSheet.create({
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.50)',
        height: 'auto',
        padding: 10,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 10,
        borderRadius: 10,
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: '#7f7f7f',
        shadowOpacity: 1.0,
        shadowRadius: 1,
        borderWidth:2,
        borderColor:'#a5a5a5'
    },
    title: {
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: (Platform.isPad ? WIDTH/35 : 18),
        fontWeight: 'bold',
        color: '#fff'
    },
    instructor: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: (Platform.isPad ? WIDTH/40 : 14),
        color: '#fff'
    },
    blurb: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: (Platform.isPad ? WIDTH/40 : 14),
        fontStyle: 'italic',
        color: '#fff'
    },
    location: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: (Platform.isPad ? WIDTH/40 : 14),
        color: '#fff'
    },

    thumbnail: {
        flex: 1,
        justifyContent:'center',
        alignSelf:'center',

        height: (Platform.isPad ? HEIGHT*.18 : HEIGHT*.20),
        width: (Platform.isPad ? WIDTH*.16 : WIDTH*.22),
        backgroundColor: 'transparent',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 15,
        padding:5
    },
    rowText: {
        flex: 2,
        flexDirection: 'column'
    }
});