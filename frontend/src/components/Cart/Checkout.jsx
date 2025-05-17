import React, {  useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import PayPalButton from './PayPalButton';
import { useDispatch, useSelector } from 'react-redux';
import { createCheckout } from "../../redux/slices/checkoutSlice";
import axios from 'axios';


const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {cart, loading, error} = useSelector((state) => state.cart);
    const {user} = useSelector((state) => state.auth);

    const [checkoutId, setCheckoutId] = useState(null)
    const [shippingAddress, setShippingAddress] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
    });

    // Ensure cart is loaded before proceeding
    useEffect(()=> {
        if(!cart || !cart.products || cart.products === 0 ) {
            navigate("/");
        }
    },[cart, navigate]);

    const handleCreateCheckout = async (e) => {
        e.preventDefault();
        if (cart && cart.products.length > 0) {
            const res = await dispatch(createCheckout({
                checkoutItems: cart.products,
                shippingAddress,
                paymentMethod: "PayPal",
                totalPrice: cart.totalPrice,
            }));
            if (res.payload && res.payload._id) {
                setCheckoutId(res.payload._id); // Set checkout ID if checkout was successful
            }
        }
    };

    const handlePaymentSuccess = async (details) => {
        try {
            console.log("Payment successful, details:", details);
            
            if (!checkoutId) {
                console.error("Missing checkoutId, cannot process payment");
                alert("An error occurred processing your payment. Please try again.");
                return;
            }
            
            // Prepare payment details from PayPal response
            const paymentData = {
                paymentStatus: "paid",
                paymentDetails: {
                    id: details.id,
                    status: details.status,
                    payer: details.payer,
                    create_time: details.create_time,
                    update_time: details.update_time
                }
            };
            
            console.log("Sending payment data to backend:", paymentData);
            
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
                paymentData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                        "Content-Type": "application/json"
                    },
                }
            );
            
            console.log("Payment API response:", response);
            
            if (response.status === 200) {
                console.log("Payment recorded successfully");
                await handleFinalizeCheckout(checkoutId);
            } else {
                console.error("Error recording payment:", response);
                alert("There was an issue processing your payment. Please contact support.");
            }
        } catch (error) {
            console.error("Payment processing error:", error);
            
            // More detailed error logging
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
            }
            
            alert("Payment processing failed. Please try again or contact support.");
        }
    };

    const handleFinalizeCheckout = async (checkoutId) => {
        try {
            if (!checkoutId) {
                console.error("Missing checkoutId in handleFinalizeCheckout");
                alert("An error occurred finalizing your order. Please contact support.");
                return;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                        "Content-Type": "application/json"
                    },
                }
            );
            
            // Check for successful status codes (both 200 and 201)
            if (response.status === 200 || response.status === 201) {
                console.log("Order finalized successfully:", response.data);
                navigate("/order-confirmation", { 
                    state: { 
                        orderDetails: response.data 
                    }
                });
            } else {
                console.error("Error finalizing order:", response);
                alert("There was an issue finalizing your order. Please contact support.");
            }
        } catch (error) {
            console.error("Order finalization error:", error);
            alert("Failed to finalize your order. Please contact customer support.");
        }
    };

    if(loading)  return <p>Loading cart...</p>;
    if(error)  return <p>Error: {error}</p>;
    if (!cart || !cart.products || cart.products.length === 0) {
        return <p>Your cart is empty</p>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
            {/* Left Section */}
            <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl uppercase mb-6">Checkout</h2>
                <form
                onSubmit={handleCreateCheckout}
                >
                    <h3 className="text-lg mb-4">
                        Contact Details
                    </h3>
                    <div
                        className="mb-4">
                        <label className=" block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={user ? user.email : ""}
                            className='w-full p-2 border rounded'
                            disabled
                        />
                    </div>
                    <h3 className="text-lg mb-4">Delivery</h3>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700">First Name</label>
                            <input
                                onChange={(e) => setShippingAddress({
                                    ...shippingAddress, firstName: e.target.value,
                                })}
                                value={shippingAddress.firstName}
                                type="text" className="w-full p-2 border rounded" required />
                        </div>

                        <div>
                            <label className="block text-gray-700">Last Name</label>
                            <input
                                onChange={(e) => setShippingAddress({
                                    ...shippingAddress, lastName: e.target.value,
                                })}
                                value={shippingAddress.lastName}
                                type="text" className="w-full p-2 border rounded" required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Address</label>
                        <input 
                        type="text" 
                        value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                            className="w-full p-2 border" 
                            required />
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700">City</label>
                            <input value={shippingAddress.city}
                                onChange={(e) => setShippingAddress({
                                    ...shippingAddress, city: e.target.value,
                                })}
                                type="text" className="w-full p-2 border rounded" required />
                        </div>

                        <div>
                            <label className="block text-gray-700">Postal Code</label>
                            <input value={shippingAddress.postalCode}
                                onChange={(e) => setShippingAddress({
                                    ...shippingAddress, postalCode: e.target.value,
                                })}
                                type="text" className="w-full p-2 border rounded" required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Country</label>
                        <input type="text" value={shippingAddress.country}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                            className="w-full p-2 border" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Phone</label>
                        <input type="tel" value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            className="w-full p-2 border" required />
                    </div>
                    <div className="mt-6">
                        {checkoutId ? (
                            <div className="mt-6">
                                <h3 className="text-lg mb-4">Pay with PayPal</h3>
                                <div className="bg-gray-50 p-4 rounded mb-4">
                                    <p className="text-sm text-gray-700">
                                        <strong>Note:</strong> If you're using an ad blocker, you may need to disable it temporarily to complete your payment.
                                    </p>
                                </div>
                                <PayPalButton
                                    amount={cart.totalPrice} 
                                    onSuccess={handlePaymentSuccess}
                                    onError={(err) => {
                                        console.error("PayPal error:", err);
                                        alert("Payment processing encountered an issue. Please try again or use a different payment method.");
                                    }}
                                />
                            </div>
                        ) : (
                            <button 
                                type="submit" 
                                className="w-full bg-black text-white py-3 rounded"
                            >
                                Continue to Payment
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Right Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg mb-4">Order Summary</h3>
            <div className="border-t py-4 mb-4">
                {cart.products.map((product, index) => (
                    <div key={index} className="flex items-start justify-between py-2 border-b">
                        <div className="flex items-start">
                            <img src={product.image} alt={product.name} className="w-20 h-24 object-cover mr-4" />
                            <div>
                                <h3 className="text-md">
                                    {product.name}
                                </h3>
                                <p className="text-gray-500">Size: {product.size}</p>
                                <p className="text-gray-500">Color: {product.color}</p>
                            </div>
                        </div>
                            <p className="text-xl">${product.price?.toLocaleString()}</p>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center text-lg mb-4">
                <p>SubTotal</p>
                <p>${cart.totalPrice?.toLocaleString()}</p>
            </div>
               <div className="flex justify-between items-center text-lg">
                <p>Shipping</p>
                <p>Free</p>
               </div>
               <div className="flex justify-between items-center text-lg mt-4  border-t pt-4">
                <p>Total</p>
                <p>${cart.totalPrice?.toLocaleString()}</p>
               </div>
        </div>
        </div>
    )
}

export default Checkout
