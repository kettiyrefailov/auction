import React, {useEffect, useState} from 'react';
import {Box, Typography} from "@mui/material";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import GavelIcon from '@mui/icons-material/Gavel';
import StoreIcon from '@mui/icons-material/Store';

import {
    IconButton,
    Tooltip
} from "@mui/material";
import UserProductList from "../components/UserProductList";
import UserBidsList from "../components/UserBidsList";
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CustomersList from "../components/CustomersList";
import AllTendersList from "../components/AllTendersList";


const Dashboard = (props) => {

    const [isAdmin, setIsAdmin] = useState(false)
    const [balance, setBalance] = useState(0)
    const [myProducts, setMyProducts] = useState([])
    const [view, setView] = useState("ypr")

    const navigate = useNavigate();

    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData == undefined) {
            navigate("/")
        }
    },[])



    useEffect(() => {
        if (props.newBalance >= 0) {
            setBalance(props.newBalance)
        }
    }, [props.newBalance, props.bidModels, props.allProducts])

    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            setBalance(JSON.parse(rawUserData).balance)
        }
    }, [])

    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            const isAdmin = JSON.parse(rawUserData).admin
            const myProductsTemp = props.allProducts.filter(product => product.sellerId == JSON.parse(Cookies.get("userData")).id)
            setMyProducts(myProductsTemp)
            setIsAdmin(isAdmin)

        }
    },[props.allProducts, props.bidModels])



    return (
        <>
            <Box display={"flex"}
                 flexDirection={"column"}
                 maxWidth={500}
                 alignItems={"start"}
                 justifyContent={"center"}
                 margin={"auto"}
                 marginTop={9}
                 boxShadow={'5px 5px 10px #ccc'}
                 sx={{
                     transition: "0.2s ease-in",
                     ":hover": {
                         boxShadow: '5px 5px 20px #ccc'
                     }
                     ,
                     pt:2,
                     pb:2,
                     borderRadius: 2
                 }}

            >
                <span style={{flexDirection: "column", marginLeft: 10}}>
                     <Typography>Current balance: {balance}$</Typography>
                    {
                        isAdmin&&
                        <Typography sx={{mt:1}}>Total earnings: {props.totalEarnings}$</Typography>
                    }
                </span>
            </Box>

            <Box sx={{ width: '6%' }}
                 margin={"auto"}
                 alignItems={"center"}
                 justifyContent={"space-between"}
                 display={"flex"}
                 flexDirection={"row"}
                 marginTop={1}
            >
                <Tooltip title={"Your products"}
                         placement={"bottom"}
                >
                    <span>
                        <IconButton
                            disabled={view==="ypr"}
                            onClick={() => setView("ypr")}
                            sx={{
                                ":disabled": {
                                    color: "success.main"
                                }
                            }}
                        >
                            <StoreIcon/>
                        </IconButton>
                    </span>
                </Tooltip>


                <Tooltip title={"Your trades"}
                         placement={"bottom"}
                >
                   <span>
                        <IconButton
                            value={"ytr"}
                            onClick={() => setView("ytr")}
                            disabled={view==="ytr"}
                            sx={{
                                ":disabled": {
                                    color: "success.main"
                                }
                            }}

                        >
                            <GavelIcon/>
                        </IconButton>
                   </span>
                </Tooltip>
                {
                    isAdmin&&
                    <>
                        <Tooltip title={"View all customers"}
                                 placement={"bottom"}
                        >
                   <span>
                        <IconButton
                            value={"cst"}
                            onClick={() => setView("cst")}
                            disabled={view==="cst"}
                            sx={{
                                ":disabled": {
                                    color: "success.main"
                                }
                            }}

                        >
                            <ContactEmergencyIcon/>
                        </IconButton>
                   </span>
                        </Tooltip>
                        <Tooltip title={"View all trades"}
                                 placement={"bottom"}
                        >
                   <span>
                        <IconButton
                            value={"atr"}
                            onClick={() => setView("atr")}
                            disabled={view==="atr"}
                            sx={{
                                ":disabled": {
                                    color: "success.main"
                                }
                            }}

                        >
                            <PriceChangeIcon/>
                        </IconButton>
                   </span>
                        </Tooltip>
                    </>
                }
            </Box>
            {
                view=="ytr"&&
                    <>
                        {
                            props.userBids.length == 0 ? <Typography sx={{marginLeft: "42%", marginTop: 5}}>You not placed bids yet</Typography>
                            :
                            <UserBidsList userBids={props.userBids} allProducts={props.allProducts} bidModels={props.bidModels} />
                        }
                    </>
            }
            {
                view=="ypr"&&
                <>
                    {
                        myProducts.length != 0 ? <UserProductList myProducts={myProducts}/>
                        :
                        <Typography sx={{marginLeft: "42%", marginTop: 5}}>You not added products yet</Typography>
                    }
                </>
            }
            {
                view=="cst"&&
                <>
                    <CustomersList allUsers={props.allUsers}
                                   allProducts={props.allProducts}
                                   blanceUpdated={props.balanceUpdated}
                    />
                </>
            }
            {
                view=="atr"&&
                <>
                    <AllTendersList allProducts={props.allProducts}/>
                </>
            }
        </>

    );
};

export default Dashboard;