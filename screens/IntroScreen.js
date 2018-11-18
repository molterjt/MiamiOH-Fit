import {Animated, View, ImageBackground, Dimensions, TouchableOpacity} from "react-native";
import React from "react";
import {withNavigation} from 'react-navigation';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import {graphql} from 'react-apollo';

const SCREEN_WIDTH = Dimensions.get("window").width;



class IntroScreen extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            springVal: new Animated.Value(0.8),
            fadeVal: new Animated.Value(1),
        };
    }
    componentDidMount(){
        setTimeout( () => this.spring(), 800);
    }
    spring(){
        Animated.sequence([
            Animated.spring(this.state.springVal, {
                toValue: 0.5,
                friction: 15,
                tension: 60
            }),
            Animated.parallel([
                Animated.spring(this.state.springVal, {
                    toValue: 17.5,
                    friction: 22,
                    tension: 5
                }),
                Animated.timing(this.state.fadeVal, {
                    toValue: 0,
                    duration: 250
                })
            ])
        ]).start( () => this.props.navigation.navigate('Home'));
    }
    render(){

        return(
                <View style={{height:"100%", width: '100%',
                    alignItems: "center", justifyContent:"center", backgroundColor: "#fff"}}>

                    <Animated.View
                        style={{
                            opacity: this.state.fadeVal,
                            transform: [{scale: this.state.springVal }]
                        }}>
                        <Animated.Image
                            style={{
                                width: 150,
                                height: 150,
                                // transform: [{rotate: spin}]
                            }}
                            source={require('../assets/images/MiamiFitnessSplash.png')}
                        />
                    </Animated.View>
                </View>
        );
    }
}


class IntroView extends React.Component{
    render(){
        return(
            <IntroScreen navigation = {this.props.navigation}/>
        );
    }
}

export default withNavigation(IntroView);