import { StyleSheet, View, Text } from 'react-native';


export default function Premier() {
  return (
    <View>
      <Text>Explore</Text>
      <Text>Explore</Text>
      <Text>Explore</Text>
      <Text>Explore</Text>
      <Text>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
