import React from 'react';
import {
    Text, View, TouchableOpacity, Modal,TouchableWithoutFeedback,
    ScrollView, Animated, Dimensions, Image, StyleSheet
} from 'react-native';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Ionicons, MaterialCommunityIcons,SimpleLineIcons, MaterialIcons } from '@expo/vector-icons';
import MapView, {Marker} from "react-native-maps";

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 2.8;
const CARD_WIDTH = CARD_HEIGHT - 20;

const FACILITYLIST = gql`
    query($buildingTitle: String){
        allFacilities(filter:{buildingName: $buildingTitle}){
            id
            facilityName
            buildingName
            address
            description
            createdAt
            open
            updatedAt
            imageUrl
            events(filter:{isPublished: true}){name, time, date}
            classes(filter:{isPublished: true}){title, time, cancelled, days(orderBy: id_ASC){name}}
            hours
        }
    }
`

class FacilityDetail extends React.Component{
    constructor(props){
        super(props);
        this.state={facilityInfo: false, refreshing: false};
    }
    showFacilityModal(visible){
        this.setState({facilityInfo: visible})
    }

    render(){
        return(
            <View style={{marginTop:12}} >
                <TouchableOpacity
                    accessibilityLabel={'Button for Facility Details'}
                    accessibilityHint={'Will open a new screen with facility detail information'}
                    accessibilityRole={'button'}
                    style={styles.profileButton}
                    onPress={() => {this.showFacilityModal(true)}}
                >
                    <Ionicons
                        name={"ios-expand"}
                        accessibilityRole={'imageButton'}
                        size={28}
                        alt={"expand facility info"}
                        color={"white"}
                        style={{fontWeight: 'bold'}}
                    />
                </TouchableOpacity>

            <Query query={FACILITYLIST} variables={{buildingTitle: this.props.buildingName  }}>
                {({loading, error, data}) => {
                    if (loading) return <Text>"Loading..."</Text>
                    if (error) return <Text style={{textAlign:'center', fontWeight:'bold', marginTop:5}}>{error.message}</Text>
                    return (
                        <View>
                        <Modal
                            transparent={true}
                            animationType={"none"}
                            visible={this.state.facilityInfo}
                            onRequestClose={() => {
                                this.showFacilityModal(!this.state.facilityInfo)
                            }}
                        >
                            <TouchableOpacity
                                accessibilityLabel={'Outside Modal Window Button Close'}
                                accessibilityHint={'Clicking outside of the modal window will close the window'}
                                accessibilityRole={'imagebutton'}
                                onPress={() => {
                                    this.showFacilityModal(!this.state.facilityInfo)
                                }}
                                style={styles.modalContainer}>

                                <View style={styles.ModalInsideView}>
                                    <TouchableOpacity
                                        accessibilityLabel={'Facility Details Modal Window Close Button'}
                                        accessibilityHint={'Will close the facility detail modal window'}
                                        accessibilityRole={'button'}
                                        onPress={() => {
                                            this.showFacilityModal(!this.state.facilityInfo)
                                        }}
                                        style={styles.closeButton}>
                                        <MaterialCommunityIcons
                                            accessibilityLabel={'Button for Facility Details'}
                                            accessibilityHint={'Will open a new screen with facility detail information'}
                                            accessibilityRole={'imageButton'}
                                            name={"close-box-outline"}
                                            size={30}
                                            color={"#156DFA"}
                                            alt={"Close Modal Window Button"}
                                        />
                                    </TouchableOpacity>
                                    <ScrollView>
                                    {data.allFacilities.map(({id, facilityName, hours, open, description, imageUrl, events, classes}) => (
                                        <TouchableWithoutFeedback key={id}>
                                        <View key={id} style={{flexDirection: "column", margin: 5}}>
                                            <View style={{flex: 2, flexDirection: 'row', borderTopWidth: 1, borderColor: '#000'}}>
                                                <Text style={{marginTop: 10, fontSize: 18, fontWeight: '700', width:width*.54}}>{facilityName}</Text>
                                                {open === true
                                                    ? <Text style={{marginTop: 10, color: 'red', position: 'absolute', right: 10}}>Open</Text>
                                                    : <Text style={{marginTop: 10, color: 'red', position: 'absolute', right: 10 }}>Closed</Text>
                                                }
                                            </View>
                                            <Image
                                                accessibilityRole={'image'}
                                                source={{uri: imageUrl}}
                                                alt={"Fitness Facility Image"}
                                                resizeMode={"cover"}
                                                style={{margin: 5, borderWidth: 1, borderColor: "#000", width: 'auto', height:240,  borderRadius: 10}}
                                            />
                                            {hours
                                                ?
                                                (<View style={{borderBottomWidth: 1, borderColor: 'blue'}}>
                                                        <Text style={{fontSize:10, fontWeight:"bold"}}>Hours:</Text>
                                                        <Text style={{fontSize: 12, fontStyle: 'italic', margin: 5, }}>{hours}</Text>
                                                </View>
                                                )
                                                :
                                                null
                                            }
                                            {description
                                                ?
                                                (<View style={{borderBottomWidth: 1, borderColor: 'blue'}}>
                                                    <Text style={{marginTop: 5, fontSize:10, fontWeight:"bold"}}>Description:</Text>
                                                    <Text style={{fontSize: 12, fontStyle: 'italic',margin: 5, borderBottomWidth: 1, borderColor: 'blue'}}>{description}</Text>
                                                </View>
                                                )
                                                :
                                                null
                                            }
                                            {events.length !== 0
                                                ?
                                                (<View style={{borderBottomWidth: 1, borderColor: 'blue', padding: 3}}>
                                                    <Text style={{marginTop: 10, fontSize:12, fontWeight:"bold", alignSelf:'center'}}>Events:</Text>
                                                    {events.map(({name, time, date}, index) =>
                                                        <Text  key={index} style={{fontSize: 12, fontStyle: 'italic', margin: 5, }}>{name} @ {time} on {date}</Text>
                                                    )}
                                                </View>)
                                                :
                                                null
                                            }
                                            {classes.length !== 0
                                                ?
                                                (<View>
                                                    <Text style={{marginTop: 10, fontSize:12, fontWeight:"bold", alignSelf:'center'}}>Classes:</Text>
                                                    <View style={{padding: 1, marginTop: 10, flex:2, flexDirection:'row', flexWrap:'wrap', alignItems: 'center', justifyContent:'space-between'}}>
                                                    {classes.map((obj, index) => (
                                                        <View key={index} style={{ padding: 2, width: width*.42, borderBottomWidth:1,  borderColor:"blue"}}>
                                                        <Text style={{marginTop: 5, fontWeight: 'bold', fontSize: 10, }}>  {obj.days.map(({name}) => name).join(', ')}</Text>
                                                        <Text style={{marginTop: 5, fontSize: 12, fontStyle: 'italic',margin: 5}}>{obj.title}</Text>
                                                        <Text style={{fontSize: 12, fontStyle: 'italic',margin: 5}}>{obj.time}</Text>
                                                        {obj.cancelled === true
                                                            ? <Text style={{fontSize: 10, color: 'red', fontStyle: 'italic',margin: 5}}>Cancelled</Text>
                                                            : <Text/>
                                                        }
                                                    </View>
                                                    ))}
                                                </View>
                                                </View>
                                                )
                                                :
                                                null
                                            }
                                        </View>
                                        </TouchableWithoutFeedback>
                                    )) }
                                    </ScrollView>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                        </View>
                    )
                }}
            </Query>
            </View>
        );
    }
}

class FacilitiesScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            facilityInfo: false,
            myPosition: {
                latitude: 39.504894,
                longitude:  -84.737768,
            },
            myErr: null,
            markers: [
                {
                    coordinate: {
                        latitude: 39.502894,
                        longitude:  -84.738768,
                    },
                    title: "Miami Rec Sports Center",
                    building: "Miami Recreation Sports Center",
                    description: "750 S. Oak St.",
                    phone: "(513) 529-4732",
                    image: {uri: "https://i.imgur.com/jK09mk2.jpg"}
                },
                {
                    coordinate: {
                        latitude: 39.499011,
                        longitude: -84.744451,
                    },
                    title: "Chestnut Field House",
                    building: "Chestnut Field House",
                    description: "131 W. Chestnut St.",
                    phone: "(513) 529-6007",
                    image: {uri:"https://i.imgur.com/VWSjCP0.jpg?1"}
                },
                {
                    coordinate: {
                        latitude: 39.504508,
                        longitude: -84.726578,
                    },
                    title: "Clawson Fitness Center",
                    building: "Clawson Hall",
                    description: "440 Western College Dr.",
                    phone: "(513) 529-3539",
                    image: {uri: "https://i.imgur.com/leKthDz.jpg?1"}
                },
                {
                    coordinate: {
                        latitude: 39.515439,
                        longitude: -84.733123,
                    },
                    title: "NorthQuad Fitness Center",
                    building: "Martin Hall",
                    description: "5397 Bonham Rd. Lower-Level",
                    phone: "(513) 529-4175",
                    image: {uri: "https://i.imgur.com/OZUCO2y.jpg?1"}
                },

            ],
            region: {
                latitude: 39.502,
                longitude: -84.737,
                latitudeDelta: 0.045,
                longitudeDelta: 0.03,
            },
        };
    }

    componentWillMount() {
        this.index = 0;
        this.animation = new Animated.Value(0);
    }
    componentDidMount() {
        this.animation.addListener(({ value }) => {
            let index = Math.floor(value / CARD_WIDTH + 0.3);
            if (index >= this.state.markers.length) {
                index = this.state.markers.length - 1;
            }
            if (index <= 0) {
                index = 0;
            }

            clearTimeout(this.regionTimeout);
            this.regionTimeout = setTimeout(() => {
                if (this.index !== index) {
                    this.index = index;
                    const { coordinate } = this.state.markers[index];
                    this.map.animateToRegion(
                        {
                            ...coordinate,
                            latitudeDelta: this.state.region.latitudeDelta,
                            longitudeDelta: this.state.region.longitudeDelta,
                        },
                        200
                    );
                }
            }, 10);
        });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    myPosition: position.coords,
                    error: null,
                });
            },
            (error) => this.setState({error: error.message}),
                {enableHighAccuracy:true, timeout: 20000, maximumAge: 1000}
            );
    }
    render() {
        const interpolations = this.state.markers.map((marker, index) => {
            const inputRange = [
                (index - 1) * CARD_WIDTH,
                index * CARD_WIDTH,
                ((index + 1) * CARD_WIDTH),
            ];
            const scale = this.animation.interpolate({
                inputRange,
                outputRange: [1, 1.5, 1],
                extrapolate: "clamp",
            });
            const opacity = this.animation.interpolate({
                inputRange,
                outputRange: [0.35, 1, 0.35],
                extrapolate: "clamp",
            });
            return { scale, opacity };
        });
        return (
            <View style={styles.container}>
                <View style={{marginTop: 0, flexDirection: "row", backgroundColor: "#fff", justifyContent:"center"}}>
                    <TouchableOpacity
                        accessibilityLabel={'Reset Map Button'}
                        accessibilityHint={'Will reset map to preset coordinates'}
                        accessibilityRole={'button'}
                        onPress={() => this.map.animateToRegion(this.state.region, 200)}
                        style={{alignItems:"center", flexDirection:"row", padding: 5, marginTop:25,}}
                    >
                        <Text style={{color:"blue", fontSize: 16, marginRight: 10}}>Reset Map</Text>
                        <MaterialCommunityIcons
                            accessibilityRole={'imageButton'}
                            name={"target-variant"}
                            type={"materialCommunityIcons"} size={30}
                            color={"blue"}
                            alt={"Map Location Reset Symbol"}
                        />
                    </TouchableOpacity>
                </View>
                <MapView
                    ref={map => this.map = map}
                    initialRegion={this.state.region}

                    style={styles.mapContainer}
                >
                    {this.state.markers.map((marker, index) => {
                        const scaleStyle = {
                            transform: [
                                {
                                    scale: interpolations[index].scale,
                                },
                            ],
                        };
                        const opacityStyle = {
                            opacity: interpolations[index].opacity,
                        };
                        return (

                        <Marker key={index} coordinate={marker.coordinate} title={marker.title}>
                            <Animated.View style={[styles.markerWrap, opacityStyle]}>
                                <MaterialIcons name={'my-location'} color={'#931414'} size={28} />
                            </Animated.View>
                        </Marker>

                        );
                    })}
                    <MapView.Marker coordinate={this.state.myPosition} title={'Me'}>
                        <Animated.View style={styles.markerWrap}>
                            <Animated.View style={styles.myRing}/>
                            <View style={styles.myMarker} />
                        </Animated.View>
                    </MapView.Marker>
                </MapView>
                <Animated.ScrollView
                    accessibilityRole={'adjustable'}
                    horizontal
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH}
                    onScroll={Animated.event(
                        [
                            {
                                nativeEvent: {
                                    contentOffset: {
                                        x: this.animation,
                                    },
                                },
                            },
                        ],
                        { useNativeDriver: true }
                    )}
                    style={styles.scrollView}
                    contentContainerStyle={styles.endPadding}
                >
                    {this.state.markers.map((marker, index) => (
                        <View style={styles.card} key={index}>
                            <Image
                                accessibilityHint={'Image representing a fitness facility'}
                                accessibilityRole={'image'}
                                source={marker.image}
                                style={styles.cardImage}
                                resizeMode="cover"
                                alt={"Fitness Facility Image"}
                            />
                            <View style={styles.textContent}>
                                <Text numberOfLines={1} style={styles.cardTitle}>{marker.title}</Text>
                                <Text numberOfLines={1} style={styles.cardDescription}>{marker.description}</Text>
                                <Text numberOfLines={1} style={styles.cardDescription}>{marker.phone}</Text>
                            </View>
                            <FacilityDetail buildingName={marker.building}/>
                        </View>
                    ))}
                </Animated.ScrollView>
            </View>
        );
    }
}

