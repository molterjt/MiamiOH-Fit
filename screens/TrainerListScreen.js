import React from 'react';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';
import {
    StyleSheet, ActivityIndicator, Modal, Image, Text,
    View, Dimensions, TouchableWithoutFeedback, RefreshControl,
    ScrollView, TouchableOpacity, Platform} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const AllTRAINERS = gql`
    query{
        allTrainers(orderBy: createdAt_ASC){
            firstName
            lastName
            imageUrl
            description
            certification
            blurb
            email
            id
        }
    }
`

class TrainerProfile extends React.Component{
    constructor(props){
        super(props);
        this.state={
            personalTrainingInfo: false,
        }
    }
    showPTInfoFormModal(visible){
        this.setState({personalTrainingInfo: visible})
    }
    render(){
        return(
            <View style={styles.rowColumn}>
                <View style={{backgroundColor: 'rgba(14, 14, 16, 0.66)', width:'100%'}}>
                    <Text style={styles.profileName}>{this.props.firstName ? this.props.firstName : ''}</Text>
                    <Text style={styles.profileName}>{this.props.lastName ? this.props.lastName : ''}</Text>
                </View>
                <View >
                    <Image
                        resizeMode={"cover"}
                        source={this.props.imageUrl ? {uri: this.props.imageUrl} : require("../assets/images/blank-profile.png")}
                        height={HEIGHT*.26}
                        width={WIDTH*.31}
                        style={styles.profileImage}
                        alt={"Personal Trainer `${this.props.firstName}`"}
                    />
                </View>

                <TouchableOpacity
                    accessible={true}
                    accessibilityLabel={'Show Trainer Profile Button'}
                    accessibilityHint={'Opens modal window with trainer info'}
                    accessibilityRole={'button'}
                    style={styles.profileButton}
                    onPress={() => {this.showPTInfoFormModal(true)}}
                >
                    <Ionicons
                        name={"ios-expand"}
                        size={Platform.isPad ? WIDTH*.05 : WIDTH*.05}
                        alt={"expand facility info"}
                        color={"white"}
                        style={{fontWeight: 'bold'}}
                    />
                </TouchableOpacity>
                <Modal
                    transparent={true}
                    animationType={"none"}
                    visible={this.state.personalTrainingInfo}
                    onRequestClose={() => {this.showPTInfoFormModal(!this.state.personalTrainingInfo)} }
                >
                    <TouchableOpacity
                        onPress={() => this.showPTInfoFormModal(!this.state.personalTrainingInfo)}
                    >
                        <ScrollView contentContainerStyle={styles.modalContainer}>
                            <TouchableWithoutFeedback>
                                <View style={{backgroundColor: '#29282A', height: 'auto', width: '90%'}}>
                                    <TouchableOpacity
                                        accessible={true}
                                        accessibilityLabel={'Close Trainer Profile Button'}
                                        onPress={() => {this.showPTInfoFormModal(!this.state.personalTrainingInfo)}}
                                        style={styles.closeButton}>
                                        <MaterialCommunityIcons name={"close-box-outline"} size={30} color={"#fff"} />
                                    </TouchableOpacity>
                                    <View style={{alignContent: 'center', alignItems: 'center', backgroundColor:'#29282A', borderWidth: 0, borderColor: '#fff'}}>
                                        <Image
                                            source={{uri: this.props.imageUrl}}
                                            alt={"Trainer Profile Image"}
                                            resizeMode={"cover"}
                                            style={{width: WIDTH * .6, height: HEIGHT*.42}}
                                        />
                                    </View>
                                    <View style={{
                                        backgroundColor:'#931414',flexDirection:"column",justifyContent: 'space-between', margin: 3, flexWrap:'wrap',
                                        height: 'auto', width: 'auto', padding: 5
                                    }}
                                    >
                                        <Text style={styles.trainerDetailName}>{this.props.firstName} {this.props.lastName}</Text>
                                        <Text style={styles.trainerDetailText}>{this.props.blurb}</Text>
                                        <Text style={styles.trainerDetailText}>{this.props.email}</Text>
                                        <Text style={styles.trainerDetailText}>{this.props.certifications}</Text>
                                    </View>
                                    <View style={{margin:3, padding: 5, backgroundColor:'#dedede', borderWidth:1, marginBottom: 10, height: 'auto'}}>
                                        <Text style={{margin: 5, fontSize:(Platform.isPad ? WIDTH*.02 : 12)}}>{this.props.description}</Text>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </TouchableOpacity>
                </Modal>
            </View>
        );
    }
}

