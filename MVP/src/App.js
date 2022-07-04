import { Suspense } from "react";
import MainPage from "./pages/RootPage/MainPage";
import stores from "./store/stores";
import AlertModal from "./components/modal/AlertModal";
import WalletConfirmation from "./components/modal/WalletConfirmation";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary";

const renderLoader = () => <p></p>;

const App = () => {
  const queryClient = new QueryClient();
  return (
    <Suspense fallback={renderLoader()}>
      <ReduxProvider store={stores}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <ErrorBoundary>
              <MainPage />
              <WalletConfirmation />
              <AlertModal />
            </ErrorBoundary>
          </Router>
        </QueryClientProvider>
      </ReduxProvider>
    </Suspense>
  );
};

export default App;
