import React, { useEffect, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const PayPalButton = ({amount, onSuccess, onError}) => {
  const [paypalError, setPaypalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Validate amount to ensure it's a valid number and greater than zero
  const validAmount = parseFloat(amount);
  
  if (isNaN(validAmount) || validAmount <= 0) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        <p>Invalid payment amount. Please refresh the page or contact support.</p>
      </div>
    );
  }

  // Format amount to 2 decimal places
  const formattedAmount = validAmount.toFixed(2);
  
  // Handle script load errors
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div>
      {paypalError && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded mb-4">
          <p className="font-bold">Note:</p>
          <p>Ad blockers may interfere with PayPal. If you experience issues, please temporarily disable ad blockers for this site.</p>
        </div>
      )}
      
      <PayPalScriptProvider 
        options={{
          "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
          currency: "USD",
          intent: "capture",
          "disable-funding": "credit,card"
        }}
        onError={(err) => {
          console.error("PayPal script error:", err);
          setPaypalError(err);
        }}
      >
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading PayPal...</span>
          </div>
        )}
        
        <PayPalButtons
          style={{
            layout: "vertical",
            shape: "rect",
            color: "gold"
          }}
          forceReRender={[formattedAmount]}
          createOrder={(data, actions) => {
            console.log("Creating PayPal order with amount:", formattedAmount);
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: "USD",
                  value: formattedAmount
                }
              }],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              console.log("PayPal payment captured:", details);
              onSuccess(details);
            });
          }}
          onError={(err) => {
            console.error("PayPal button error:", err);
            setPaypalError(err);
            onError(err);
          }}
          onCancel={() => {
            console.log("Payment cancelled by user");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalButton
