import React from 'react';
import {
    View, Text, Dimensions, Modal, StyleSheet, ActivityIndicator,
    TouchableOpacity, ScrollView, WebView, StatusBar,
} from 'react-native';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {Query} from 'react-apollo';
import gql from "graphql-tag";

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;


const GET_MEMBERSHIPS = gql`
    query($skipFF:Int, $skipGF:Int, $first:Int){
        ffOptions: allMemberships(
            filter:{
                type: "functional"
            }, orderBy: startBalance_ASC, skip:$skipFF){
            title
            type
            id
            startBalance
            rateMember
            rateNonMember
            url
        }
        gfOptions: allMemberships(
            filter:{
                type: "groupFit"
            }, orderBy: startBalance_ASC, skip:$skipGF, first:$first){
            title
            type
            id
            startBalance
            rateMember
            rateNonMember
            url
        }
    }  
`;

const GET_LINK = gql`
    query{
        Membership(id:"cjnwmhlwhmm580116ayr96ra1"){
            title
            type
            url
        }
    }
`;


class GroupFitMembership extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showGFRegisterModal: false
        }
    }
    showGFRegisterModal(visible){
        this.setState({showGFRegisterModal: visible})
    }
    render(){
        return(
            <View style={{alignItems:'center', borderBottomWidth:1}}>
                <View style={{marginTop: 18, marginLeft: 10}}>
                    <Text style={{color:"#000", fontWeight:"bold", fontSize: 16}}>{this.props.title}</Text>
                        {
                            this.props.memberRate
                            ?
                                <View style={{flexDirection: "row", marginTop: 5, justifyContent:'center'}}>
                                    <Text style={{color:"#535353", fontStyle:"italic", fontSize: 12}}>Member Rate: </Text>
                                    <Text style={{color:"#000", fontSize: 12}}>{this.props.memberRate}</Text>
                                </View>
                            :
                                null
                        }
                </View>
                {
                    this.props.registerUrl
                        ?
                        <TouchableOpacity
                            accessibilityLabel={"Program Register Button"}
                            accessibilityHint={"Opens a web page view to register for respective fitness program"}
                            accessibilityRole={"button"}
                            onPress={() => {this.showGFRegisterModal(true)}}
                            style={{marginTop: 5, marginLeft:10, marginBottom: 4, flexDirection: "row",
                                justifyContent: 'center', alignItems: 'center', borderRadius: 15,
                                backgroundColor: "#931414", width: "50%",
                            }}>
                            <Text style={{color: "#fff", fontSize: 11}}>Register</Text>
                            <MaterialCommunityIcons
                                accessibilityRole={'imagebutton'}
                                name={"checkbox-marked-circle-outline"}
                                size={18}
                                color={"white"}
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
                    visible={this.state.showGFRegisterModal}
                    onRequestClose={() => {this.showGFRegisterModal(!this.state.showGFRegisterModal)} }
                >
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Close Button'}
                        accessibilityHint={'Closes the window from the web page opened to register for fitness program'}
                        accessibilityRole={'button'}
                        onPress={() => {this.showGFRegisterModal(!this.state.showGFRegisterModal)}}
                        style={{marginLeft: 5, marginTop: 50, flexDirection: "row"}}>
                        <Ionicons name={"md-arrow-back"} size={30} color={"#156DFA"}/>
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

class GroupFitProgramsScreen extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            showGFPrivateClassModal: false
        }
    }
    showPrivateClassModal(visible){
        this.setState({showGFPrivateClassModal: visible})
    }
    render(){
        return(
            <View style={{flex:1, backgroundColor: "#fff", marginTop: 0}}>
                <StatusBar/>
                <ScrollView style={{marginBottom: 20}}>
                    <Query  query={GET_MEMBERSHIPS} variables={{skipFF:1, skipGF:1, first:2}}>
                        {({loading, error, data, fetchMore}) => {
                            if (loading) {
                                return (
                                    <View style={{alignContent: 'center', justifyContent: 'center'}}>
                                        <ActivityIndicator color={"#fff"}/>
                                    </View>);
                            }
                            if (error) return <Text>`Error! ${error.message}`</Text>;
                            return (
                                <View>
                                    {data.gfOptions.map((obj, index) => (
                                        <GroupFitMembership
                                            key={obj.id}
                                            title={obj.title}
                                            memberRate={obj.rateMember}
                                            registerUrl={obj.url}
                                        />
                                    ))}

                                </View>
                            );
                        }}
                    </Query>
                    <View style={{display: 'flex', flexDirection: 'row', backgroundColor: '#29282A'}}>
                        <MaterialCommunityIcons
                            accessibilityRole={'image'}
                            name={"dumbbell"}
                            size={30}
                            color={"white"}
                            style={{paddingLeft: 20, paddingRight: 5, paddingTop:2}}
                        />
                    <Text style={{marginTop: 5, paddingRight: 20, backgroundColor: '#29282A', color:"#fff", fontWeight:"bold", width: WIDTH, justifyContent:'center',
                        fontSize: 18, alignSelf:'center', padding: 5,}}>
                          groupFit
                    </Text>
                    </View>
                    <Query  query={GET_MEMBERSHIPS} variables={{skipFF:1, skipGF:3}}>
                        {({loading, error, data, fetchMore}) => {
                            if (loading) {
                                return (
                                    <View style={{alignContent: 'center', justifyContent: 'center'}}>
                                        <ActivityIndicator color={"#fff"}/>
                                    </View>);
                            }
                            if (error) return <Text>`Error! ${error.message}`</Text>;
                            return (
                                <View>
                                    {data.gfOptions.map((obj, index) => (
                                        <GroupFitMembership
                                            key={obj.id}
                                            title={obj.title}
                                            memberRate={obj.rateMember}
                                            registerUrl={obj.url}
                                        />
                                    ))}

                                </View>
                            );
                        }}
                    </Query>
                    <View style={{display: 'flex', flexDirection: 'row', backgroundColor: '#29282A'}}>
                        <MaterialCommunityIcons
                            accessibilityRole={'image'}
                            name={"weight"}
                            size={30}
                            color={"white"}
                            style={{paddingLeft: 20, paddingRight: 5, paddingTop: 2}}
                        />
                        <Text style={{marginTop: 5, paddingRight: 20, color:"#fff", fontWeight:"bold",  justifyContent:'center',
                            fontSize: 18, alignSelf:'center', padding: 5,
                        }}>functionalFit</Text>
                    </View>
                    <Query  query={GET_MEMBERSHIPS} variables={{skipFF:0, skipGF:3}}>
                        {({loading, error, data, fetchMore}) => {
                            if (loading) {
                                return (
                                    <View style={{alignContent: 'center', justifyContent: 'center'}}>
                                        <ActivityIndicator color={"#fff"}/>
                                    </View>);
                            }
                            if (error) return <Text>`Error! ${error.message}`</Text>;
                            return (
                                <View>
                                    {data.ffOptions.map((obj, index) => (
                                        <GroupFitMembership
                                            key={obj.id}
                                            title={obj.title}
                                            memberRate={obj.rateMember}
                                            registerUrl={obj.url}
                                        />
                                    ))}

                                </View>
                            );
                        }}
                    </Query>
                    <View style={{display: 'flex', flexDirection: 'row', backgroundColor: '#29282A'}}>
                        <MaterialCommunityIcons
                            accessibilityRole={'image'}
                            name={"calendar-check"}
                            size={30}
                            color={"white"}
                            style={{paddingLeft: 20, paddingRight: 5, paddingTop:2}}
                        />
                        <Text style={{marginTop: 5, paddingRight: 20, backgroundColor: '#29282A', color:"#fff", fontWeight:"bold", width: WIDTH, justifyContent:'center',
                            fontSize: 18, alignSelf:'center', padding: 5,}}>
                            Private Classes
                        </Text>
                    </View>
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Request a Private Fitness Class Button'}
                        accessibilityHint={'Opens a new window to complete form requesting a private fitness class'}
                        accessibilityRole={'button'}
                        onPress={() => {this.showPrivateClassModal(true)}}
                        style={styles.exploreButtons}>
                        <Text style={styles.exploreButtonText}>Request A Class</Text>
                        <MaterialCommunityIcons
                            accessibilityRole={'imagebutton'}
                            name={"checkbox-marked-circle-outline"}
                            size={35}
                            color={"white"}
                        />
                    </TouchableOpacity>
                </ScrollView>
                <Modal
                    transparent={false}
                    animationType={"fade"}
                    visible={this.state.showGFPrivateClassModal}
                    onRequestClose={() => {this.showPrivateClassModal(!this.state.showGFPrivateClassModal)} }
                >
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Close Private Fitness Class Button'}
                        accessibilityHint={'Closes window to complete form requesting a private fitness class'}
                        accessibilityRole={'button'}
                        onPress={() => {this.showPrivateClassModal(!this.state.showGFPrivateClassModal)}}
                        style={{marginLeft: 5, marginTop: 50, flexDirection: "row"}}>
                        <Ionicons name={"md-arrow-back"} size={30} color={"#156DFA"}/>
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
                                    source={{uri: data.Membership.url}}
                                    style={{flex: 1}}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                />
                            );
                        }}
                    </Query>
                    {/*<WebView*/}
                        {/*source={{uri:"https://miamioh.formstack.com/forms/on_demand_group_fitness_class_request"}}*/}
                        {/*style={{flex: 1}}*/}
                        {/*javaScriptEnabled={true}*/}
                        {/*domStorageEnabled={true}*/}
                    {/*/>*/}
                </Modal>

            </View>
        )
    }
}

export default GroupFitProgramsScreen;

const styles = StyleSheet.create({

    exploreButtons:{
        flexDirection:"row",
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor:"#000",
        borderRadius: 15,
        backgroundColor: "#931414",
        height: 'auto',
        padding:5,
        width: "auto",
        alignSelf: "center"
    },

    exploreButtonText:{
        color: "#fff",
        fontSize: 16
    },


});