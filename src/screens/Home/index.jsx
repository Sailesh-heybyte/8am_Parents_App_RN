import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../api/auth';
import { colors } from '../../styles';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const [name, setName] = useState('');

  useEffect(() => {
    getMe()
      .then(me => setName(me.fullName))
      .catch(() => setName(''));
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <AppText variant="greeting">Home</AppText>
        <AppText variant="bodySecondary" style={styles.text}>
          {name ? `Hello, ${name}` : 'Loading...'}
        </AppText>
        <AppButton title="Logout" onPress={signOut} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    marginTop: 8,
  },
  button: {
    marginTop: 24,
  },
});
