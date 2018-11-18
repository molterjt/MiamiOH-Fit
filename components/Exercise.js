import React from 'react'
import {View,Text,Image, StyleSheet,Dimensions,ScrollView,TouchableOpacity,RefreshControl } from 'react-native';
import {MaterialCommunityIcons } from '@expo/vector-icons';

const WIDTH = Dimensions.get('window').width;

class ExerciseCard extends React.Component{
    constructor(props){
        super(props);
        this.state={
            gifVisible: false,
            refreshing: false,
        };
        this._toggleGIFVisible = this._toggleGIFVisible.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
    }
    _toggleGIFVisible = (visible) => {
        this.setState({gifVisible: visible})
    };
    _onRefresh = () => {
        this.setState({refreshing:true});
        this.props.theReFetched.refetch().then(() => {
            this.setState({refreshing: false});
        });
    };
    render(){
        const {gifVisible} =this.state;
        return(
            <ScrollView
                style={styles.rowCard}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                        tintColor={'#156DFA'}
                    />
                }
            >
                <View style={styles.imageRowContainer}>
                    <Image source={{uri: this.props.image}}
                           style={styles.image}
                           resizeMode="contain"
                           alt={"Example image for this exercise"}
                    />
                </View>
                <View style={styles.rowContainer}>
                    <View style={styles.rowText}>
                        <Text style={styles.title} numberOfLines={2} >
                            {this.props.name}
                        </Text>
                        <View style={{borderColor:'#fff',borderWidth: 1, marginTop:10,flexDirection: 'row', justifyContent:'center', display: 'flex', alignContent:'center', marginLeft:10}}>
                            <Text style={{flex:3, color: '#fff',textAlign:'center'}}>Sets:</Text>
                            <Text style={{flex:3, color: '#fff',textAlign:'center'}}>Reps:</Text>
                            <Text style={{flex:3, color: '#fff',textAlign:'center'}}>Intensity:</Text>
                        </View>
                        <View style={{borderColor:'#fff',borderWidth: 1,marginTop:5, flexDirection: 'row', justifyContent:'center', display: 'flex', alignContent:'center', marginLeft:10}}>
                            <Text style={styles.details}>{this.props.sets}</Text>
                            <Text style={styles.details}>{this.props.reps}</Text>
                            <Text style={styles.details}>{this.props.intensity}</Text>
                        </View>
                        <View style={{marginTop:5, flexDirection: 'row', justifyContent:'flex-start', display: 'flex', alignContent:'center', marginLeft:10}}>
                            <Text style={{ color: '#fff', textAlign:'center'}}>Rest:</Text>
                            <Text style={{paddingLeft: 10, fontSize: 14, color: '#ACACAC', fontStyle: 'italic',}}>{this.props.restIntervals}</Text>
                        </View>
                        <View style={{flexWrap:'wrap', marginTop:5, flexDirection: 'column', justifyContent:'flex-start', display: 'flex', alignContent:'center'}}>
                            <Text style={{ color: '#fff', paddingLeft:10}}>Tempo:</Text>
                            <Text style={{paddingLeft: 10, fontSize: 14, color: '#ACACAC', fontStyle: 'italic',}}>{this.props.tempo}</Text>
                        </View>
                        <View style={{flexWrap:'wrap', marginTop:5, flexDirection: 'column', justifyContent:'flex-start', display: 'flex', alignContent:'center'}}>
                            <Text style={{ color: '#fff', paddingLeft:10}}>Description:</Text>
                            <Text style={{paddingLeft: 10, fontSize: 14, color: '#ACACAC', fontStyle: 'italic', padding:2}}>{this.props.description}</Text>
                        </View>
                    </View>

                </View>
                {this.props.videoUrl && !gifVisible

                    ?
                    (
                        <View sytle={{flexDirection:'row',alignContent: 'center', justifyContent:'center', alignSelf: 'center'}}>
                            <TouchableOpacity
                                accessible={true}
                                accessibilityLabel={'Hide Example Gif Button'}
                                accessibilityRole={'button'}
                                style={{alignItems:'center', flexDirection:'column', justifyContent:'center'}}
                                onPress={ () => this._toggleGIFVisible(!this.state.gifVisible)
                                }
                            >
                                <Text style={{textAlign:"center", color: "#931414", marginRight: 6}}>Exercise Example</Text>
                                <MaterialCommunityIcons
                                    name={"chevron-double-down"} type={"MaterialCommunityIcons"} size={35} color={'#931414'}
                                    style={{textAlign:"center"}}
                                />
                            </TouchableOpacity>
                        </View>
                    )
                    :(null)
                }
                {this.props.videoUrl && gifVisible

                    ?
                    (<View>
                        <View style={styles.gifContainer}>
                            <Image
                                alt={'Exercise Example Gif format'}
                                source={{uri: this.props.videoUrl}}
                                resizeMode={'contain'}
                                style={{ width: 'auto', height: 400 }}
                            />
                        </View>
                        <View sytle={{flexDirection:'row',alignContent: 'center', justifyContent:'center', alignSelf: 'center', marginTop:5}}>
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Show Example Gif Button'}
                            accessibilityRole={'button'}
                            style={{alignItems:'center', flexDirection:'column', justifyContent:'center'}}
                            onPress={ () => this._toggleGIFVisible(!this.state.gifVisible)}
                        >
                        <Text style={{textAlign:"center", color: "#931414", marginRight: 6}}>Hide Me</Text>
                        <MaterialCommunityIcons
                            name={"chevron-double-up"} type={"MaterialCommunityIcons"} size={35} color={'#931414'}
                            style={{textAlign:"center"}}
                        />
                        </TouchableOpacity>
                        </View>
                    </View>
                    )
                    :
                    (null)
                }
                <View style={{height:30}}/>
            </ScrollView>
        );
    }
}
export default(ExerciseCard);

const styles = StyleSheet.create({

    rowCard:{
        flex: 1,
        height: 'auto',
        // justifyContent: 'center',
        marginTop: 10,
        padding: 2,
        borderRadius: 4,
        shadowOffset:{  width: -1,  height: 1,  },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3,
        backgroundColor: '#fff'
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
        height: 300,
        padding: 1,
        marginRight: 10,
        marginLeft: 10,
        marginBottom:4,
        borderWidth:1,
        borderColor: 'gray',
        borderRadius: 4,
        shadowOffset:{  width: 1,  height: 1,  },
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3
    },
    gifContainer: {
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
    title: {
        paddingLeft: 10,
        paddingTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
        textAlign:'center'
    },

    details: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC',
        flex:3,
        textAlign:'center'
    },
    description: {
        paddingLeft: 10,
        marginTop: 5,
        fontSize: 14,
        color: '#ACACAC',
        fontStyle: 'italic',
    },
    image: {
        flex: 1,
        height: '100%',
        width: '100%'
    },
    rowText: {
        flex: 2,
        flexDirection: 'column'
    }
});

