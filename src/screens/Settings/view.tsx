import React, { useState } from 'react';
import numbro from 'numbro';
import {
  ScrollView,
  View,
  StatusBar,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStyles from './styles';
import { SettingsProps } from './props';
import { Back } from 'components/base/SVG';
import Picker from 'components/base/Picker';
import { TRANSLATIONS } from 'constants/translations';
import Text from 'components/base/Text';
import useTranslationKey from 'utils/hooks/useTranslationKey';
import Button from 'components/base/Button';
import { useDispatch } from 'react-redux';
import { importWalletAction, ImportWalletInput } from 'store/wallets';
import {
  importTransactionAction,
  ImportTransactionInput,
} from 'store/transactions';
import Papa from 'papaparse';
import DocumentPicker, { types } from 'react-native-document-picker';
import Info from 'components/module/Info';
import RNFS from 'react-native-fs';

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
  const dispatch = useDispatch();

  const [importMessage, setImportMessage] = useState<string | null>(null);

  const [TEXT_THEME_LIGHT, TEXT_THEME_DARK, TEXT_THEME_WASABI] =
    useTranslationKey(['THEME_LIGHT', 'THEME_DARK', 'THEME_WASABI']);

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
        barStyle={colors.STATUS_BAR}
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
          theme={theme}
          translationKey="SETTINGS"
        />
      </View>
      <View style={styles.content}>
        <ScrollView style={styles.contentScroll}>
          <Picker
            // containerStyle={styles.inputContainer}
            translationKey="CURRENCY"
            selectedValue={currencyLanguage}
            onSelect={(value) => setCurrencyLanguage(value)}
            options={currencyLanguageOptions}
            theme={theme}
          />

          <Picker
            containerStyle={styles.inputContainer}
            translationKey="LANGUAGE"
            selectedValue={selectedLanguage}
            onSelect={(value) => setSelectedLanguage(value)}
            options={LANGUAGE_OPTIONS}
            theme={theme}
          />

          <Picker
            containerStyle={styles.inputContainer}
            translationKey="THEME"
            selectedValue={baseTheme}
            onSelect={(value) => {
              // @ts-ignore
              setBaseTheme(value);
            }}
            options={[
              {
                label: TEXT_THEME_LIGHT,
                value: 'Light',
              },
              {
                label: TEXT_THEME_DARK,
                value: 'Dark',
              },
              {
                label: TEXT_THEME_WASABI,
                value: 'Wasabi',
              },
            ]}
            theme={theme}
          />
          <Button
            outline
            onPress={async () => {
              // -----------------------------------
              // Draft implementation of an import feature. Please let me know if you want this to be a polished feature.
              // -----------------------------------
              try {
                setImportMessage(null);

                if (Platform.OS !== 'android') {
                  throw new Error(
                    'This test feature is only available for Android right now.',
                  );
                }

                const [fileMetadata] = await DocumentPicker.pick({
                  presentationStyle: 'fullScreen',
                  // type: types.csv, // the file is unselectable for now if it's like this
                });

                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  {
                    title: 'Storage Permission Required',
                    message:
                      'This app needs access to your storage to read files',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                  },
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                  throw new Error("Can't access storage");
                }

                const fileContents = await RNFS.readFile(fileMetadata.uri);

                const parsedValues = Papa.parse<{
                  id: string;
                  createdAt: string;
                  updatedAt: string;
                  category: string;
                  description: string;
                  amount: string;
                  sourceWalletId: string;
                  destinationWalletId: string;
                  paidAt: string;
                  sourceWalletLabel: string;
                  sourceWalletInitialAmount: string;
                  destinationWalletLabel: string;
                  destinationWalletInitialAmount: string;
                }>(fileContents, {
                  header: true,
                });

                // console.log(
                //   'parsedValues',
                //   JSON.stringify(parsedValues, null, 2),
                // );

                if (parsedValues.errors.length > 0) {
                  const errorMessage = parsedValues.errors
                    .map((e) => e.message)
                    .join('\n');

                  throw new Error(errorMessage);
                }

                const handleNullable = function <T>(value: T): T | null {
                  return value === 'null' ? null : value;
                };

                // start from initial transactions
                parsedValues.data.reverse();

                const formattedValues = parsedValues.data.map((parsed) => {
                  return {
                    ...parsed,
                    amount: Number(parsed.amount),
                    sourceWalletInitialAmount: Number(
                      parsed.sourceWalletInitialAmount,
                    ),
                    destinationWalletId: handleNullable(
                      parsed.destinationWalletId,
                    ),
                    destinationWalletLabel: handleNullable(
                      parsed.destinationWalletLabel,
                    ),

                    destinationWalletInitialAmount: Number(
                      handleNullable(parsed.destinationWalletInitialAmount),
                    ),
                  };
                });

                // console.log(JSON.stringify(formattedValues, null, 2));

                let count = 0;
                formattedValues.forEach((value) => {
                  const sourceWalletPayload: ImportWalletInput = {
                    id: value.sourceWalletId,
                    createdAt: value.createdAt,
                    updatedAt: value.updatedAt,
                    initialAmount: value.sourceWalletInitialAmount,
                    label: value.sourceWalletLabel,
                  };

                  // console.log('sourceWalletPayload', sourceWalletPayload);
                  dispatch(importWalletAction(sourceWalletPayload));

                  if (value.destinationWalletId) {
                    const destinationWalletPayload: ImportWalletInput = {
                      id: value.destinationWalletId,
                      createdAt: value.createdAt,
                      updatedAt: value.updatedAt,
                      initialAmount: value.destinationWalletInitialAmount,
                      label: value.destinationWalletLabel!,
                    };
                    // console.log(
                    //   'destinationWalletPayload',
                    //   destinationWalletPayload,
                    // );
                    dispatch(importWalletAction(destinationWalletPayload));
                  }

                  const transactionPayload: ImportTransactionInput = value;
                  // console.log('transactionPayload', transactionPayload);
                  dispatch(importTransactionAction(transactionPayload));

                  count++;
                  console.log('count', count);
                });

                setImportMessage(`Finished importing ${count} files.`);
              } catch (e: any) {
                setImportMessage(e.toString());
                throw e;
              }
            }}
            translationKey="IMPORT"
            theme={theme}
            containerStyle={{
              marginTop: 16,
            }}
          />
        </ScrollView>
        {importMessage && <Info theme={theme} label={importMessage} />}
      </View>
    </SafeAreaView>
  );
};

export default SettingsView;
