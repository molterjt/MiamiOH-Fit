import React from 'react';
import { Platform,Dimensions } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { Ionicons, MaterialCommunityIcons, AntDesign} from '@expo/vector-icons';


import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TrainingListScreen from '../screens/TrainerListScreen';
import TrainerScreen from "../screens/TrainerScreen";
import WorkoutScreen from '../screens/WorkoutScreen';
import ExerciseDetail from '../screens/ExerciseDetail';
import SubmitWorkoutScreen from '../screens/SubmitWorkoutScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditScreen from '../screens/EditProfileScreen';
import InstructorScreen from '../screens/InstructorScreen';
import SingleClassDetailScreen from '../screens/SingleClassDetailScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import GroupFitProgramsScreen from '../screens/GroupFitProgramsScreen';
import EventsScreen from '../screens/EventsScreen';
import FacilitiesScreen from '../screens/FacilitiesScreen';
import TermsScreen from '../screens/TermsScreen';
import UserCheckinHistory from '../screens/UserCheckinHistory';
import IntroScreen from '../screens/IntroScreen';

const W = Dimensions.get('window').width;
const H = Dimensions.get('window').height;

const HomeStack = createStackNavigator({
        Home: {
            screen: HomeScreen,
            navigationOptions:{
                title: 'MiamiOH Fit',
                headerTitleStyle: {
                    fontFamily: 'StardosStencil-Regular',
                    fontSize: (Platform.isPad ? W/20 :28),
                    // color:'#931414',
                    color:'#000',
                    textAlign:'center',
                    flex:1
                },
            },
        },
        Settings: {
            screen: SettingsScreen,
            navigationOptions:{
                title: 'Settings',
                headerTitleStyle: {
                    fontSize: (Platform.isPad ? W/40 :18),
                },
                headerStyle:{
                    backgroundColor: "#fff"
                }
            }
        },
        Profile: {
            screen: ProfileScreen,
            path: '/Profile',
            navigationOptions:{
                title: 'Profile',
                headerTitleStyle: {
                    fontSize: (Platform.isPad ? W/40 :18),
                },
                headerStyle:{
                    backgroundColor: "#fff"
                }
            },
        },
        Edit: {
            screen: EditScreen,
            path: '/profile',
            navigationOptions:{
                title: 'Edit Profile',
                headerTitleStyle: {
                    fontSize: (Platform.isPad ? W/40 :18),
                },
                headerStyle:{
                    backgroundColor: "#fff"
                }
            },
        },
        CheckinHistory:{
            screen: UserCheckinHistory,
            path:'/profile/',
            navigationOptions:{
                headerStyle:{
                    backgroundColor: "#fff"
                }
            }
        },

        Terms: {
            screen: TermsScreen,
            navigationOptions:{
                title: 'Privacy & Terms of Use',
                headerStyle:{
                    backgroundColor: "#fff"
                }
            },
        },
        Workouts: {
            screen: WorkoutScreen,
            path: '/workouts',
            navigationOptions:{
                headerStyle:{
                    backgroundColor: "#fff"
                }
            },
        },
        SubmitWorkout:{
            screen: SubmitWorkoutScreen,
            path:'/workouts/submitWorkout',
            navigationOptions:{
                headerStyle:{
                    backgroundColor: "#fff"
                }
            }
        },
        ExerciseDetail: {
            screen: ExerciseDetail,
            path:'/workouts/exercise',
            navigationOptions:{
                headerStyle:{
                    backgroundColor: "#fff"
                }
            }
        },
        Intro:{
            screen: IntroScreen,
            navigationOptions:{
                header: null,
            }
        },
    },
    {initialRouteName: 'Home'},
);


const FacilityStack = createStackNavigator(
    {
        Facility: {
            screen: FacilitiesScreen,
            path: '/',
            navigationOptions:{
                header: null,
                headerStyle:{
                    backgroundColor: "#ebebeb"
                }
            },
        },
    }
);

