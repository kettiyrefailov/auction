import React, {useEffect, useRef, useState} from 'react';
import {
    Box,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Grid, Input, InputAdornment,
    Tooltip,
    Typography
} from "@mui/material";
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import SearchIcon from '@mui/icons-material/Search';

const MainPage = (props) => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("")
    const [orderedProducts,setOrderedProducts] = useState([])

    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData == undefined) {
            navigate("/login")
        }
    },[])


    useEffect(() => {

        if (props.allProducts.length != 0) {
            let tempOrderedProducts=[]
            const rawUserData = Cookies.get("userData")

                props.allProducts.map(product => {


                    let orderedProduct = {
                        product: null,
                        totalBids: -1,
                        yourBids: -1,
                        highestId: -1

                    }
                    orderedProduct.product = product
                    if (rawUserData != undefined) {
                        const userId = JSON.parse(rawUserData).id

                        let filteredBidsByProdId = []
                        let filteredBidsByProdAndUserId = []
                        if (props.bidModels.length !== 0) {
                            filteredBidsByProdAndUserId = props.bidModels.filter(bidModel => {

                                return bidModel.productId == product.productId && bidModel.userId == userId
                            })
                            if (filteredBidsByProdAndUserId.length != 0) {
                                orderedProduct.yourBids = filteredBidsByProdAndUserId.length
                            }
                            filteredBidsByProdId = props.bidModels.filter(bidModel => {
                                return bidModel.productId === product.productId
                            })

                            if (filteredBidsByProdId.length != 0) {
                                orderedProduct.totalBids = filteredBidsByProdId.length
                                filteredBidsByProdId.reduce((a, b) => a.bidValue > b.bidValue ? a : b)
                                orderedProduct.highestId = filteredBidsByProdId.reduce((a, b) => (a.bidValue > b.bidValue&&new Date(a.placementDate) > new Date(b.placementDate)) ? a : b).userId
                            }

                        }
                    }

                    tempOrderedProducts.push(orderedProduct)

                })
                setOrderedProducts(tempOrderedProducts)


        }

    },[props.allProducts, props.bidModels])




    const handleSearch = (e) => {
      setSearch(e.target.value)
    }

    let textInput = useRef(null);



    const isImage = (url) => {
        return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
    }

    const checkYourBidIsHighest = (highestId) => {
        let isHighest=false;
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            isHighest = highestId==JSON.parse(rawUserData).id

        }
        return isHighest
    }


    const openProductPage = (index) => {
        const rawUserData = Cookies.get("userData");
        if (rawUserData == undefined) {
            toast.warn("You need to log in or sign up",{
                pauseOnHover: false
            })
            navigate("/login")
        }
        else {
            navigate("/product-view/"+(index-1))
        }

    }

    const isYourProduct = (productSellerId) => {
        let isYourProduct = false
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            const userId = JSON.parse(rawUserData).id;
            if (productSellerId == userId) {
                isYourProduct = true
            }
        }


        return isYourProduct
    }



    return (
        <>
        <Box sx={{ width: '90%', mt: 10}}

             margin={"auto"}

        >
            <Box display={"flex"}
                 padding={2}
                 maxWidth={400}
                 boxShadow={'5px 5px 10px #ccc'}
                 borderRadius={3}
                 margin={"auto"}
                 marginBottom={3}
                 sx={{
                     transition: "0.2s ease-in",
                     ":hover": {
                         cursor: "text",
                         boxShadow: '5px 5px 20px #ccc'
                     }
                 }}
                 onClick={() => {
                     setTimeout(() => {
                         textInput.current.focus();
                     }, 100);
                 }}
            >
                <Input
                    fullWidth
                    endAdornment={<InputAdornment position="end"><SearchIcon/></InputAdornment>}
                    disableUnderline
                    value={search}
                    onChange={handleSearch}
                    inputRef={textInput}
                    placeholder={"Filter by name"}
                />
            </Box>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>


            {
                <>
                    {

                        orderedProducts.filter((orderedProduct) => {
                            return search.toLocaleLowerCase() === "" ? orderedProduct : orderedProduct.product.productName.includes(search)
                        }).map(orderedProduct =>

                            <>
                                {
                                    (!orderedProduct.product.sold)&&
                                    <Grid item xs={4}
                                    >
                                        <Card sx={{
                                            minWidth: 275,
                                            padding: 2,
                                            marginBottom: 2,
                                            ":hover" : {
                                                cursor: "pointer"
                                            }
                                        }}
                                              onClick={() => openProductPage(orderedProduct.product.productId)}
                                        >

                                            <CardContent>
                                        <span style={{ display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                                            <Typography sx={{ fontSize: 14, paddingBottom: 2 }} color="text.secondary" gutterBottom>
                                            Product name: {orderedProduct.product.productName}
                                            </Typography>
                                        </span>
                                                <Typography sx={{
                                                    fontSize: 12
                                                }}>
                                                    Placement date: {orderedProduct.product.placementDate}
                                                </Typography>
                                                <CardMedia
                                                    sx={{
                                                        borderRadius: 1,
                                                    }}
                                                    component="img"
                                                    height="194"


                                                    image={isImage(orderedProduct.product.imageLink) ? orderedProduct.product.imageLink : process.env.PUBLIC_URL+"/placeholder-image.png"}
                                                    alt="Product image"
                                                />
                                            </CardContent>
                                            <CardActions sx={{ justifyContent: "space-between",
                                                ml: 0.5, mr:1
                                            }}>
                                                <Typography color={"error"}>Current bid: {String(orderedProduct.product.minPrice).length < 8 ?  orderedProduct.product.minPrice : String(orderedProduct.product.minPrice).substring(0, 4) + "...+"}$</Typography>
                                                {
                                                    !isYourProduct(orderedProduct.product.sellerId) ?
                                                        <Typography sx={{
                                                            color: "#4caf50"
                                                        }}>
                                                            {
                                                                checkYourBidIsHighest(orderedProduct.highestId) ? "Your bid is highest!" : "Place a better bid!"
                                                            }
                                                        </Typography>
                                                        :
                                                        <Tooltip title={"Your product"}
                                                                 placement={"bottom"}
                                                        >
                                                            <ChildCareIcon/>
                                                        </Tooltip>
                                                }
                                            </CardActions>
                                            <div style={{paddingBottom:4, display: "flex", flexDirection: "row", marginLeft: 13, alignItems: "center"}}>
                                                {
                                                    orderedProduct.totalBids > 0&&
                                                    <Tooltip title={"Total bids: " + orderedProduct.totalBids}>
                                                        <img
                                                            src={process.env.PUBLIC_URL + "/crowd-people-group-public-svgrepo-com.svg"}
                                                            width={25} height={25}/>
                                                    </Tooltip>
                                                }

                                                {
                                                    orderedProduct.yourBids > 0&&
                                                    <span style={{  marginLeft: "20%"}}>
                                                        <Tooltip title={"Your bids: " + orderedProduct.yourBids}>
                                                            <img src={ process.env.PUBLIC_URL +"/pictogram-of-a-person-who-raises-one-hand-svgrepo-com.svg"} width={20} height={20}/>
                                                        </Tooltip>
                                                    </span>
                                                }
                                                {
                                                    (orderedProduct.totalBids <= 0 && orderedProduct.yourBids <= 0)&&
                                                    <div style={{height:25}}></div>
                                                }
                                            </div>
                                        </Card>
                                    </Grid>
                                }

                            </>

                        )
                    }
                </>
            }
        </Grid>
        </Box>
        </>
    )

};

export default MainPage;