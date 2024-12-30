import { useContext, useEffect } from "react";
import "./Verify.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const Verify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  console.log(success, orderId);

  const verifyPayment = async () => {
 

    try {
      if (!url) {
        throw new Error(
          "Base URL is undefined. Please check the StoreContext."
        );
      }

      const apiUrl = new URL("api/order/verify", url).toString(); // Validate URL
      
      const response = await axios.post(apiUrl, {
        success,
        orderId,
      });

      if (response.data.success) {
        navigate("/myorders");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error verifying payment:", error.message);
      navigate("/error");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;
