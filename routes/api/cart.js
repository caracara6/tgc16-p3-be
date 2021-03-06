const express = require('express');
const router = express.Router();

const { checkIfAuthenticatedJWT } = require('../../middlewares');

const CartServices = require('../../services/cart');

router.get('/', checkIfAuthenticatedJWT, async function (req, res) {
    
    try {

        let cartServices = new CartServices(req.user.id)
        let cartItems = await cartServices.getCart();


        // if(cartItems.toJSON().length == 0){
        //     return res.status(200).send({"message":"Your cart is empty"})
        // } else {
            res.status(200).send(cartItems)
        // }

    } catch (e) {
        res.status(500).send({"message" : "Unable to retrieve your cart due to internal server error"})
    }
})

router.post('/:product_id', checkIfAuthenticatedJWT, async function(req, res) {
    try {
        let cartServices = new CartServices(req.user.id)
        // console.log('testing req.params', typeof req.params.product_id)
        let valResult = await cartServices.addToCart(req.params.product_id, parseInt(req.body.quantity))
        console.log('============', valResult)
        res.status(200).send({ "message" : valResult })

    } catch (e) {
        res.status(500).send({"message" : e})
    }
})

router.put('/:product_id', checkIfAuthenticatedJWT, async function(req, res){
    try {

        let cartServices = new CartServices(req.user.id)

        if(parseInt(req.body.newQuantity) == 0) {
            await cartServices.removeFromCart(req.params.product_id);
            return res.status(200).send({"message":"You have removed this item from your cart"})

        } else if (parseInt(req.body.newQuantity) > 0) {
            let result = await cartServices.updateQuantity(req.params.product_id, parseInt(req.body.newQuantity))
            if(result){
                return res.status(200).send({"message" : "Quantity changed successfully"})
            } else {
                return res.status(400).send({"message":`Sorry, there ${req.body.newQuantity - 1 === 1 ? 'is' : 'are'} only ${req.body.newQuantity - 1} of this item left in stock`})
            }
        } else if(parseInt(req.body.newQuantity) < 0){
            return res.status(400).send({"message": "Please enter a positive number"})
        }

    } catch (e) {
        res.status(500).send({"message" : "Unable to add to your cart due to internal server error"})
    }
})

router.delete('/:product_id', checkIfAuthenticatedJWT, async function(req, res){
    try{

        let cartServices = new CartServices(req.user.id)

        await cartServices.removeFromCart(req.params.product_id);
        
        return res.status(200).send({"message":"You have removed this item from your cart"})

    } catch (e) {
        res.status(500).send({"message" : "Unable to delete this product from your cart due to internal server error"})
    }
})













module.exports = router;