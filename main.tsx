import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GroupProvider } from "./xitique/groupStore";

createRoot(document.getElementById("root")!).render(
  <GroupProvider>
    <App />
  </GroupProvider>
);
