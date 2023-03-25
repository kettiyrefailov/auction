import React, {useEffect, useState} from 'react';
import {AppBar, Badge, Box, Button, IconButton, List, Toolbar, Tooltip, Typography} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import GavelIcon from '@mui/icons-material/Gavel';
import {sendApiGetRequest} from '../utils/ApiRequests'




const buttonSX = {
    margin: "0 0 0 15px",
    transition: "0.2s ease-in",
    "&:hover": {
        backgroundColor:"rgba(133, 127, 255, 0.36)"
    }
}

const Header = (props) => {

   const [loggedIn, setLoggedIn] = useState(false)
   const [username, setUsername] = useState("")
   const [userBidsCounter, setUserBidsCounter] = useState(0)

    const nav = (path) => {
       navigate(path)
    }


    useEffect(() => {
            const rawUserData = Cookies.get("userData")
            if (rawUserData != undefined) {
                const userId = JSON.parse(rawUserData).id
                let tempUserBids = props.bidModels.filter(bidModel => bidModel.userId == userId)
                let byProductIdArray = tempUserBids.map(tempUserBid => tempUserBid.productId)
                let uniqueProductIds = new Set(byProductIdArray)

                if (props.allProducts.length != 0) {
                    let bidsCounter = 0;
                    for (const uniqueProductId of uniqueProductIds) {
                        if (!props.allProducts.find(product => product.productId===uniqueProductId).sold) {
                            bidsCounter++
                        }
                    }
                    setUserBidsCounter(bidsCounter)
                }


                props.handleUserBids(tempUserBids)
            }

    },[props.bidModels, loggedIn, props.allProducts])


    useEffect(() => {
        const rawUserData = Cookies.get("userData");
        if (rawUserData != undefined) {
            setLoggedIn(true)
            setUsername(JSON.parse(rawUserData).username)
        }
        else {
            setLoggedIn(false)
        }
    })



    const links = [
        {name: "login or sign up", path: "/login"}
    ]

    const linksLoggedIn = [
        {name: "main", path: "/"},
        {name: "Add item", path: "/add-item"},
        {name: "Dashboard", path: "/dashboard"},
        {name: "Logout", path: "/login"}

    ]

    
    const logout = (e) => {
        e.preventDefault()
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            let userId = JSON.parse(rawUserData).id
            sendApiGetRequest('http://localhost:8989/remove-sse?userId=' + userId);
            Cookies.remove("userData")
            props.logoutHandler(false)
            navigate("/login")

        }

    }



    const navigate = useNavigate();

    return (
        <>
            <Box sx={{flexGrow: 1}}>
                <AppBar position={"fixed"}
                >
                    <Toolbar sx={{
                        justifyContent: "space-between"
                    }}>
                        <span>
                            <List sx={{display: "flex", marginLeft: 2, alignItems: "center"}}>
                            { (loggedIn ? linksLoggedIn : links).map(({name, path}) => (

                                <Button
                                    sx={buttonSX}
                                    variant="text"
                                    onClick={loggedIn&&path=="/login" ? logout : () => nav(path)}
                                    color={"warning"}
                                >
                                    {
                                        name
                                    }
                                </Button>
                            ))}
                            {
                                loggedIn&&
                                <Typography
                                    color={"#e0e0e0"}
                                    sx={{
                                        ml: {
                                            sm: 1,
                                            md: 5,
                                            lg: 10,
                                            xl: 15,

                                        },
                                        pl: {
                                            sm: 1,
                                            md: 5,
                                            lg: 10,
                                            xl: 15,

                                        }
                                    }}
                                >
                                    Welcome to auction, {username}!

                                </Typography>
                            }
                        </List>

                        </span>
                        {
                            (loggedIn&&userBidsCounter!=0)&&
                            <span style={{
                                marginRight: 10
                            }}>
                                <Tooltip title={"Your trades"}>
                                    <span>
                                        <Badge badgeContent={userBidsCounter}
                                           sx={{
                                               paddingTop: .5,
                                               paddingRight: .5,
                                           }}
                                           color={"warning"}
                                        >
                                            <GavelIcon
                                                sx={{
                                                    color: "white"
                                                }}
                                            />
                                        </Badge>
                                    </span>
                                </Tooltip>
                            </span>
                        }
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    );
};

export default Header;