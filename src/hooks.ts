import { useContext } from "react";

import { PicketContext, IPicketContext } from "./context";

export const usePicket = () => useContext<IPicketContext>(PicketContext);
