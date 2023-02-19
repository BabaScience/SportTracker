import React, { useState, useEffect, useContext } from 'react';
import { View, Alert, SafeAreaView, Text, Button, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import PushNotification, { PushNotificationObject } from 'react-native-push-notification';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen"
import NavigationBar from 'react-native-navigation-bar-color';
import RNFS from 'react-native-fs';
import { Sun1, Moon } from 'iconsax-react-native';

import { ThemeProvider } from "./contexts/themeContext";
import ThemeContext from "./contexts/themeContext";

import { lightTheme, darkTheme } from './themes';

// Create a channel for the notifications
PushNotification.createChannel(
  {
    channelId: 'my-channel-id', // This ID is used when showing the notification
    channelName: 'My Channel Name', // Name of the channel
    channelDescription: 'My Channel Description', // Description of the channel
    importance: 4, // Importance level of the notifications (0 to 4)
    vibrate: true, // Whether to vibrate the device on notification
  },
  (created: boolean) => console.log(`Channel created: ${created}`) // Callback function when channel is created
);



const Timer = () => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lastTimer, setLastTimer] = useState<number | null>(null);
  const { currentTheme, theme, toggleTheme } = useContext(ThemeContext);

  useEffect(()=>{
    StatusBar.setBackgroundColor(colors.primary);
    StatusBar.setBarStyle("light-content");
    NavigationBar(colors.primary);
  }, [])
  
  useEffect(() => {
    let interval: number | null = null;

    if (isActive && !isPaused) {
      interval = BackgroundTimer.setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else {
      BackgroundTimer.clearInterval(interval);
    }

    return () => {
      BackgroundTimer.clearInterval(interval as number);
    };
  }, [isActive, isPaused]);
  
  const handleStart = () => {
    const sound = new Sound("audio_part1.mp3", Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      setIsActive(true);
      setIsPaused(false);
      sound.play((success)=>{
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      })
    });
    
  };

  const handlePause = () => {
    // setIsActive(false);
    setIsPaused(true);
    const sound = new Sound("audio_part1.mp3", Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      setIsPaused(true);
      sound.play((success)=>{
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      })
    });
  };

  /* const handleReset = () => {
    const sound = new Sound("audio_part2.mp3", Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      setLastTimer(seconds);
      setSeconds(0);
      setIsActive(false);
      setIsPaused(false);
      sound.play((success)=>{
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      })
    });
    
    PushNotification.localNotification({
      channelId: 'my-channel-id',
      title: 'Last Timer',
      message: `Your last timer is ${formatTime(seconds)}.`,
    });
  }; */

  const handleReset = (): void => {
    const sound = new Sound("audio_part2.mp3", Sound.MAIN_BUNDLE, (error?: Error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      setLastTimer(seconds);
      setSeconds(0);
      setIsActive(false);
      setIsPaused(false);
      sound.play((success: boolean) => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
      const today = new Date();
      const data = { date: today.toISOString(), duration: seconds };
      let savedData: { date: string; duration: number; }[] = [];
      const filePath = `${RNFS.DocumentDirectoryPath}/savedData.json`;
      RNFS.exists(filePath)
        .then((exists) => {
          if (exists) {
            return RNFS.readFile(filePath);
          } else {
            return '[]';
          }
        })
        .then((contents) => {
          savedData = JSON.parse(contents);
          const newData = [...savedData.filter((d) => {
            const date = new Date(d.date);
            return (today.getTime() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
          }), data];
          if (newData.length > savedData.length) {
            Alert.alert(
              'Save Data',
              'Do you want to save the this data as Today Timer Data?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'OK',
                  onPress: () => {
                    const json = JSON.stringify(newData);
                    RNFS.writeFile(filePath, json, 'utf8')
                      .then(() => console.log('Saved data to file'))
                      .catch((err) => console.log(err.message));
                  }
                }
              ]
            );
          }
        })
        .catch((err) => console.log(err.message));
    });
  };
  
  

  
  const formatTime =(seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${formattedMins}:${formattedSecs}`;
  }
  

  return (
    
      <SafeAreaView style={{
        ...styles.screen,
        backgroundColor: theme == "light"? "white": currentTheme.primary
        }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sport Tracker</Text>
          <TouchableOpacity onPress={toggleTheme}>
            { theme === 'dark' && <Sun1 size={wp("8%")} color={colors.secondary} variant="Bold"/>}
            { theme === 'light' && <Moon size={wp("8%")} color={colors.secondary} variant="Bold"/>}
          </TouchableOpacity>
        </View>
        <View style={styles.timing}>
          <View style={styles.timingCircle}>
            <LinearGradient
              colors={['transparent','#00DBF6']}
              start={{ x: 0.4, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                borderRadius: wp(widths.outterCicle),
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <View style={{
                width: wp(widths.innerCicle),
                height: wp(widths.innerCicle),
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme === "light" ? "white": colors.primary,
                borderRadius: wp(widths.innerCicle),
              }}>
                <Text style={styles.timingTime}>{formatTime(seconds)}</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
        <View style={styles.buttons}>
          {!isActive && <TouchableOpacity 
            style={styles.largeButton}
            onPress={handleStart}
          >
            <Text style={styles.buttonTitle}>
              Start
            </Text>
          </TouchableOpacity>}
          {
            isActive &&  
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: wp("80%")
            }}>
              <TouchableOpacity 
                style={styles.smallButton}
                onPress={isPaused ? handleStart :handlePause}
              >
                <Text style={styles.buttonTitle}>
                  {isPaused ? "Play": "Pause"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{
                  ...styles.smallButton,
                  backgroundColor: colors.danger,
                }}
                onPress={handleReset}
              >
                <Text style={styles.buttonTitle}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          }
        </View>
        {/* {lastTimer !== null && <Text>Last Timer: {lastTimer} seconds</Text>} */}
      </SafeAreaView>
  );
};

const colors = {
  primary: "#121623",
  secondary: "#00DBF6",
  danger: "#B61C1D"
}

const widths = {
  outterCicle: "60%",
  innerCicle: "58%"
}


const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#121623",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: hp("10%"),
    width: wp("90%"),
    alignSelf: "center"

  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 20,
    color: colors.secondary,
  },
  timing: {
    height: hp("70%"),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  timingCircle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: wp(widths.outterCicle),
    height: wp(widths.outterCicle),
    backgroundColor: "transparent",
  },
  timingTime: {
    color: colors.secondary,
    fontSize: 50
  },
  buttons: {
    height: hp("20%"),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  largeButton: {
    backgroundColor: colors.secondary,
    width: wp("80%"),
    paddingTop: hp("1.5%"),
    paddingBottom: hp("1.5%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2
  },
  smallButton: {
    backgroundColor: colors.secondary,
    width: wp("35%"),
    paddingTop: hp("1.5%"),
    paddingBottom: hp("1.5%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2
  },
  buttonTitle: {
    color: "white"
  }
})



export default Timer;