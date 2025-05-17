
const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
const { protect } = require("../middleware/authMiddleware.js");


const router = express.Router();

// Helper function to get a cart by user Id or guest Id
const getCart = async (userId, guestId) => {
    try {
        let cart = null;
        
        if (userId && userId !== 'undefined' && userId !== 'null') {
            console.log("Looking for cart with userId:", userId);
            cart = await Cart.findOne({ user: userId });
        } 
        
        if (!cart && guestId && guestId !== 'undefined' && guestId !== 'null') {
            console.log("Looking for cart with guestId:", guestId);
            cart = await Cart.findOne({ guestId: guestId });
        }
        
        console.log("Cart found:", cart ? cart._id : "No cart found");
        return cart;
    } catch (error) {
        console.error("Error in getCart helper:", error);
        return null;
    }
};


// @route Post /api/products
// @desc Add a new product to the cart for a guest or logged in user
// @access Private/Admin
router.post("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Determine if the user is logged in or guest
        let cart = await getCart(userId, guestId);

        //  If the cart exists, update it
        if (cart) {
            const productIndex = cart.products.findIndex((p) =>
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
            );

            if (productIndex > -1) {
                // If the product already exists in the cart, update the quantity
                cart.products[productIndex].quantity += quantity;
            } else {
                // add new product
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity,
                })
            }

            //  Recalculate the total price
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
            await cart.save();
            return res.status(200).json(cart);
        } else {
            // Create a new cart for the guest or user
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {

                        productId,
                        name: product.name,
                        image: product.images[0].url,
                        price: product.price,
                        size,
                        color,
                        quantity,
                    },
                ],
                totalPrice: product.price * quantity,
            });
            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


// @route PUT /api/cart
// @desc Update the quantity in the cart for a guest or logged in user
// @access public
router.put("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );

        if (productIndex > -1) {
            // Update quantity
            if (quantity > 0) {
                cart.products[productIndex].quantity = quantity
            } else {
                cart.products.splice(productIndex, 1); // Remove the product from the cart if the quantity of the product is 0
            }

            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity,
                0
            );
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// @route DELETE /api/cart
// @desc Remove a product from the cart for a guest or logged in user
// @access public
router.delete("/", async (req, res) => {
    // Get parameters from query for DELETE requests
    const { productId, size, color, guestId, userId } = req.query;
    
    try {
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        // Debug logging
        console.log("Delete cart item request:", { productId, size, color, guestId, userId });
        
        let cart = await getCart(userId, guestId);
        
        if (!cart) {
            console.log("Cart not found for:", { userId, guestId });
            return res.status(404).json({ message: "Cart not found" });
        }
        
        console.log("Found cart:", cart._id);
        
        // Find the product in the cart
        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );
        
        console.log("Product index in cart:", productIndex);
        
        if (productIndex > -1) {
            // Remove the product from the cart
            cart.products.splice(productIndex, 1);
            
            // Recalculate the total price
            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );
            
            // Save the updated cart
            await cart.save();
            console.log("Cart updated successfully");
            return res.status(200).json(cart);
        } else {
            console.log("Product not found in cart");
            return res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        console.error("Remove from cart error:", error);
        return res.status(500).json({ 
            message: "Server Error", 
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
        });
    }
});

// @route GET /api/cart
// @desc Get logged-in user's or guest user's cart
// @access public
router.get("/", async (req, res) => {
    const { userId, guestId } = req.query;

    try {
        const cart = await getCart(userId, guestId);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: "Cart not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" })
    }
});



// @route POST /api/cart/merge
// @desc Merge guest cart into user cart on login
// @access Private
router.post("/merge", protect, async (req, res) => {
    const {guestId} = req.body;

    try {
        // Find the guest cart and user cart
        const guestCart = await Cart.findOne({guestId});
        const userCart = await Cart.findOne({user: req.user._id});

        if(guestCart) {
            if(guestCart.products.length === 0) {
                return res.status(400).json({message: "Guest cart is empty"});
            }

            if (userCart) {
                // Merge guest cart into user cart
                guestCart.products.forEach((guestItem) => {
                    const productIndex = userCart.products.findIndex((item) => 
                    item.productId.toString() === guestItem.productId.toString() &&
                    item.size === guestItem.size &&
                    item.color === guestItem.color
                );

                if(productIndex > -1) {
                    // If the items exists in the user cart, update the quantity
                    userCart.products[productIndex].quantity += guestItem.quantity;
                } else {
                    // Otherwise, add the guest item to the cart;
                    userCart.products.push(guestItem);
                }
                });

                userCart.totalPrice = userCart.products.reduce((acc, item) => acc + item.price * item.quantity,
            0
        );
        await userCart.save();

        // Remove the guest cart
        try {
            await Cart.findOneAndDelete({guestId});
        } catch (error) {
            console.error("Error deleting guest cart:", error)
        }
        res.status(200).json(userCart);
            } else {
                // If the user has no existing cart, assign the guest cart to the user 
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                res.status(200).json(guestCart)
            }
        } else{
            if (userCart) {
                // Guest cart has already been merged, return the user cart
                res.status(200).json(userCart);
            }
            res.status(404).json({message: "Guest cart not found"});    
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"})
        
    }
});

module.exports = router
