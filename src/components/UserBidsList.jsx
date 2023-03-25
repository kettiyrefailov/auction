import React, {useEffect, useState} from 'react';

import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import {useNavigate} from "react-router-dom";

const UserBidsList = (props) => {

    const navigate = useNavigate();

    const [maxUserBids, setMaxUserBids] = useState([])


    const bidsProperties = [
        {name: "Product name"},
        {name: "Current price"},
        {name: "Status"},
    ]

    useEffect(() => {

        let tempUserBids = []
        const productIdsRaw = props.userBids.map(userBid => userBid.productId)
        const productIdsSet = new Set(productIdsRaw)

        for (const productIdsSetElement of productIdsSet) {
            let userBid = {
                productName:"",
                productId: -1,
                bidValue: -1,
                win: false
            }
            const tempProduct = props.allProducts.find(product => product.productId==productIdsSetElement)

            if (!tempProduct.sold) {
                const filteredBidsByProdId = props.userBids.filter(userBid => userBid.productId==productIdsSetElement&&userBid.bidValue > 0)
                if (filteredBidsByProdId.length != 0) {
                    const maxUserBid = filteredBidsByProdId.reduce((a, b) => a.bidValue > b.bidValue ? a : b)
                    if (maxUserBid.bidValue >= tempProduct.minPrice) {
                        userBid.win=true
                    }
                }
                userBid.productName=tempProduct.productName
                userBid.productId=tempProduct.productId
                userBid.bidValue=tempProduct.minPrice

                tempUserBids.push(userBid)

            }
        }
        setMaxUserBids(tempUserBids)

    },[props.bidModels, props.userBids])


    return (
        <>
            <TableContainer sx={{boxShadow: '5px 5px 20px #ccc',
                padding: 3,
                margin: "auto",
                marginTop: 3,
                maxWidth: 1000,
                backgroundColor: "rgba(168, 173, 170, 0.28)"
            }}
                            component={Paper}
            >
                <Table  sx={{ minWidth: 650}} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" colSpan={3}
                                       sx={{textDecoration: 'underline'}}
                            >
                                Your trades
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            {
                                <>
                                    {
                                        bidsProperties.map((cell) => {
                                            return (
                                                <TableCell align="center">{cell.name}</TableCell>
                                            )
                                        })
                                    }
                                </>
                            }

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            maxUserBids.map((bid,index) => (
                                <>
                                    <TableRow sx={{
                                        transition:  "0.1s linear",
                                        opacity: 0.85,
                                        ":hover": {
                                            opacity: 1,
                                            backgroundColor:"rgba(168, 173, 170, 0.05)"
                                        }
                                    }}

                                    >

                                        <TableCell align="center">

                                            <Tooltip title={"Go to " +  bid.productName + " page"}>
                                                            <span
                                                                style={{
                                                                    cursor: "pointer"

                                                                }}
                                                                onClick={() => {navigate("/product-view/"+(index))}}
                                                            > {bid.productName}</span>
                                            </Tooltip>

                                        </TableCell>
                                        <TableCell align="center">
                                                    <span>
                                                        {bid.bidValue}$
                                                    </span>
                                        </TableCell>
                                        <TableCell align="center">
                                                    <span style={{ color: bid.win ? "green" : "red"}}>
                                                        {bid.win ? "Your bid is max" : "Your bid isn't max"}
                                                    </span>
                                        </TableCell>
                                    </TableRow>
                                </>
                            ))

                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default UserBidsList;