import { StyleSheet, View, Text } from 'react-native';


export default function More() {
    return (
        <View>
            <Text style={{ fontSize: 24, fontWeight: 600 }}>Settings</Text>
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