class TrainerListView extends React.Component{
    constructor(props){
        super(props);
        this.state={refreshing: false}
    }
    _onRefresh = () => {
        this.setState({refreshing:true});
        this.props.data.refetch().then(() => {
            this.setState({refreshing: false});
        });
    };
    render(){
        const { loading, error, allTrainers } = this.props.data;
        if(loading){
            return <ActivityIndicator />
        }
        if(error){
            console.log(error);
            return <Text>Sorry, there was an error</Text>
        }
        return(
         <View style={{flex:1}}>
            <ScrollView contentContainerStyle={styles.container}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                                tintColor={'#156DFA'}
                            />
                        }
            >
                <View style={{flex:3, borderWidth:0, flexDirection:"row", justifyContent:'space-around', flexWrap: 'wrap',marginBottom:50}}>
                    {allTrainers.map((obj, index) => (
                        <TrainerProfile
                            key={index}
                            imageUrl={obj.imageUrl ? obj.imageUrl : ''}
                            firstName={obj.firstName}
                            lastName={obj.lastName}
                            email={obj.email}
                            blurb={obj.blurb}
                            certifications={obj.certification}
                            description={obj.description}
                        />

                    ))}
                </View>
            </ScrollView>
         </View>
        );
    }
}
const TrainingListViewWithData = graphql(AllTRAINERS)(TrainerListView);

class TrainerListScreen extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return <TrainingListViewWithData/>
    }
}

export default TrainerListScreen;

const styles = StyleSheet.create({

    /***********/
    container:{
        // flex: 1,
        justifyContent: 'space-around',
        margin: 1,
    },
    containerRow:{
        flexDirection: "row"
    },
    rowColumn:{
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
        width: WIDTH * .32,
        height: HEIGHT*.36,
        borderWidth: 2,
        borderColor: "#000",
        backgroundColor: '#cdcdcd',
        margin:1
    },
    profileImage:{
        backgroundColor: "#000",
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        // justifyContent: 'flex-start',
        height:HEIGHT*.26,
        width: WIDTH * .31,
        borderWidth: 0,
        borderRadius: 10,
        padding:4,
        marginTop:0
    },
    profileName:{
        color: '#fff',
        fontWeight:'bold',
        fontSize: (Platform.isPad ? WIDTH*.02 : 12),
        paddingBottom:2,
        alignContent: 'center',
        textAlign:'center'

    },
    profileEmail: {
        color: '#fff',
        fontSize: 10,
    },
    profileButton:{
        alignContent: "center",
        justifyContent: 'center',
        alignItems:'center',
        borderWidth:1,
        // marginTop: 120,
        paddingTop: 0,
        fontWeight: '800',
        backgroundColor: '#931414',
        width:'100%',
        height: '12%'
    },
    modalContainer: {
        marginTop: 5,
        height: '95%',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems:'center',
        padding: 2,
        marginBottom:30

    },
    ModalInsideView:{
        alignItems: 'center',
        backgroundColor : "#fff",
        height: '91%' ,
        width: '90%',
        borderRadius:10,
        borderWidth: 3,
        borderColor: '#156DFA',
        opacity: 0.95,
        marginBottom: 30,
    },
    closeButton: {
        alignSelf: 'flex-end',
        position:'relative',
        top: 3,
        right: 7,
    },
    trainerDetailText: {
        color: "#fff",
        fontSize: (Platform.isPad ? WIDTH*.02 : 12),
        marginTop: 4,
    },
    trainerDetailName:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: (Platform.isPad ? WIDTH*.03 : 16)
    }
});

