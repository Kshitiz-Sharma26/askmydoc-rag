import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import PrivateRoutes from "./utility/PrivateRoutes";
import { GlobalContext } from "./context/GlobalContextProvider";
import Loader from "./components/Loader";

function App() {
  const { state } = useContext(GlobalContext);

  return (
    <>
      {state.isLoading && <Loader />}
      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
