import { createContext, useContext } from "react";

const PortalContext = createContext(null);

export function usePortalTarget() {
  return useContext(PortalContext);
}

export { PortalContext };
