import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from '../redux/slices/cartSlice';

const OrderConfirmationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { checkout } = useSelector((state) => state.checkout);


    // Clear the cart after successful checkout
    useEffect(() => {
        if (checkout && checkout._id) {
            dispatch(clearCart());
            localStorage.removeItem("cart");
        } else {
            navigate("/my-orders");
        }
    }, [checkout, dispatch, navigate])

    const calculateEstimateDelivery = (createdAt) => {
        const orderDate = new Date(createdAt);
        orderDate.setDate(orderDate.getDate() + 10);
        return orderDate.toLocaleDateString();
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white">
            <h1 className="text-4xl font-bold text-center text-emerald-700 mb-8">Thank You for Your Order!</h1>

            {checkout && (
                <div className="p-6 rounded-lg border ">
                    <div className="flex justify-between mb-8 md:mb-15">
                        {/* Order Id and Date */}
                        <div>
                            <h2 className="text-l md:text-xl mr-2 font-semibold">
                                Order ID: {checkout._id}
                            </h2>
                            <p className="text-gray-500">Order Date: {new Date(checkout.createdAt).toLocaleDateString()}</p>
                        </div>
                        {/* Estimated Delivery */}
                        <div>
                            <p className="text-emerald-700 text-sm">
                                Estimated Delivery: {calculateEstimateDelivery(checkout.createdAt)}
                            </p>
                        </div>
                    </div>
                    {/* Ordered Items */}
                    <div className=" mb-8 md:mb-15">
                        {checkout.checkoutItems.map((item) => (
                            <div key={item.productId} className="flex items-center mb-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                                <div>
                                    <h4 className="text-md font-semibold ">{item.name}</h4>
                                    <p className="text-sm text-gray-500">{item.color} | {item.size}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-md">${item.price}</p>
                                    <p className="text-sm text-gray-500">Quantity:{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-between  mt-8 md:mt-15 ">
                            <div className="text-l md:text-xl mr-2 font-semibold">
                                <h2>Order Summary</h2>
                            </div>
                            <div className="font-semibold" >
                                <p>Subtotal: <span className="font-normal">${checkout.totalPrice}</span></p>
                                <p>Shipping: <span className="font-normal ">Free</span></p>
                                <p>Total: $ <span className="font-normal">{checkout.totalPrice}</span></p></div>
                        </div>
                    </div>
                    {/* Payment and Delivery Info */}
                    <div className="flex justify-between gap-8 ">
                        {/* Payment Info */}
                        <div className="flex flex-col">
                            <h4 className="text-lg font-semibold mb-2">Payment Mode</h4>
                            <p className="text-gray-600">Paypal</p>
                        </div>

                        {/* Delivery Info */}
                        <div className="text-left">
                            <h4 className="text-lg font-semibold mb-2">Delivery</h4>
                            <p className="text-gray-600">{checkout.shippingAddress.address}</p>
                            <p className="text-gray-600">{checkout.shippingAddress.city}, {" "} {checkout.shippingAddress.country} </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderConfirmationPage