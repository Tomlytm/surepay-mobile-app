import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  titleStyle?: object;
  actions?: ReactNode;
  backgroundColor?: string;
  showBack?: boolean;
  onBackPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  titleStyle,
  actions,
  backgroundColor = '#fff',
  showBack = false,
  onBackPress
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { backgroundColor }]}>
      {/* Status bar background */}
      <View style={[styles.statusBarBackground, { height: insets.top, backgroundColor }]} />
      
      <Appbar.Header style={[styles.header, { backgroundColor }]}>
        {showBack && (
          <Appbar.BackAction onPress={onBackPress} />
        )}
        <Appbar.Content 
          title={title} 
          titleStyle={[styles.defaultTitleStyle, titleStyle]} 
          style={{ alignItems: showBack ? 'center' : 'flex-start' }} 
        />
        {actions && (
          <View style={styles.actionsContainer}>
            {actions}
          </View>
        )}
      </Appbar.Header>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 1000,
  },
  statusBarBackground: {
    width: '100%',
  },
  header: {
    justifyContent: 'space-between',
    borderBottomColor: '#E5E5E5',
    paddingRight: 15,
    borderBottomWidth: 0.5,
    // elevation: 1,
    shadowColor: '#E5E5E5',
  },
  defaultTitleStyle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'InstrumentSansBold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});