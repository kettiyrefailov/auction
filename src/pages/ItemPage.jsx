import React, {useEffect, useState} from 'react';
import {Box, Button, TextField, Tooltip, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import Cookies from "js-cookie";
import {sendApiGetRequest, sendApiPostRequest} from "../utils/ApiRequests";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useNavigate } from "react-router-dom";
const ItemPage = (props) => {

    const navigate = useNavigate();

    const [alreadyHighest, setAlreadyHighest] = useState(false)
    const [bidsForThisProduct, setBidsForThisProduct] = useState([])
    const [bidResponse, setBidResponse] = useState(undefined)
    const [balance, setBalance] = useState(0)
    const [productSoldResponse, setProductSoldResponse] = useState(undefined)
    const [newBid, setNewBid] = useState(0)


    const [productToView, setProductToView] = useState({
        productId: 0,
        productName: "",
        placementDate: "",
        productDescription: "",
        minPrice: undefined,
        sellerId: -1,
        imageLink: "",
        sold: false

    })
    const {id} = useParams();


    useEffect(() => {
        if(props.allProducts.length != 0) {

            if(props.allProducts[parseInt(id)].sold) {
                navigate("/")
            }
        }
    },[props.allProducts])





    useEffect(() => {
        if (props.bidModels.length != 0) {
            const bidsForThisProduct = props.bidModels.filter(bidModel => bidModel.productId == (parseInt(id) + 1))
            setBidsForThisProduct(bidsForThisProduct);
        }
    },[props.allProducts, props.bidModels, productToView])





    useEffect(() => {
        if(productSoldResponse!=undefined&&productSoldResponse.success) {
            toast.success("Product sold successfully!",{
                pauseOnHover: false
            })
            sendApiGetRequest("http://localhost:8989/get-all-products", props.setAllProductsResponse)

            navigate("/")
        }
    },[productSoldResponse])

    useEffect(() => {

        const userId = getUserId()
        if (userId > 0) {
            if (props.bidModels.length != 0) {

                const filteredByProductId = props.bidModels.filter(bidModel => bidModel.productId == (parseInt(id)+1))
                if (filteredByProductId.length != 0) {
                    const highestBidObject = filteredByProductId.reduce((a, b) => (a.bidValue > b.bidValue && new Date(a.placementDate) > new Date(b.placementDate)) ? a : b)
                    if (highestBidObject.userId == userId) {
                        setAlreadyHighest(true)
                    } else {
                        setAlreadyHighest(false)
                    }
                }

            }
        }


    },[props.bidModels, productToView])

    useEffect(() => {
        const rawUserData= Cookies.get("userData");
        if (rawUserData != undefined) {
            setBalance(JSON.parse(rawUserData).balance)
        }
    },[props.allBidsResponse, props.allProductsResponse, props.newBalance])

    useEffect(() => {
        setBidResponse(undefined)
    }, [props.allBidsResponse, productToView])


    const getUserId = () => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            return JSON.parse(rawUserData).id
        }
        return -1
    }


    useEffect(() => {
        let rawUserData = Cookies.get("userData");
        if (rawUserData == undefined) {
            navigate("/login")
        }

        if (id > Cookies.get("totalProducts")-1 || id < 0 || isNaN(parseInt(id)))  {
            navigate("/")
            toast.error("There is no such product",{
                pauseOnHover: false
            })
        }
    },[])



    useEffect(() => {

        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            if (bidResponse != undefined && bidResponse.success) {
                props.balanceUpdated()
                setProductToView(props.allProducts[id])
                toast.success("Bid placed successfully", {
                    pauseOnHover: false
                })
                sendApiGetRequest("http://localhost:8989/get-all-products", props.allProductsResponse);
                sendApiGetRequest("http://localhost:8989/get-all-bids", props.allBidsResponse)
            }

            if (bidResponse != undefined && !bidResponse.success) {
                let message

                switch (bidResponse.errorCode) {
                    case 1006:
                        message = "No such user"
                        break;
                    case 1007:
                        message = "No such product"
                        break;
                    case 1008:
                        message = "Incorrect bid"
                        break;
                    case 1011:
                        message = "No enough money on balance"
                        break;
                    case 1010:
                        message = "Transaction error"
                        break;
                    case 1013:
                        message = "Placed bit to you own product"
                        break;
                }

                toast.error("Error: " + message)
            }
        }

    },[bidResponse])



    useEffect(() => {
        if (productToView.minPrice > 0) {
            setNewBid(productToView.minPrice)
        }
    },[productToView])


    useEffect(() => {
        if (props.allProducts.length != 0) {
            setProductToView(props.allProducts[id])
        }
    }, [props.allProducts])





    const isImage = (url) => {
        return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);

    }

    
    const placeNewBid = (e) => {
        e.preventDefault()
        const rawUserData = Cookies.get("userData");
        if (rawUserData != undefined) {
            const userData = JSON.parse(rawUserData)
            let userId = userData.id
            let token = userData.token
            let productId = productToView.productId
            sendApiPostRequest("http://localhost:8989/place-bid", {token ,userId, productId, newBid},setBidResponse)
            userData.balance = userData.balance-1-newBid
            Cookies.remove("userData")
            Cookies.set("userData", JSON.stringify(userData));
        }
    }




    const handleNewBidChange = (e) => {
        let isNum = /^[+-]?\d+(\.\d+)?$/.test(e.target.value);
        if (isNum) {
            setNewBid(e.target.value)
        }
    }
    
    const sellProduct = () => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData!=undefined) {
            const userData =  JSON.parse(rawUserData)
            const token = userData.token
            const productId = productToView.productId
            const productName = productToView.productName
            sendApiPostRequest("http://localhost:8989/sell-product", {token, productId, productName}, setProductSoldResponse)
            userData.balance = userData.balance+(newBid-(newBid*0.05))
            Cookies.remove("userData")
            Cookies.set("userData", JSON.stringify(userData));
        }

    }

    const disablePlaceBid = () => {
       return newBid<=productToView.minPrice || newBid >= balance
    }


    return (
        <>
            <Box display={"flex"}
                 flexDirection={"column"}
                 maxWidth={productToView.productDescription == "" ? 400 : 700}
                 alignItems={"start"}
                 justifyContent={"center"}
                 margin={"auto"}
                 marginTop={10}
                 padding={3}
                 paddingTop={1}
                 borderRadius={3}
                 boxShadow={'5px 5px 10px #ccc'}
                 sx={{
                     transition: "0.2s ease-in",
                     ":hover": {
                         boxShadow: '5px 5px 20px #ccc'
                     }
                 }}

            >
                <span style={{alignItems: "start", width: "100%"}}>
                <Typography>
                    Product name: {productToView.productName}
                </Typography>
                <Typography sx={{mt: 2}}>
                    Placement date: {productToView.placementDate}
                </Typography>
                </span>
                <span style={{display: "flex", flexDirection:"row"}}>
                    <img
                        style={{
                            maxWidth: 400,
                            maxHeight: 300,
                            paddingTop: 25,
                        }}
                        src={isImage(productToView.imageLink) ? productToView.imageLink : process.env.PUBLIC_URL+"/placeholder-image.png"}
                    />
                    {
                        productToView.productDescription != ""&&
                        <span style={{marginLeft: 50}}>
                        <h5>Product description</h5>
                        <p style={{
                            textOverflow: "ellipsis",
                            wordWrap: "break-word",
                            overflow: "hidden",
                            width: "200px",

                        }}>{productToView.productDescription}</p>
                        </span>
                    }
                </span>

                <span style={{alignItems: "start", width: "100%"}}>
                    <Typography sx={{mt: 2}}>
                        Current bid: {productToView.minPrice}$
                    </Typography>
                </span>
                <span style={{display: "flex", flexDirection: "row"}}>
                {
                    (getUserId() != productToView.sellerId)&&
                    <>
                       <span style={{display: "flex", flexDirection: "row"}}>
                            <TextField
                                type="number"
                                variant={"standard"}
                                label={"New bid"}
                                value={newBid == 0 ? "" : newBid}
                                disabled={balance < (productToView.minPrice+2)}
                                onChange={handleNewBidChange}
                                sx={{
                                    mt:2,
                                    width: 100,
                                }}
                                InputProps={{ inputProps: { min: productToView.minPrice, max: Math.abs(balance-1) } }}

                            />
                        <Typography sx={{
                            mt:4.4,
                            pr:2.5
                        }}>$</Typography>
                       </span>
                    </>
                }

                <span style={{width: "100%", justifyContent: "end"}}>
                    {
                        getUserId() == productToView.sellerId ?
                            <Button sx={{mt: 2}} variant={"contained"}
                                    onClick={sellProduct}
                                    disabled={bidsForThisProduct.length==0}
                            >
                                Sell product
                            </Button> :
                           <Tooltip title={(productToView.minPrice < newBid&&alreadyHighest) ? "Not recommended your bid is already highest":""}>
                               <span style={{
                                   display: "flex",
                                   flexDirection: "row",
                                   alignItems: "end"
                               }}>
                                    <Button
                                        onClick={placeNewBid}
                                        sx={{mt: 4}} variant={"contained"}
                                        disabled={disablePlaceBid()}
                                        color={alreadyHighest ? "warning" : "success"}
                                    >
                                        Place bid
                                    </Button>
                                   {
                                       (productToView.minPrice < newBid&&alreadyHighest)&&
                                       <span style={{marginLeft: 5}}>
                                           <WarningAmberIcon fontSize={"large"} />
                                       </span>
                                   }
                               </span>
                           </Tooltip>
                    }
                </span>
                </span>
            </Box>

        </>
    );
};

export default ItemPage;