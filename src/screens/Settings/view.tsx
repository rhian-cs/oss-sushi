import React from 'react';
import numbro from 'numbro';
import Text from 'components/base/Text';
import { ScrollView, View, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStyles from './styles';
import { SettingsProps } from './props';
import { Back } from 'components/base/SVG';
import Picker from 'components/base/Picker';
import { TRANSLATIONS } from 'constants/translations';

const LANGUAGE_OPTIONS = Object.keys(TRANSLATIONS).map((value) => {
  const typedValue = value as keyof typeof TRANSLATIONS;
  return {
    label: TRANSLATIONS[typedValue].TRANSLATION_NAME,
    value,
  };
});

const SettingsView = (props: SettingsProps) => {
  const {
    navigation,
    baseTheme,
    setBaseTheme,
    currencyLanguage,
    setCurrencyLanguage,
    selectedLanguage,
    setSelectedLanguage,
  } = props;
  const { styles, theme, colors } = useStyles();

  const numbroLanguages = numbro.languages();
  const currencyLanguageOptions = Object.keys(numbroLanguages).reduce(
    (accum: { label: string; value: string }[], key: string) => {
      const data = numbroLanguages[key];
      return [
        ...accum,
        {
          label: `${data.currency.code}/${data.languageTag} (${data.currency.symbol})`,
          value: key,
        },
      ];
    },
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.BACKGROUND}
        barStyle={theme.base === 'Dark' ? 'light-content' : 'dark-content'}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackAction}
          onPress={() => {
            navigation.goBack();
          }}>
          <Back fill={colors.PRIMARY_TEXT} width={24} height={24} />
        </TouchableOpacity>
        <Text
          containerStyle={styles.headerTitleContainer}
          variant="title"
          theme={theme}>
          Settings
        </Text>
      </View>
      <View style={styles.content}>
        <ScrollView style={styles.contentScroll}>
          <Picker
            // containerStyle={styles.inputContainer}
            label="Currency"
            selectedValue={currencyLanguage}
            onSelect={(value) => setCurrencyLanguage(value)}
            options={currencyLanguageOptions}
            theme={theme}
          />

          <Picker
            containerStyle={styles.inputContainer}
            label="Language"
            selectedValue={selectedLanguage}
            onSelect={(value) => setSelectedLanguage(value)}
            options={LANGUAGE_OPTIONS}
            theme={theme}
          />

          <Picker
            containerStyle={styles.inputContainer}
            label="Theme"
            selectedValue={baseTheme}
            onSelect={(value) => {
              // @ts-ignore
              setBaseTheme(value);
            }}
            options={[
              {
                label: 'Light',
                value: 'Light',
              },
              {
                label: 'Dark',
                value: 'Dark',
              },
            ]}
            theme={theme}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingsView;
