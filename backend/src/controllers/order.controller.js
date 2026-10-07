import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";



export const createOrder = async (req, res, next) => {

    try {

        const userId = req.user._id;

        const {
            addressId,
            paymentMethod = "COD"
        } = req.body;


        // ---------------------------------------------
        // Validate payment method
        // ---------------------------------------------

        if (!["COD", "ONLINE"].includes(paymentMethod)) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });

        }


        // ---------------------------------------------
        // Find cart
        // ---------------------------------------------

        const cart = await cartModel
            .findOne({
                user: userId
            })
            .populate("items.product");


        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });

        }


        if (cart.items.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });

        }


      
        const user = await userModel.findById(userId);


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        const address = user.addresses.id(addressId);


        if (!address) {

            return res.status(404).json({
                success: false,
                message: "Address not found"
            });

        }


        for (const item of cart.items) {

            const product = item.product;


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });

            }


            if (product.stock < item.quantity) {

                return res.status(400).json({
                    success: false,
                    message: `${product.title} has only ${product.stock} items available`
                });

            }

        }


        
        const orderItems = cart.items.map((item) => {

            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            };

        });


        const order = await orderModel.create({

            user: userId,

            items: orderItems,

            totalPrice: cart.totalPrice,

            shippingAddress: {

                fullName: address.fullName,

                phone: address.phone,

                addressLine1: address.addressLine1,

                addressLine2: address.addressLine2 || "",

                city: address.city,

                state: address.state,

                postalCode: address.postalCode,

                country: address.country || "India"

            },

            paymentMethod: paymentMethod,

            paymentStatus: "PENDING",

            orderStatus:
                paymentMethod === "COD"
                    ? "CONFIRMED"
                    : "PENDING"

        });


        if (paymentMethod === "COD") {

            // Reduce stock
            for (const item of cart.items) {

                await productModel.findByIdAndUpdate(
                    item.product._id,
                    {
                        $inc: {
                            stock: -item.quantity
                        }
                    }
                );

            }


            // Clear cart
            cart.items = [];

            cart.totalPrice = 0;

            await cart.save();

        }


        return res.status(201).json({

            success: true,

            message:
                paymentMethod === "COD"
                    ? "Order placed successfully"
                    : "Order created. Proceed to payment",

            order

        });

    } catch (error) {

        next(error);

    }

};




export const getMyOrders = async (req, res, next) => {

    try {

        const userId = req.user._id;


        const orders = await orderModel
            .find({
                user: userId
            })
            .populate(
                "items.product",
                "title price images"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            count: orders.length,

            orders

        });

    } catch (error) {

        next(error);

    }

};



export const getOrderById = async (req, res, next) => {

    try {

        const userId = req.user._id;

        const { orderId } = req.params;


        const order = await orderModel
            .findOne({
                _id: orderId,
                user: userId
            })
            .populate(
                "items.product",
                "title price images"
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }


        return res.status(200).json({

            success: true,

            order

        });

    } catch (error) {

        next(error);

    }

};




export const cancelOrder = async (req, res, next) => {

    try {

        const userId = req.user._id;

        const { orderId } = req.params;


        const order = await orderModel.findOne({

            _id: orderId,

            user: userId

        });


        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }


        
        if (
            order.orderStatus === "SHIPPED" ||
            order.orderStatus === "DELIVERED" ||
            order.orderStatus === "CANCELLED"
        ) {

            return res.status(400).json({

                success: false,

                message: "Order cannot be cancelled"

            });

        }

        for (const item of order.items) {

            await productModel.findByIdAndUpdate(

                item.product,

                {
                    $inc: {
                        stock: item.quantity
                    }
                }

            );

        }


        order.orderStatus = "CANCELLED";


        await order.save();


        return res.status(200).json({

            success: true,

            message: "Order cancelled successfully",

            order

        });

    } catch (error) {

        next(error);

    }

};