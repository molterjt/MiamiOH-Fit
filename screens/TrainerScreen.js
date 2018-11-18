import React from 'react'
import {
    View, Text, Dimensions, Modal, TouchableOpacity, Image, ScrollView, WebView, StatusBar,
    StyleSheet, ActivityIndicator
} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {Query} from 'react-apollo';
import gql from "graphql-tag";
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;


const GET_MEMBERSHIPS = gql`
    query{
        allMemberships(filter:{type: "training"}, orderBy: startBalance_ASC, skip:1){
            title
            type
            startBalance
            rateMember
            rateNonMember
            url
        }
    }  
`;

const GET_LINK = gql`
    query{
        Membership(id:"cjnwmkhhdmm5s0116wy797q0o"){
            title
            type
            url
        }
    }  
`;


class TrainingMembership extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showPTRegisterModal: false
        }
    }
    showPTRegisterModal(visible){
        this.setState({showPTRegisterModal: visible})
    }
    render(){
        return(
            <View style={{width: WIDTH*.5, alignItems:'center', alignContent:'center', backgroundColor:'#fff',
                justifyContent:'space-evenly',borderRightWidth:1, borderBottomWidth:1,}}>
                <View style={{marginTop: 18, marginLeft: 10, alignItems:'center'}}>
                    <Text style={{color:"#000", fontWeight:"bold", fontSize: 13}}>{this.props.title}</Text>
                    <View style={{flexDirection: "row", marginTop: 5, justifyContent:'center', alignItems:'center', flexWrap: 'wrap',}}>
                        <Text style={{color:"#535353", fontStyle:"italic", fontSize: 12}}>Member Rate: </Text>
                        <Text style={{color:"#000", fontSize: 12}}>{this.props.memberRate}</Text>
                    </View>
                    <View style={{marginTop: 3}}>
                        <Text style={{color:"#535353", fontStyle:"italic", fontSize: 10}}>{this.props.memberRateUnitPrice}</Text>
                    </View>

                </View>
                {
                    this.props.registerUrl
                        ?
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Training Program Registration Button'}
                            accessibilityRole={'button'}
                            onPress={() => {this.showPTRegisterModal(true)}}
                            style={{marginTop: 10, marginLeft:10, marginBottom: 8, flexDirection: "row",
                                justifyContent: 'center', alignItems: 'center', borderRadius: 15,
                                backgroundColor: "#931414", width: "50%"
                            }}
                        >

                            <Text style={{color: "#fff", fontSize: 11}}>Register</Text>
                            <MaterialCommunityIcons
                                name={"checkbox-marked-circle-outline"}
                                size={18}
                                color={"white"}
                                alt={"Register checkbox-marked symbol"}
                            />
                        </TouchableOpacity>
                        :
                        <View style={{flexDirection: "row", paddingTop: 3, paddingBottom: 5}}>
                            <Text style={{color:"#535353", fontStyle:"italic", fontSize: 12}}>** Register at Rec Pro Shop **</Text>
                        </View>
                }

                <Modal
                    transparent={false}
                    animationType={"fade"}
                    visible={this.state.showPTRegisterModal}
                    onRequestClose={() => {this.showPTRegisterModal(!this.state.showPTRegisterModal)} }
                >
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Close Training Program Registration Button'}
                        accessibilityRole={'button'}
                        onPress={() => {this.showPTRegisterModal(!this.state.showPTRegisterModal)}}
                        style={{marginLeft: 5, marginTop: 50, flexDirection: "row"}}>
                        <Ionicons name={"md-arrow-back"} size={30} color={"#156DFA"} alt={"Arrow symbol to go back previous page"}/>
                        <Text style={{color: "#156DFA", marginTop: 7, marginLeft: 8}}>Go Back</Text>
                    </TouchableOpacity>
                    <WebView
                        //source={{uri:"http://recmiamioh.maxgalaxy.net/Membership.aspx?PackageID=" + this.props.registerUrl}}
                        source={{uri: this.props.registerUrl}}
                        style={{flex: 1}}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                </Modal>
            </View>
        );
    }
}

