import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RequireAuth = ({ username, children }) => {
  const navigate = useNavigate();

  /*
  Checks if the client is signed in on launch
  If they are not, then redirects to home page and alerts the client
  */
  useEffect(() => {
    if (!username) {
      toast.info("You are not signed in. Redirecting to home page...", {
        position: "top-center",
        autoClose: 3000,
      });
      setTimeout(() => {
        navigate('/');
      }, 3000); // Redirect after 3 seconds
    }
  }, [username, navigate]);

  if (!username) {
    return null; // Do not render anything if user is not signed in
  }

  return children;
};

export default RequireAuth;