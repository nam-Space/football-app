
import { getVideos } from '@/utils/api';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, View, Text } from 'react-native';


export default function HomeScreen() {
  // const [videos, setVideos] = useState([])

  // useEffect(() => {
  //   const fetchRestaurants = async () => {
  //     const res = await getVideos();
  //     setVideos(res)
  //   }
  //   fetchRestaurants();
  // }, []);

  return (
    <View>
      {/* {videos?.map((video, index) => (
        <Text key={index}>{video.title}</Text>
      ))} */}
      <Text>Home</Text>
      <Text>Home</Text>
      <Text>Home</Text>
      <Text>Home</Text>
      <Text>Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