class TrainerScreen extends React.Component{
    static navigationOptions = {
        header: null,
    };
    constructor(props){
        super(props);
        this.state = {
            personalTrainingInfo: false,
        }
    }
    showPTInfoFormModal(visible){
        this.setState({personalTrainingInfo: visible})
    }
    render(){
        return(
            <View style={{flex:1, backgroundColor: "#fff", }}>
                <View style={{alignItems: 'center',width: WIDTH, height:HEIGHT*.25,  backgroundColor: '#000', borderWidth:1, borderRadius:10}}>
                    <Image
                        resizeMode={"cover"}
                        source={require("../assets/images/barbell-squad-800x400.png")}
                        style={{width: WIDTH, height: HEIGHT*.25, borderWidth:1, borderRadius:10,}}
                        alt={"Personal Training Squat Instruction"}
                    />
                </View>
                <View style={{ flexDirection:'row', backgroundColor: '#29282A'}}>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Trainer List Link Button'}
                        accessibilityRole={'link'}
                        onPress={() => this.props.navigation.navigate('TrainerList')}
                        style={styles.exploreButtons}
                    >
                        <Text style={styles.exploreButtonText}>Explore Trainers</Text>
                        <Ionicons
                            name={"ios-expand"}
                            size={28}
                            alt={"expand facility info"}
                            color={"white"}
                            style={{fontWeight: 'bold'}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Workouts Screen Link Button'}
                        accessibilityRole={'link'}
                        onPress={() => this.props.navigation.navigate('Workouts')}
                        style={styles.exploreButtons}
                    >
                        <Text style={styles.exploreButtonText}>Find a Workout</Text>
                        <Ionicons
                            name={"ios-expand"}
                            size={28}
                            alt={"expand facility info"}
                            color={"white"}
                            style={{fontWeight: 'bold'}}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{backgroundColor: '#29282A', paddingBottom: 30}}>
                    <View style={{display: 'flex', backgroundColor: '#29282A', alignItems:'center',borderWidth:1, borderColor:'#fff',marginBottom:5,}}>
                        <Text style={{marginTop: 5,  backgroundColor: '#29282A', color:"#fff", fontWeight:"bold", justifyContent:'center',
                            fontSize: 12, alignSelf:'center', padding: 5}}>
                            Programs
                        </Text>
                    </View>
                    <Query  query={GET_MEMBERSHIPS} >
                        {({loading, error, data, fetchMore}) => {
                            if (loading) {
                                return (
                                    <View style={{alignContent: 'center', justifyContent: 'center'}}>
                                        <ActivityIndicator color={"#fff"}/>
                                    </View>);
                            }
                            if (error) return <Text style={{textAlign:'center', fontWeight:'bold', color:'#fff', marginTop: 30}}>{error.message}</Text>;
                            return (
                                <View style={{borderBottomWidth:2, backgroundColor:'#fff', flexDirection:'row', flexWrap:'wrap', alignItems:'center', justifyContent:'space-around', }}>
                                    {data.allMemberships.map((obj, index) => (

                                        <TrainingMembership
                                            key={index}
                                            title={obj.title}
                                            memberRate={obj.rateMember}
                                            memberRateUnitPrice={obj.rateNonMember}
                                            registerUrl={obj.url}
                                        />

                                    ))}
                                    <View style={{width:WIDTH*.5, alignItems: 'center', }}>
                                        <Text style={{color:'#000', fontWeight:'bold', fontSize:12, marginBottom:5 }}>Request Info</Text>
                                        <TouchableOpacity
                                            accessible={true}
                                            accessibilityLabel={'Training Request Information Button'}
                                            accessibilityRole={'button'}
                                            onPress={() => {this.showPTInfoFormModal(true)}}
                                            style={{width:WIDTH*.25, borderRadius: 15,
                                                backgroundColor: "#931414", alignItems:'center'}}>

                                            <MaterialCommunityIcons
                                                name={"checkbox-marked-circle-outline"}
                                                size={18}
                                                color={"white"}
                                                alt={"Request Info checkbox-marked symbol"}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            );
                        }}
                    </Query>
                </ScrollView>
                <Modal
                    transparent={false}
                    animationType={"fade"}
                    visible={this.state.personalTrainingInfo}
                    onRequestClose={() => {this.showPTInfoFormModal(!this.state.personalTrainingInfo)} }
                >
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Close Training Program Request Information Button'}
                        accessibilityRole={'button'}
                        onPress={() => {this.showPTInfoFormModal(!this.state.personalTrainingInfo)}}
                        style={{marginLeft: 5, marginTop: 50, flexDirection: "row"}}
                    >
                        <Ionicons name={"md-arrow-back"} size={30} color={"#156DFA"} alt={'arrow symbol to go back to previous'}/>
                        <Text style={{color: "#156DFA", marginTop: 7, marginLeft: 8}}>Go Back</Text>
                    </TouchableOpacity>
                    <Query  query={GET_LINK}>
                        {({loading, error, data, fetchMore}) => {
                            if (loading) {
                                return (
                                    <View style={{alignContent: 'center', justifyContent: 'center'}}>
                                        <ActivityIndicator color={"#fff"}/>
                                    </View>);
                            }
                            if (error) return <Text>`Error! ${error.message}`</Text>;
                            return (
                                <WebView
                                    //source={{uri:"https://miamioh.qualtrics.com/jfe/form/SV_6ROkLdBRztSlYGN"}}
                                    source={{uri: data.Membership.url}}
                                    style={{flex: 1}}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                />
                            );
                        }}
                    </Query>
                </Modal>
            </View>
        );
    }
}

export default TrainerScreen;


const styles = StyleSheet.create({
    exploreButtons:{
        flex:2,
        flexDirection:"column",
        marginTop: 8,
        margin:6,
        padding:10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor:"#000",
        borderRadius: 15,
        backgroundColor: "#931414",
        height: 'auto',
        width: WIDTH*.45,
        alignSelf: "center"
    },
    exploreButtonText:{
        color: "#fff",
        fontSize: 16
    },
});