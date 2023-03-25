import React, {useEffect, useState} from 'react';
import {
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip
} from "@mui/material";
import Cookies from "js-cookie";
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalAtmTwoToneIcon from '@mui/icons-material/LocalAtmTwoTone';
import CheckTwoToneIcon from '@mui/icons-material/CheckTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import {sendApiPostRequest} from "../utils/ApiRequests";
import {toast} from "react-toastify";


const CustomersList = (props) => {

    const [newBalance, setNewBalance] = useState(undefined)
    const [newBalanceResponse, setNewBalanceResponse] = useState(undefined)
    const [adminId, setAdminId] = useState(-1)
    const [userToFind, setUserToFind] = useState({
        userId:-1,
        changeMode: false
    })

    useEffect(() => {
        if (newBalanceResponse!=undefined&&newBalanceResponse.success) {
            toast.success("Balance updated successfully", {
                pauseOnHover: false
            })
            props.blanceUpdated()
            setUserToFind({
                userId:-1,
                changeMode: false
            })
        }

        if (newBalanceResponse!=undefined&&!newBalanceResponse.success) {
            let errorMessage;
            switch (newBalanceResponse.errorCode) {
                case 1006:
                    errorMessage = "No such user"
                    break
                case 1009:
                    errorMessage = "No enough privileges"
                    break
                case 1010:
                    errorMessage = "transaction error"
                    break
                default:
                    errorMessage = newBalanceResponse.errorCode
                    break

            }
            toast.error("Error: " + errorMessage, {
                pauseOnHover: false
            })
        }


    }, [newBalanceResponse])

    const handleNewBalanceChange = (e) => {
        let isNum = /^[+-]?\d+(\.\d+)?$/.test(e.target.value);
        if (isNum&&!e.target.value.includes('-')) {
            if (e.target.value.toString().split('.')[1].length <= 2) {
                setNewBalance(e.target.value)
            }
        }
    }

    const updateBalance = (userId) => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            const token = JSON.parse(rawUserData).token
            sendApiPostRequest("http://localhost:8989/update-balance", {token, ownerId:userId, newBalance:newBalance},setNewBalanceResponse)

        }


    }



    const userInEditMode = (userId) => {
        return userToFind.userId==userId&&userToFind.changeMode
    }


    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            const userData = JSON.parse(rawUserData)
            if (userData.admin) {
                setAdminId(userData.id)
            }
        }
    }, [props.allUsers])

    const getOpenTenders = (userId) => {
        const openUserTenders = props.allProducts.filter(product => product.sellerId==userId&&!product.sold)

        return openUserTenders.length
    }

    const userProperties = [
        {name: "User name"},
        {name: "Current balance"},
        {name: "Total open tenders"},
    ]

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
                                All users
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            {
                                <>
                                    {
                                        userProperties.map((cell) => {
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
                            props.allUsers.map((user) => (
                                <>
                                    <TableRow sx={{
                                        transition:  "0.1s linear",
                                        opacity: 0.85,
                                        height: 80,
                                        ":hover": {
                                            opacity: 1,
                                            backgroundColor:"rgba(168, 173, 170, 0.05)"
                                        }
                                    }}

                                    >

                                        <TableCell align="center">


                                             <span> {user.username}</span>

                                        </TableCell>
                                        <TableCell align="center" sx={{
                                            width: 300
                                        }} >
                                                            <span style={{
                                                            }}>
                                                                {
                                                                    (user.id != adminId&&(userInEditMode(user.id)))&&
                                                                    <>

                                                                        <Tooltip title={"Cancel"} placement={"left"}>
                                                                   <span>
                                                                        <IconButton onClick={() => {
                                                                            setUserToFind({
                                                                                userId: -1,
                                                                                changeMode: false
                                                                            })
                                                                            setNewBalance(undefined)
                                                                        }}>
                                                                    <ClearTwoToneIcon fontSize={"small"} color={"error"}/>
                                                                </IconButton>
                                                                   </span>
                                                                        </Tooltip>
                                                                        <Tooltip title={"Update balance"} placement={"right"}>
                                                                   <span>
                                                                       <IconButton
                                                                           onClick={()=>updateBalance(user.id)}
                                                                       >
                                                                           <CheckTwoToneIcon fontSize={"small"} color={"warning"}/>
                                                                       </IconButton>
                                                                   </span>
                                                                        </Tooltip>
                                                                    </>
                                                                }

                                                            </span>
                                                            <span
                                                                style={{
                                                                    opacity: adminId==user.id ? 0.5 : 1,
                                                                    marginRight: userInEditMode(user.id) ? 100 : 0

                                                                }}
                                                            >
                                                            <span>{userInEditMode(user.id) ?
                                                                <span style={{
                                                                }}>

                                                                        <TextField
                                                                            type="number"
                                                                            variant={"standard"}
                                                                            value={newBalance==undefined ? user.balance : newBalance}
                                                                            onChange={handleNewBalanceChange}


                                                                            sx={{
                                                                                width: 60,
                                                                                marginTop: 0.5
                                                                            }}
                                                                            InputProps={{ inputProps: { min: 0 }}}
                                                                        />
                                                                </span>
                                                                :
                                                                <span>{user.balance}</span>}</span> {(adminId != user.id)?
                                                                <span>
                                                                    <span>
                                                                        <Tooltip title={(!userToFind.changeMode)&&"Change user balance"}>
                                                                            <span>
                                                                                <IconButton
                                                                                    disabled={userToFind.changeMode}
                                                                                    onClick={()=> setUserToFind({
                                                                                        userId: user.id,
                                                                                        changeMode: !userToFind.changeMode
                                                                                    })}

                                                                                >
                                                                                {
                                                                                    userInEditMode(user.id) ? <LocalAtmTwoToneIcon color={"success"}/> : <LocalAtmIcon/>
                                                                                }
                                                                            </IconButton>
                                                                            </span>
                                                                        </Tooltip>
                                                                    </span>
                                                                </span>
                                                                : <span style={{marginLeft: 5}}><AttachMoneyIcon/></span>
                                                            } </span>
                                        </TableCell>
                                        <TableCell align="center">
                                                    <span>
                                                        {getOpenTenders(user.id)}
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

export default CustomersList;