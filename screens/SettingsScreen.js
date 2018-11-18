import React from 'react'
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, ScrollView} from 'react-native';
import {Ionicons, AntDesign, Entypo} from '@expo/vector-icons';
import Logout from '../components/Logout';

const WIDTH=Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;


class SettingsScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={
            showHelpModal: false,
        };
    }
    helpModalToggle(visible){
        this.setState({showHelpModal: visible})
    }
    render(){
        return(

            <View style={styles.container}>
                <View style={styles.boxOutter}>
                    <Text style={styles.headText}>Profile</Text>
                    <View style={styles.boxInner}>
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Profile Screen Link Button'}
                            accessibilityHint={'Links to new Profile Screen'}
                            accessibilityRole={'link'}
                            onPress={() => this.props.navigation.navigate('Profile')}
                        >
                            <Ionicons name={"md-person"} type={"Ionicons"} size={100}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.boxOutter}>
                    <Text style={styles.headText}>Help</Text>
                    <View style={styles.boxInner}>
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Help Screen Button'}
                            accessibilityHint={'Opens modal window with Help screen'}
                            accessibilityRole={'button'}
                            onPress={() => {
                                this.helpModalToggle(true)
                            }}
                        >
                            <Entypo name={"help-with-circle"} type={"Entypo"} size={90}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.boxOutter}>
                    <Text style={styles.headText}>Privacy/Terms</Text>
                    <View style={styles.boxInner}>
                        <TouchableOpacity
                            accessible={true}
                            accessibilityLabel={'Terms Link Button'}
                            accessibilityHint={'Links to the Terms and Privacy Screen'}
                            accessibilityRole={'link'}
                            onPress={() => this.props.navigation.navigate('Terms')}
                        >
                            <Entypo name={"text-document-inverted"} type={"Ionicons"} size={90}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.boxOutter}>
                    <Text style={styles.headText}>Logout</Text>
                    <View style={styles.boxInner}>
                        <Logout>
                            <AntDesign name={"logout"} type={"AntDesign"} size={76}/>
                        </Logout>

                    </View>
                </View>
                <Modal
                    transparent={false}
                    animationType={"none"}
                    visible={this.state.showHelpModal}
                    onRequestClose={() => {
                        this.helpModalToggle(!this.state.showHelpModal)
                    }}
                >
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel={'Close Help Window Button'}
                        accessibilityHint={'Closes the Help modal window'}
                        accessibilityRole={'button'}
                        onPress={() => {
                            this.helpModalToggle(false)
                        }}
                        style={{marginLeft: 5, marginTop: 50, flexDirection: "row", backgroundColor: 'transparent'}}
                    >
                        <Ionicons name={"md-arrow-back"} size={30} color={"#156DFA"}/>
                        <Text style={{color: "#156DFA", marginTop: 7, marginLeft: 8}}>Go Back</Text>
                    </TouchableOpacity>
                    <ScrollView  contentContainerStyle={{alignItems:'center', justifyContent: 'center',}} style={{marginTop: 5,  textAlign:'center', alignContent:"center"}}>
                        <Text style={{marginTop: 45, fontWeight:'bold', fontSize: 18, textAlign: 'center'}}>Help</Text>
                        <View style={{alignItems:'center', justifyContent: 'center', textAlign:'center', marginTop: 30, padding: 10}}>
                            <Text style={styles.boldQ}>If you forgot your password... </Text>
                            <Text>For Assistance email [ JeffreyMolter@gmail.com ]</Text>
                        </View>
                        <View style={{alignItems:'center', justifyContent: 'center', textAlign:'center', marginTop: 30, padding: 10}}>
                            <Text style={styles.boldQ}>If you have any problems with the application... </Text>
                            <Text>For Assistance email [ JeffreyMolter@gmail.com ]</Text>
                        </View>
                        <View style={{alignItems:'center', justifyContent: 'center', textAlign:'center', marginTop: 30, padding: 10}}>
                            <Text style={styles.boldQ}>Why can't I check-in to a class successfully?</Text>
                            <Text>There are few rules to follow in-order to successfully check-in. First, you may only check-in if the time for the respective class is within a 20 minute window from the start of the class time. Second, you may only check-in if you have enabled your location services for this app. To be successful, you must be within the Miami University Rec Center building.</Text>
                        </View>
                        <View style={{alignItems:'center', justifyContent: 'center', textAlign:'center', marginTop: 30, padding: 10}}>
                            <Text>If you would like to get involved in any Fitness programs... </Text>
                            <View style={{alignItems:'center', justifyContent: 'center', textAlign:'center', marginTop: 10, padding: 10}}>
                                <Text style={{fontWeight:'bold'}}>Personal Training</Text>
                                <Text>[ molterjt@MiamiOH.edu ]</Text>
                                <Text>(513) 529-8175</Text>
                            </View>
                            <View style={{alignItems:'center', justifyContent: 'center', textAlign:'center', marginTop: 10, padding: 10}}>
                                <Text style={{fontWeight:'bold'}}>Group Fitness</Text>
                                <Text>[ speeds@MiamiOH.edu ]</Text>
                                <Text>(513) 529-2193</Text>
                            </View>
                            <View style={{alignItems:'center', justifyContent: 'center', textAlign:'center', marginTop: 10, padding: 10}}>
                                <Text style={{fontWeight:'bold'}}>Functional Fitness</Text>
                                <Text>[ cropensw@MiamiOH.edu ]</Text>
                                <Text>(513) 529-6007</Text>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>
            </View>

        );
    }
}

export default SettingsScreen;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        display: 'flex',
        alignContent:'center',
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap:'wrap',
        //backgroundColor: '#931414',
    },
    boxOutter:{

        backgroundColor: '#931414',
        justifyContent:'space-between',
        alignItems:'center',
        margin: 6,
        width: WIDTH*.34,
        height: WIDTH*.33,
        borderColor:'#000',
        borderWidth: 1,
        borderRadius: 30
    },
    boxInner:{
        backgroundColor: '#fff',
        justifyContent:'space-between',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        margin: 2,
        width: WIDTH*.3,
        height: WIDTH*.24,
        borderColor:'#000',
        borderWidth: 1,
        borderRadius: 30
    },
    headText:{
        marginTop: 5,
        fontWeight: 'bold',
        fontSize: 15,
        color: '#fff',
    },
    boldQ:{
        fontWeight:'bold',
        marginVertical:6,
    }
});