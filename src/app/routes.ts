import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Landing } from "./pages/Landing";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { Dashboard } from "./pages/Dashboard";
import { Chat } from "./pages/Chat";
import { ARView } from "./pages/ARView";
import { ProductDetail } from "./pages/ProductDetail";
import { Profile } from "./pages/Profile";
import { PDFReport } from "./pages/PDFReport";
import { Confidence } from "./pages/Confidence";
import { Voice } from "./pages/Voice";
import { StoryIntelligence } from "./pages/StoryIntelligence";
import SmartSetupPage from "./pages/SmartSetup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "signin", Component: SignIn },
      { path: "signup", Component: SignUp },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
      { path: "terms", Component: Terms },
      { path: "privacy", Component: Privacy },
      { path: "dashboard", Component: Dashboard },
      { path: "chat", Component: Chat },
      { path: "ar/:id", Component: ARView },
      { path: "product/:id", Component: ProductDetail },
      { path: "profile", Component: Profile },
      { path: "pdf-report", Component: PDFReport },
      { path: "confidence", Component: Confidence },
      { path: "voice", Component: Voice },
      { path: "story", Component: StoryIntelligence },
      { path: "smart-setup", Component: SmartSetupPage },
    ],
  },
]);
