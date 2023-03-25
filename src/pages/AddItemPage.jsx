import React, {useEffect, useState} from 'react';
import {Box, Button, Checkbox, InputAdornment, TextField, Tooltip, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import {sendApiPostRequest} from "../utils/ApiRequests";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const AddItemPage = (props) => {

    const [productDescription, setProductDescription] = useState("")
    const [productName, setProductName] = useState("")
    const [productMinBid, setProductMinBid] = useState(1)
    const [productImageURL, setProductImageURL] = useState("")
    const [urlIsValid, setUrlIsValid] = useState(true)
    const [addProductResponse, setAddProductResponse] = useState(undefined)
    const [balance, setBalance] = useState(0)


    const navigate = useNavigate();

    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData == undefined) {
            navigate("../login");
        }
        else {
            setBalance(JSON.parse(rawUserData).balance)
        }
    },[props.newBalance])




    useEffect(() => {
        if (addProductResponse!=undefined&&addProductResponse.success) {

            const rawUserData = Cookies.get("userData")
            if (rawUserData != undefined) {
                const userData = JSON.parse(rawUserData)
                userData.balance = userData.balance-2
                Cookies.remove("userData")
                Cookies.set("userData", JSON.stringify(userData));
            }

            toast.success("Item added successfully", {
                pauseOnHover: false
            })
            setProductDescription("")
            setProductName("")
            setProductMinBid(1)
            setProductImageURL("")
            setUrlIsValid(true)

        }
        else if (addProductResponse!=undefined&&!addProductResponse.success) {

            toast.error("Error",{
                pauseOnHover: false
            })
        }
    }, [addProductResponse])
    
    const addProduct = () => {
        const token = JSON.parse(Cookies.get("userData")).token;
        sendApiPostRequest("http://localhost:8989/add-product",
            {

                token, productName,
                productMinBid,
                productImageURL, productDescription

                }, setAddProductResponse)

    }



    const handleImageURLChange = (e) => {
        let url = e.target.value
            setProductImageURL(url)
    }

    const checkURL = () => {
        let res =
            productImageURL.match(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi)
        if (res !== null || productImageURL == "") {
            setUrlIsValid(true)
        }
        else {
            setUrlIsValid(false)

        }


    }

    const handleProductNameChange = (e) => {
        setProductName(e.target.value)
    }

    const handleProductMinBidChange = (e) => {
        let isNum = /^[+-]?\d+(\.\d+)?$/.test(e.target.value);
        if (isNum) {
            setProductMinBid(e.target.value)
        }
    }


    const handleProductDescriptionChange = (e) => {
        if (e.target.value.length < 256) {
            setProductDescription(e.target.value)
        }
    }

    return (
        <>
            <form>
                <Box display={"flex"}
                     flexDirection={"column"}
                     maxWidth={400}
                     alignItems={"center"}
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
                    <Typography variant={"h4"}
                                marginTop={1} padding={3}
                                paddingBottom={1}
                                paddingTop={0} textAlign={"center"}>
                                Add item
                    </Typography>

                    <span style={{display: "flex", flexDirection: "row"}}>
                            <TextField
                                sx={{
                                    width: "70%"
                                }}
                                value={productName}
                                onChange={handleProductNameChange}
                                label={"Enter the product name"}
                                margin={"normal"}
                                type={"text"}
                                variant={"standard"}

                            />
                            <TextField
                                type="number"
                                variant={"standard"}
                                label={"Minimal bid"}
                                value={productMinBid}
                                onChange={handleProductMinBidChange}
                                sx={{
                                    mt:2,
                                    ml:10,
                                    width: 150,
                                }}
                                InputProps={{ inputProps: { min: 1 } }}

                            />
                            <Typography sx={{
                                mt:4.4,
                            }}>$</Typography>
                    </span>

                    <TextField
                        fullWidth
                        error={!urlIsValid}
                        label={"Enter the image link"}
                        margin={"normal"}
                        type={"text"}
                        variant={"standard"}
                        value={productImageURL}
                        onChange={handleImageURLChange}
                        onBlur={checkURL}
                        onKeyUp={!urlIsValid ? checkURL : null}
                        helperText={urlIsValid ? " " : "URL is not valid"}

                    />
                    <TextField
                        sx={{
                            mt: 2
                        }}
                        value={productDescription}
                        onChange={handleProductDescriptionChange}
                        fullWidth
                        label={"Chars left: " + (255-productDescription.length)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        placeholder={"Enter the short product description"}
                        multiline
                        rows={4}
                    />

                    <Tooltip title={balance < 2 ? "Your balance is less than 2" : ""}>
                        <span>
                            <Button
                                disabled={productName=="" || !urlIsValid || balance < 2}
                                variant={"contained"}
                                color={"success"}
                                sx={{
                                    mt: 2
                                }}
                                onClick={addProduct}
                            >
                        Add product
                    </Button>
                        </span>
                    </Tooltip>

                </Box>
            </form>
        </>
    );
};

export default AddItemPage;