export default FacilitiesScreen;

const styles = StyleSheet.create({
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
    endPadding: {
        paddingRight: width - CARD_WIDTH,
    },
    card: {
        padding: 10,
        elevation: 2,
        backgroundColor: "#acb6bb",
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.7,
        shadowOffset: { x: 2, y: -2 },
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        overflow: "hidden",
        borderRadius: 15,
        borderColor: "#000",
        borderWidth: 2,
    },
    cardImage: {
        flex: 3,
        width: "100%",
        height: "100%",
        alignSelf: "center",
        borderWidth: 1
    },
    textContent: {
        flex: 1,
        color: "#fff",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        marginTop: 5,
        fontWeight: "bold",
        color: "#931414",
    },
    cardDescription: {
        fontSize: 12,
        color: "#000",
        marginBottom: 4
    },
    markerWrap: {
        alignItems: "center",
        justifyContent: "center",
    },
    marker: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "red",
    },
    ring: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "white",
        opacity: 0.4,
        position: "absolute",
        borderWidth: 1,
        borderColor: "red",
    },
    myMarker: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#0c3eff",
    },
    myRing: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "white",
        opacity: 0.4,
        position: "absolute",
        borderWidth: 1,
        borderColor: "#0c3eff",
    },


    /****************/
    profileButton:{
        alignItems: 'center',
        alignSelf:'center',
        padding:1,
        fontWeight: 'bold',
        backgroundColor: "#931414",
        borderRadius: 15,
        width: '50%'
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
        opacity: 1,
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