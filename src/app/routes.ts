import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { ARView } from "./pages/ARView";
import { ProductDetail } from "./pages/ProductDetail";
import { Profile } from "./pages/Profile";
import { Confidence } from "./pages/Confidence";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "dashboard", Component: Dashboard },
      { path: "chat", Component: Chat },
      { path: "ar/:id", Component: ARView },
      { path: "product/:id", Component: ProductDetail },
      { path: "profile", Component: Profile },
      { path: "confidence", Component: Confidence },
    ],
  },
]);
