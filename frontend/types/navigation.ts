import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AddExpense: { 
    prefilledAmount?: number;
    prefilledMerchant?: string;
    fromSMS?: boolean;
  } | undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  History: undefined;
  Insights: undefined;
  Settings: undefined;
};