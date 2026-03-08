import { Transaction } from 'store/transactions';
import Papa from 'papaparse';

export type TransactionRecord = Transaction & {
  sourceWalletLabel: string;
  sourceWalletInitialAmount: number;
  destinationWalletLabel: string | null;
  destinationWalletInitialAmount: number | null;
};

const CSV_KEYS = [
  'id',
  'createdAt',
  'updatedAt',
  'category',
  'description',
  'amount',
  'sourceWalletId',
  'destinationWalletId',
  'paidAt',
  'sourceWalletLabel',
  'sourceWalletInitialAmount',
  'destinationWalletLabel',
  'destinationWalletInitialAmount',
];

export const recordToCSVString = (records: TransactionRecord[]) => {
  if (records.length > 0) {
    return Papa.unparse(records, {
      columns: CSV_KEYS,
    });
  }

  return '';
};
