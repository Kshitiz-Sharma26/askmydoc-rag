import { Outlet, useNavigate } from "react-router-dom";
import useApiCall from "../hooks/useApiCall";
import { getTokenAPI } from "./ApiService";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { GlobalContext, type User } from "../context/GlobalContextProvider";

const PrivateRoutes = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(GlobalContext);
  const { fetchData } = useApiCall(getTokenAPI);
  const [isVerified, setIsVerified] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    let cancelled = false; // cleanup flag

    (async function () {
      dispatch({ type: "SET-LOADER", payload: true });
      const { data, error } = await fetchData({});

      if (cancelled) return; // ignore result if component unmounted

      dispatch({ type: "SET-LOADER", payload: false });

      if (error) {
        toast.error(error);
        navigate("/login");
      } else {
        dispatch({
          type: "SET-USER",
          payload: data as User,
        });
        setIsVerified(true);
      }
    })();

    return () => {
      cancelled = true; // runs on unmount (StrictMode's first unmount)
    };
  }, []);

  if (isVerified === null) return null;

  return <Outlet />;
};

export default PrivateRoutes;
