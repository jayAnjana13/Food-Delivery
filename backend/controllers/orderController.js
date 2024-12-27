import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
// import PayPal from "paypal";

// const paypal = new PayPal(process.env.PAYPAL_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order from frontend
const placeOrder = async (req, res) => {
  const frontend_url = "https://food-delivery-frontend-984o.onrender.com/";

  console.log("entered in placeorder func");
  try {
    console.log("1 entered in try block of placeOrder func")
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    
    console.log("2 order saved in ordermodel")
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
      console.log("3. inside line item")
    }));
console.log("4 outside line item")
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
      console.log("5 line item add")
    });
console.log("6 line item is added")
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      console.log("7. inside session")
    });
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log("error in placeorder: ",error);
    res.json({ success: false, message: "Error in placeorder" });
  }
};

//verify order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  console.log("entered verify order");
  try {
    console.log("8. entered in try block of verify order")
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      console.log("9. entered in catch block of verifyorder")
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log("errorin verify order: ",error);
    res.json({ success: false, message: "Error in verifyOrder" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in user orders" });
  }
};

// listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in listOrders" });
  }
};

// api for order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error in updateStatus" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
