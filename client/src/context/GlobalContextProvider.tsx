import { createContext, useReducer } from "react";
import type { Dispatch } from "react";

export type User = {
  id: number;
  email: string;
} | null;
type GlobalState = {
  user: User;
  isLoading: boolean;
};

const initialState: GlobalState = {
  user: null,
  isLoading: false,
};

type Action =
  | {
      type: "SET-USER";
      payload: User;
    }
  | {
      type: "SET-LOADER";
      payload: boolean;
    };

const stateReducer = (state: GlobalState, action: Action) => {
  switch (action.type) {
    case "SET-LOADER":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET-USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      const current_action: never = action;
      throw new Error("action type not implemented", current_action);
  }
};

export const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
