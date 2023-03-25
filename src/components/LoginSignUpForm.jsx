import {
    Box,
    Button,
    IconButton,
    LinearProgress,
    TextField, Tooltip,
    Typography
} from "@mui/material";

import {useEffect, useState} from "react";
import CustomPasswordInput from "./CustomPasswordInput";
import LockIcon from '@mui/icons-material/Lock';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {sendApiPostRequest} from '../utils/ApiRequests'
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";


const LoginSignUpForm = (props) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [passwordRepeat, setPasswordRepeat] = useState('')
    const [passwordWeakness, setPasswordWeakness] = useState(0)
    const [checkUsername, setCheckUsername] = useState(undefined)
    const [loginResponse, setLoginResponse] = useState(undefined)
    const navigate = useNavigate();

    useEffect(()=> {
        Cookies.remove("userData")
    },[])

    useEffect(() => {
        setUsername("")
        setPassword("")
        setPasswordRepeat("")
        setCheckUsername(undefined)
        setLoginResponse(undefined)
    },[props.loginMode])

    const loginError = () => {
      return props.loginMode&&loginResponse!=undefined&&
          !loginResponse.success&&loginResponse.errorCode==1004
    }

    useEffect(() => {

        if (loginResponse!=undefined&&loginResponse.success) {
            const userData = loginResponse.user
            Cookies.set("userData", JSON.stringify(userData))
            props.loginHandler(true)
            navigate("/")
        }

        if (loginResponse!=undefined&&!loginResponse.success) {
            let errorMessage;
            switch (loginResponse.errorCode) {
                case 1000:
                    errorMessage = "Missing username"
                    break

                case 1001:
                    errorMessage = "Missing password"
                    break

                case 1002:
                    errorMessage = "Weak password"
                    break

                case 1003:
                    errorMessage = "Username already exist"
                    setCheckUsername({
                        success: false
                    })
                    break;

                case 1004:
                    errorMessage = "Wrong login credentials"
                    break

                default:
                    errorMessage = loginResponse.errorCode
                    break
            }
            toast.error("Error: " + errorMessage, {
                pauseOnHover: false
            })
        }


    }, [loginResponse])




    const enableButtonLogin = () => {
        return password=="" || username==""
    }
    
    const onLogin = (e) => {
        e.preventDefault()
        sendApiPostRequest("http://localhost:8989/login", {username, password}

        ,setLoginResponse)
      
    }
    
    const onSignUp = (e) => {
        e.preventDefault()
        sendApiPostRequest("http://localhost:8989/sign-up", {username, password}
            ,setLoginResponse)
    }

    const enableButtonSignUp = () => {
        return password=="" || username=="" ||
            passwordRepeat=="" || passwordWeakness < 60 ||
            password != passwordRepeat || (checkUsername != undefined&&!checkUsername.success)
    }

    const weaknessMessage = (messageOrStyle) => {
        if (passwordWeakness < 30) {
            return messageOrStyle ? "Weak" : "error"
        }
        else if (passwordWeakness < 60) {
            return messageOrStyle ? "Normal" : "warning"
        }
        else {
            if (passwordWeakness == 100) {
                return  messageOrStyle ? "Very strong" : "success"
            }
            else {
                return messageOrStyle ? "Strong" : "success"
            }
        }
    }


    const passwordNotMatch = () => {
        return password != passwordRepeat && (password != "" && passwordRepeat != "")
    }

    const checkPasswordWeakness = (tempPassword) => {

        let weakness = 0
        let minLen = false, containsDigit = false,
        containsCapital = false, containsSmall = false

        if (tempPassword.length > 5) {
            minLen=true
            weakness += 30

        }

        if (/[0-9]/.test(tempPassword)) {
            containsDigit=true
            weakness += 10
        }

        if (/[A-Z]/.test(tempPassword)) {
            containsCapital=true
            weakness += 10
        }
        if (/[a-z]/.test(tempPassword)) {
            containsSmall = true
            weakness += 10
        }

        if (minLen && containsSmall && containsCapital && containsDigit && tempPassword.length > 8) {
            weakness += 40
        }


        setPasswordWeakness(weakness)
    }





    const handlePasswordRepeatChange = (e) => {
        setPasswordRepeat(e.target.value);
    };


    const handlePasswordChange = (e) => {
        checkPasswordWeakness(e.target.value)
        if (e.target.value.length == 0) {
            setPasswordRepeat("")
        }
        setPassword(e.target.value);

    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };


    const sendCheckUsernameRequest = (e) => {
        e.preventDefault()
        sendApiPostRequest('http://localhost:8989/check-username', {
            username: username
        }, setCheckUsername)
    }


    return (
        <div>
            <form>
                <Box display={"flex"}
                     flexDirection={"column"}
                     maxWidth={400}
                     alignItems={"center"}
                     justifyContent={"center"}
                     margin={"auto"}
                     marginTop={0}
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
                    <Typography variant={"h4"} marginTop={1} padding={3} paddingTop={0} textAlign={"center"}>{props.loginMode ? "Login" : "Sign Up"}</Typography>
                    <span style={{width:"100%"}}>
                        <TextField

                                   sx={{ width: "70%", ml: "15%",
                                       '.MuiFormHelperText-root' : {
                                       color: checkUsername != undefined ? checkUsername.success ? "success.main" : "error.main" : ""
                                    }
                                   }}
                                   label={props.loginMode ? "Enter username" : "Choose new username"}
                                   error={loginError()}
                                   margin={"normal"}
                                   type={"text"}
                                   variant={"outlined"}
                                   value={username}
                                   color={(checkUsername != undefined&&!props.loginMode)? checkUsername.success ? "success" : "error" : ""}
                                   focused
                                   onChange={handleUsernameChange}
                                   helperText={
                                       (checkUsername != undefined&&!props.loginMode) ?
                                        checkUsername.success ? "The username is free" : "The username already taken" : !props.loginMode ? " " : ""
                                   }
                                   onInput={() => setCheckUsername(undefined)}

                        />
                        {
                            (!props.loginMode && username!="")&&
                            <Tooltip title={"Check if username already exist"}
                                     placement={"right-end"}

                            >
                                <IconButton sx={{ mt: "5%", ml: 2}}
                                            color={"primary"}
                                            onClick={sendCheckUsernameRequest}
                                >
                                    <QuestionMarkIcon/>
                                </IconButton>
                            </Tooltip>
                        }
                    </span>
                    <CustomPasswordInput
                                         passwordNotMatch={passwordNotMatch}
                                         loginMode={props.loginMode}
                                         password={password}
                                         handlePasswordChange={handlePasswordChange}
                                         error={loginError()}
                    />



                    {
                        !props.loginMode &&
                        <>
                            <CustomPasswordInput
                                passwordNotMatch={passwordNotMatch}
                                repeat={true}
                                loginMode={props.loginMode}
                                password={passwordRepeat}
                                handlePasswordChange={handlePasswordRepeatChange}
                                passwordIsEmpty={password.length==0}
                            />
                            <Box sx={{ display: 'flex',
                                alignItems: 'center',
                                minWidth: 250,
                                mr: '7%',
                                opacity: password != "" || passwordRepeat != "" ? 1 : 0 }}>
                                <Box sx={{ width: '100%', mr: 2 }}>
                                    <LinearProgress variant="determinate"
                                                    value={passwordWeakness}
                                                    color={weaknessMessage(false)}
                                    />
                                </Box>
                                <Box>
                                    <Typography sx={{ width: 80}} variant="body2" color="text.secondary">
                                        {
                                            weaknessMessage(true)
                                        }
                                    </Typography>
                                </Box>
                                <LockIcon sx={{opacity: passwordWeakness < 60 ? 0 : 1}} color={passwordWeakness > 60 ? "success" : "warning"}/>
                            </Box>
                            <Typography sx={{
                                fontSize: 10, mr: "35%",
                                opacity:password != "" || passwordRepeat != "" ? 1 : 0
                            }}>Password strength</Typography>
                        </>
                    }




                    <Tooltip title={
                        !enableButtonLogin() || ! enableButtonSignUp() ? "":
                        props.loginMode ? "You need to enter both username and password" :
                            "Choose unique username and strong password to create new user"


                        }
                        placement={"left-end"}
                    >
                        <span>
                            <Button sx={{
                                marginTop: 2,
                                borderRadius: 3,
                                transition: "0.3s ease-in",
                                minWidth: 100

                            }}

                                    disabled={props.loginMode ? enableButtonLogin() : enableButtonSignUp()}
                                    onClick={props.loginMode ? onLogin : onSignUp}
                                    variant={"contained"}
                                    color={"warning"}>
                                    {
                                        props.loginMode ? "Login" : "Sign Up"
                                    }
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </form>
        </div>
    );
};

export default LoginSignUpForm;