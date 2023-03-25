import React from 'react';
import {GlobalStyles, IconButton, InputAdornment, TextField, Tooltip} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useState} from "react";

const CustomPasswordInput = (props) => {

    const [showPassword, setShowPassword] = useState(false)

    const globalStyle = {
        "input::-ms-reveal, input::-ms-clear": {
            display: "none"
        }
    };

    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <GlobalStyles styles={globalStyle} />
            <Tooltip title={!props.loginMode && props.password.length == "" && !props.repeat? "Minimum length 6, at least one lower and upper case letter, at least one digit " : ""}>
            <TextField
                label={props.loginMode ? "Enter the password" :
                    props.repeat ? "Repeat the password" : "Choose strong password"
            }
                error={(props.passwordNotMatch() && !props.loginMode) || props.error}
                variant="outlined"
                type={showPassword ? "text" : "password"}
                margin={"normal"}
                sx={{width: "70%"}}
                value={props.password}
                onChange={props.handlePasswordChange}
                helperText={props.repeat&&(props.passwordNotMatch() ? "Passwords do not match" : " ")}
                disabled={props.repeat&&props.passwordIsEmpty}

                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                disabled={props.repeat&&props.passwordIsEmpty}
                            >
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            </Tooltip>
        </>
    );
};

export default CustomPasswordInput;