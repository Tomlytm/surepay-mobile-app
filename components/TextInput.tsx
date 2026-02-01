import React from 'react';
import { TextInput } from 'react-native-paper';

interface DynamicTextInputProps {
  label: any;
  value: string;
  onChangeText?: (text: string) => void;
  inputType?: 'text' | 'password' | 'email' | 'phone' | 'numeric'; // Type to toggle between text and password
  secureTextEntry?: boolean; // Allow manual control of secure text entry
  themeColors?: {
    primary: string;
    text: string;
    placeholder: string;
  };
  customStyle?: object;
}

const DynamicTextInput: React.FC<DynamicTextInputProps> = ({
  label,
  value,
  onChangeText,
  inputType = 'text', // Default to text
  secureTextEntry = false, // Default to false, can be controlled via prop
  themeColors = {
    primary: '#EF8B09',
    text: '#EF8B09',
    placeholder: '#959595',
  },
  customStyle = {},
}) => {
  const [secureText, setSecureText] = React.useState(secureTextEntry);

  // Toggle between text and password types if inputType is password
  const handleSecureTextToggle = () => {
    if (inputType === 'password') {
      setSecureText(!secureText);
    }
  };

  return (
    <TextInput
      mode="flat"
      label={typeof label === 'string' ? label : ''}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureText && inputType === 'password'} // Use secureText state if it's a password field
      keyboardType={inputType === 'numeric' ? 'numeric' : inputType === 'email' ? 'email-address' : inputType === 'phone' ? 'phone-pad' : 'default'}
      right={
        inputType === 'password' ? (
          <TextInput.Icon
            color={themeColors.primary}
            icon={secureText ? "eye-off" : "eye"}
            onPress={handleSecureTextToggle}
          />
        ) : null
      }
      theme={{
        colors: {
          primary: themeColors.primary,
          text: themeColors.text,
          placeholder: themeColors.placeholder,
        },
        roundness: 10,
        fonts: {
          regular: { fontFamily: 'InstrumentSans' },
        },
      }}
      style={{
        backgroundColor: 'white',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E7F0FA',
        borderRadius: 10,
        paddingHorizontal: 10,
        fontFamily: 'InstrumentSans', // Added font family
        ...customStyle,
      }}
      underlineColor="transparent"
      underlineStyle={{ backgroundColor: 'transparent' }}
    />
  );
};

export default DynamicTextInput;
