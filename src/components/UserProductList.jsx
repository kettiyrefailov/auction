import React from 'react';
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




const UserProductList = (props) => {


    const productsProperties = [
        {name: "Product name"},
        {name: "Current bid"},
        {name: "Status"},
    ]



    const navigate = useNavigate();


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
                                <TableCell align="center" colSpan={4}
                                           sx={{textDecoration: 'underline'}}
                                >
                                    Your products
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                {
                                    <>
                                        {
                                            productsProperties.map((cell) => {
                                                return (

                                                    <TableCell align="center">{cell.name}</TableCell>
                                                )
                                            })
                                        }
                                    </>
                                }
                                <TableCell align="right"></TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                props.myProducts.sort((a, b) => {return a.sold - b.sold}).map((product) => (

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
                                                        {
                                                            product.sold ?

                                                                <span
                                                                    style={{
                                                                        cursor: "default",
                                                                        opacity: 0.5
                                                                    }}
                                                                > {product.productName}
                                                            </span>
                                                                :
                                                                <Tooltip title={"Go to " +  product.productName + " page"}>
                                                            <span
                                                                style={{
                                                                    cursor: "pointer"

                                                                }}
                                                                onClick={() => {navigate("/product-view/"+(product.productId-1))}}
                                                            > {product.productName}</span>
                                                                </Tooltip>
                                                        }
                                                    </TableCell>
                                                    <TableCell align="center">
                                                    <span>
                                                        {product.minPrice}$
                                                    </span>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                    <span>
                                                        {product.sold ? "Sold" : "Open"}
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

export default UserProductList;