import React, {useEffect, useState} from 'react';
import {Box, IconButton, Tooltip} from "@mui/material";
import LoginSignUpForm from "../components/LoginSignUpForm";
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Cookies from "js-cookie";
import {toast} from "react-toastify";
import { useNavigate } from "react-router-dom";


const LogInSignUpPage = (props) => {

    const [loginMode, setLoginMode] = useState(false)
    const navigate = useNavigate();


    const handleLogInModeChange = () => {
        setLoginMode(!loginMode)
    }

    useEffect(() => {
        const rawUserData = Cookies.get("userData");
        if (rawUserData != undefined) {
            toast.info("You already logged in",{
                pauseOnHover: false
            })
            navigate("/")
        }
    },[])

    return (
        <>
            <Box sx={{ width: '6%' }}
                 margin={"auto"}
                 alignItems={"center"}
                 justifyContent={"space-between"}
                 display={"flex"}
                 flexDirection={"row"}
                 marginTop={9}
            >
                <Tooltip title={"Login"}
                         placement={"left"}
                >
                    <span>
                        <IconButton
                            disabled={loginMode}
                            onClick={handleLogInModeChange}
                            sx={{
                                ":disabled": {
                                    color: "success.main"
                                }
                            }}
                        >
                            <LoginIcon/>
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title={"SignUp"}
                         placement={"right"}
                >
                   <span>
                        <IconButton
                            onClick={handleLogInModeChange}
                            disabled={!loginMode}
                            sx={{
                                ":disabled": {
                                    color: "success.main"
                                }
                            }}

                        >
                            <PersonAddIcon/>
                        </IconButton>
                   </span>
                </Tooltip>

            </Box>
            <LoginSignUpForm loginMode={loginMode}
                             handleIsAdmin={props.handleIsAdmin}
                             handleUserName={props.handleUserName}
                             loginHandler={props.loginHandler}

            />


        </>
    );
};

export default LogInSignUpPage;