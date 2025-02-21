import { StyleSheet, View, Text } from 'react-native';


export default function Stats() {
    return (
        <View>
            <Text>Stats</Text>
            <Text>Stats</Text>
            <Text>Stats</Text>
            <Text>Stats</Text>
            <Text>Stats</Text>
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
