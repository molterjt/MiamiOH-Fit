import React from 'react';
import {
    StyleSheet, Image, Platform,
    Text, View, Dimensions,
} from 'react-native';

const window = Dimensions.get('window');
const W = window.width;
const H = window.height;

class ScheduleItem extends React.Component{
    constructor(props){
        super(props);
    };
    render(){
        return(
            <View style={styles.rowContainer}>
                <Image
                    source={{uri: this.props.thumbnail}}
                    style={styles.thumbnail}
                    resizeMode="cover"
                    alt={'Group Fit Class Thumbnail'}
                />
                <View style={styles.rowText}>
                    <Text style={{paddingLeft: 10, paddingTop: 5, fontSize: (Platform.isPad ? W*.025 : 14),
                        fontWeight: 'bold', color: 'red'}}>
                        {this.props.title}
                    </Text>
                    <View style={{flexDirection: "row", flex: 1}}>
                        <Text style={{paddingLeft: 10, marginTop: 5, fontSize: (Platform.isPad ? W*.025 : 14), color: '#000000'}}>
                            {this.props.time}
                        </Text>
                        {(this.props.cancel === true)
                            ? (<Text style={{position:'absolute', right: 3, padding:2, color: "blue", fontSize: (Platform.isPad ? W*.02 : 12), marginTop: 4,}}>
                                Cancelled Today
                                </Text>
                            )
                            : (null)
                        }
                    </View>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Text style={{paddingLeft: 10, marginTop: 5, fontSize: (Platform.isPad ? W*.025 : 14), color: '#acacac'}}>
                            {this.props.instructor}
                        </Text>

                    </View>
                    <Text style={{paddingLeft: 10, marginTop: 5,fontSize: (Platform.isPad ? W*.025 : 14), color: '#acacac'}}>
                        {this.props.location}
                    </Text>
                </View>
                <View/>
            </View>
        );
    }
}
export default ScheduleItem;

const styles = StyleSheet.create({
    thumbnail: {
        //flex: 1,
        marginLeft: 1,
        height: H * 0.12 ,
        width: W * 0.3,
        shadowOffset: {width: -1, height: 1,},
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3,
        borderRadius: 15,
        borderWidth: 1,
        alignSelf: 'center',
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingRight: 10,
        paddingLeft: 8,
        paddingBottom: 5,
        marginTop: 6,
        width: Dimensions.get('window').width,
        borderRadius: 4,
        shadowOffset: {width: -1, height: 1,},
        shadowColor: 'black',
        shadowOpacity: 2.0,
        shadowRadius: 3,
        backgroundColor: '#ffffff',

    },
    rowText: {
        flex: 4,
        flexDirection: 'column',
        backgroundColor: '#fff',
    }
});