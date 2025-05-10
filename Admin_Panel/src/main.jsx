import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider } from "react-router-dom";
import publicRoutes from "./routes/routes.jsx";
import { Provider } from "react-redux";
import { store, persistor } from "./Redux/Store.jsx";
import { PersistGate } from "redux-persist/integration/react";


createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={publicRoutes}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </RouterProvider>
  </Provider>
);
