import { RootState } from 'store';
import produce from 'immer';
import { Transactions } from 'store/transactions';
import { PersistedState } from 'redux-persist';
import { Wallets } from 'store/wallets';

const Migrations = {
  2: (state: PersistedState & RootState): PersistedState & RootState => {
    return produce(state, (draft) => {
      draft.transactions = Object.keys(draft.transactions).reduce(
        (transactions: Transactions, key) => {
          return {
            ...transactions,
            [key]: {
              ...draft.transactions[key],
              paidAt: draft.transactions[key].createdAt,
            },
          };
        },
        {},
      );
    });
  },
  3: (state: PersistedState & RootState): PersistedState & RootState => {
    return produce(state, (draft) => {
      draft.wallets = Object.keys(draft.wallets).reduce(
        (wallets: Wallets, key) => {
          return {
            ...wallets,
            [key]: {
              ...draft.wallets[key],
              // paidAt: draft.transactions[key].createdAt,
              order: 0,
            },
          };
        },
        {},
      );
    });
  },
};

export default Migrations;
