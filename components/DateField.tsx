import React, { useState, useRef } from 'react';
import {
  Animated,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const MonthYearPicker: React.FC<Props> = ({ value, onChange }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const months = monthNames;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear + i).toString());

  const [show, setShow] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  const monthScrollY = useRef(new Animated.Value(0)).current;
  const yearScrollY = useRef(new Animated.Value(0)).current;

  const monthScrollRef = useRef<ScrollView>(null!);
  const yearScrollRef = useRef<ScrollView>(null!);

  const onScrollEnd = (
    yOffset: number,
    data: string[],
    setValue: (val: string) => void
  ) => {
    const index = Math.round(yOffset / ITEM_HEIGHT);
    setValue(data[index]);
  };

  const renderScrollPicker = (
    data: string[],
    selectedValue: string,
    setValue: (val: string) => void,
    scrollY: Animated.Value,
    ref: React.RefObject<ScrollView>
  ) => {
    return (
      <Animated.ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          onScrollEnd(e.nativeEvent.contentOffset.y, data, setValue)
        }
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
      >
        {data.map((item, index) => {
          const inputRange = [
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
            (index + 2) * ITEM_HEIGHT,
          ];

          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.6, 0.8, 1, 0.8, 0.6],
            extrapolate: 'clamp',
          });

          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.3, 0.6, 1, 0.6, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={item}
              style={[styles.item, { transform: [{ scale }], opacity }]}
            >
              <Text style={styles.itemText}>{item}</Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    );
  };

  const handleDone = () => {
    const monthNumber = String(months.indexOf(selectedMonth) + 1).padStart(2, '0');
    onChange(`${monthNumber} / ${selectedYear}`);
    setShow(false);
  };

  const openPicker = () => {
    setShow(true);
    setTimeout(() => {
      const monthIndex = months.indexOf(selectedMonth);
      const yearIndex = years.indexOf(selectedYear);

      monthScrollRef.current?.scrollTo({
        y: monthIndex * ITEM_HEIGHT,
        animated: false,
      });
      yearScrollRef.current?.scrollTo({
        y: yearIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.input}
        onPress={openPicker}
      >
        <Text style={{ color: value ? '#000' : '#999', fontFamily: 'InstrumentSans' }}>
          {value || 'MM / YYYY'}
        </Text>
      </TouchableOpacity>

      <Modal visible={show} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Select Card Expiry Date</Text>
            <View style={styles.pickerWrapper}>
              {renderScrollPicker(months, selectedMonth, setSelectedMonth, monthScrollY, monthScrollRef)}
              {renderScrollPicker(years, selectedYear, setSelectedYear, yearScrollY, yearScrollRef)}
            </View>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MonthYearPicker;

const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    paddingVertical: 19,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#94BDFF',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontFamily: 'InstrumentSans',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'InstrumentSansSemiBold',
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 30,
    color: '#333',
    fontFamily: 'InstrumentSansSemiBold', // replace if not available
  },
  doneButton: {
    marginTop: 24,
    backgroundColor: '#7C9AFE',
    padding: 15,
    fontFamily: 'InstrumentSansBold',
    borderRadius: 35,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