const GFStack = createStackNavigator(
    {
        Schedule: {
            screen: ScheduleScreen,
            path: '/',
            navigationOptions:{
                title: 'Fitness Schedule',
                headerTitleStyle: {
                    fontSize: (Platform.isPad ? W/40 :18),
                },
                headerStyle:{
                    backgroundColor: "#fff"
                }
            },
        },
        GroupFitPrograms:{
            screen: GroupFitProgramsScreen,
            path: '/groupFitProgramsScreen',
            navigationOptions:{
                title: 'Group Fitness Programs',
                headerTitleStyle: {
                    fontSize: (Platform.isPad ? W/40 :18),
                },
                headerStyle:{
                    backgroundColor: "#fff"
                }
            }
        },
        ClassDetail: {
            screen: SingleClassDetailScreen,
            navigationOptions:{
                headerStyle:{
                    backgroundColor: "#fff"
                }
            }
        },
        Instructor:{
            screen: InstructorScreen,
            navigationOptions:{
                headerStyle:{
                    backgroundColor: "#fff"
                }
            }
        },
    }
);
const EventStack = createStackNavigator(
    {
        Events: {
            screen: EventsScreen,
            path: '/Events',
            navigationOptions:{
                title: 'Events',
                headerTitleStyle: {
                    fontSize: (Platform.isPad ? W/40 :18),
                },
                headerStyle:{
                    backgroundColor: "#fff"
                }
            },
        },
    }
);

const PersonalFITStack = createStackNavigator({

    Trainer:{
        screen: TrainerScreen,
            navigationOptions:{
            headerStyle:{
                backgroundColor: "#fff"
            }

        },
    },
    TrainerList: {
        screen: TrainingListScreen,
            path: '/trainers',
            navigationOptions:{
            headerStyle:{
                backgroundColor: "#fff"
            }

        },
    },

    Workouts: {
        screen: WorkoutScreen,
            path: '/workouts',
            navigationOptions:{
            headerStyle: {
                backgroundColor: "#fff"
            }
        },
    },
    ExerciseDetail: {
        screen: ExerciseDetail,
            path:'/workouts/exercise',
    },
    SubmitWorkout:{
        screen: SubmitWorkoutScreen
    }

});


export default createBottomTabNavigator({
        HomePage: {
            screen: HomeStack,
            navigationOptions: {
                tabBarLabel: 'Home',
                tabBarIcon: ({tintColor}) => <MaterialCommunityIcons
                    name={"home-outline"}
                    type={"materialCommunityIcon"}
                    size={30}
                    color={tintColor}
                />
            },
            showLabel:false,
            initialRouteName: 'Home',

        },
        SchedulePage: {
            screen: GFStack,
            navigationOptions: {
                tabBarLabel: 'Schedule',
                tabBarIcon: ({tintColor}) => <Ionicons
                    name={"ios-list"}
                    type={"ionicon"}
                    size={30}
                    color={tintColor}
                />
            }
        },
        TrainerPage: {
            screen: PersonalFITStack,
            navigationOptions: {
                tabBarLabel: 'Training',
                tabBarIcon: ({tintColor}) => <Ionicons
                    name={"ios-fitness"}
                    type={"ionicon"}
                    size={30}
                    color={tintColor}

                />,

            }
        },
        FacilityPage: {
            screen: FacilityStack,
            navigationOptions: {
                tabBarLabel: 'Facilities',
                tabBarIcon: ({tintColor}) => <MaterialCommunityIcons
                    name={"map-search-outline"}
                    type={"materialCommunityIcon"}
                    size={30}
                    color={tintColor}
                />
            }
        },
        EventPage: {
            screen: EventStack,
            navigationOptions: {
                tabBarLabel: 'Events',
                tabBarIcon: ({tintColor}) => <AntDesign
                    name={"calendar"}
                    type={"antDesign"}
                    size={30}
                    color={tintColor}
                />
            }
        },

},
    {
        tabBarPosition: 'bottom',
        tabBarOptions: {
            activeTintColor: 'red',
            inactiveTintColor: 'white',
            showLabel:(!Platform.isPad),
            style: {
                backgroundColor: '#29282A',
                paddingBottom: 4,
                height: (Platform.isPad ? H*.06 :55),
                width: W,

            },
        },
        animationEnabled: false,
        swipeEnabled: false,


});
