import './App.css';
import Header from "./components/Header";
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import MainPage from "./pages/MainPage";
import LogInSignUpPage from "./pages/LogInSignUpPage";
import AddItemPage from "./pages/AddItemPage";
import {useState} from "react";
import ItemPage from "./pages/ItemPage";
import Dashboard from "./pages/Dashboard";
import {useEffect} from "react";
import {sendApiGetRequest, sendApiPostRequest} from "./utils/ApiRequests";
import React from "react";
import Cookies from "js-cookie";
import {ToastContainer,toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';




function App() {


    const [loggedIn, setLoggedIn] = useState(false)
    const [allProductsResponse, setAllProductsResponse] = useState();
    const [allBidsResponse, setAllBidsResponse] = useState()
    const [userBids, setUserBids] = useState([])
    const [username, setUsername] = useState("")
    const [allUsersResponse, setAllUsersResponse] = useState()
    const [newBalance, setNewBalance] = useState(-1)
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [eventData, setEventData] = useState(undefined)


    const newBalanceHandler = (e) => {
        setNewBalance(e)
    }


    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            const userData = JSON.parse(rawUserData)
            const token = userData.token
            const admin = userData.admin

            if (eventData != undefined) {
                if (eventData.eventCode === 10001) {


                    if (userData.id == eventData.userId) {
                        toast.info("New price: " + eventData.newPrice + "$ for product " + eventData.productName, {
                            pauseOnHover: false
                        })
                    }
                    if (admin) {
                        sendApiPostRequest("http://localhost:8989/get-all-users", {token}
                            , setAllUsersResponse)
                    }
                    sendApiGetRequest("http://localhost:8989/get-all-products", setAllProductsResponse)
                    sendApiGetRequest("http://localhost:8989/get-all-bids", setAllBidsResponse)

                }
                else if (eventData.eventCode === 10002) {
                    if(userData.id===eventData.userId) {
                        let oldUserData = userData
                        oldUserData.balance=eventData.newPrice
                        Cookies.remove("userData")
                        Cookies.set("userData", JSON.stringify(oldUserData))
                        setNewBalance(eventData.newPrice)
                        toast.info("Your balance updated to " + eventData.newPrice + "$" , {
                            pauseOnHover: false
                        })

                    }

                }
                else if (eventData.eventCode === 10003) {
                    sendApiGetRequest("http://localhost:8989/get-all-products", setAllProductsResponse)
                    sendApiPostRequest("http://localhost:8989/get-all-users", {token}
                        ,setAllUsersResponse)

                }
                else if (eventData.eventCode === 10004) {
                    sendApiPostRequest("http://localhost:8989/get-all-users", {token}
                        ,setAllUsersResponse)

                    toast.info("New user added" , {
                        pauseOnHover: false
                    })
                }
                else if (eventData.eventCode === 10005) {
                    const userData = JSON.parse(rawUserData)
                    userData.balance = eventData.newPrice;
                    Cookies.remove("userData")
                    Cookies.set("userData", JSON.stringify(userData))
                    setNewBalance(eventData.newPrice)

                }

                else if (eventData.eventCode === 10006) {
                    sendApiGetRequest("http://localhost:8989/get-all-products", setAllProductsResponse)

                    if (admin) {
                        sendApiPostRequest("http://localhost:8989/get-all-users", {token}
                            , setAllUsersResponse)
                    }
                    if (userData.id == eventData.userId) {
                        toast.info("You win the lot " + eventData.productName + " for " + eventData.newPrice + "$", {
                            pauseOnHover: false
                        })
                    }
                }


            }
        }
    }, [eventData])

    const loginHandler = (event) => {
        setLoggedIn(event)
    }




    const balanceUpdated = () => {

            const rawUserData = Cookies.get("userData")
            if (rawUserData != undefined) {
                const userData = JSON.parse(rawUserData)
                if (userData.admin) {
                    const token = userData.token
                    sendApiPostRequest("http://localhost:8989/get-all-users", {token}
                        , setAllUsersResponse)
                }

            }

    }



    useEffect(() => {
        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            const userData = JSON.parse(rawUserData)
            if (userData.admin) {
                const token = userData.token
                sendApiPostRequest("http://localhost:8989/get-all-users", {token}
                    ,setAllUsersResponse)
            }
        }
    },[loggedIn])


    useEffect(() => {
        const rawUserData = Cookies.get("userData");
        if (rawUserData != undefined) {
            setUsername(JSON.parse(rawUserData).username)
        }
    })



    const handleUserBids = (userBidsArray) => {
        setUserBids(userBidsArray)
    }


    useEffect(() => {
        sendApiGetRequest("http://localhost:8989/get-all-bids", setAllBidsResponse)
    },[loggedIn])

    useEffect(() => {
        sendApiGetRequest("http://localhost:8989/get-all-products", setAllProductsResponse)

    }, [loggedIn])

    useEffect(() => {
        let totalEarned = 0
        if (allBidsResponse!=undefined) {
            totalEarned += allBidsResponse.bidModels.length


        }
        if (allProductsResponse!=undefined) {
            totalEarned += allProductsResponse.products.length*2

        }
        if (allProductsResponse!=undefined) {
            for (const product of allProductsResponse.products) {
                if (product.sold) {
                    totalEarned += (product.minPrice * 0.05)
                }
            }
        }
        setTotalEarnings(totalEarned)

    },[allBidsResponse, allProductsResponse])

    useEffect(() => {
        if (allProductsResponse!=undefined) {
            Cookies.set("totalProducts", allProductsResponse.products.length)
        }
    },[allProductsResponse])





    useEffect(() => {


        const rawUserData = Cookies.get("userData")
        if (rawUserData != undefined) {
            let userId = JSON.parse(rawUserData).id

            const source = new EventSource('http://localhost:8989/stream?userId=' + userId);
            source.onmessage = event => {
                if(event.data != undefined) {
                    const eventData = JSON.parse(event.data)
                    setEventData(eventData)
                }

            }
            return () => source.close();

        }



    },[loggedIn]);


    return (
      <>
          <BrowserRouter>
                  <ToastContainer/>
                  <Header bidModels={allBidsResponse==undefined ? [] : allBidsResponse.bidModels}
                          allProducts={allProductsResponse==undefined ? [] :  allProductsResponse.products}
                          handleUserBids={handleUserBids}
                          username={username}
                          loggedIn={loggedIn}
                          logoutHandler={loginHandler}

                  />
                  <Routes>
                      <Route path={"/"} element={<MainPage
                            allProducts={allProductsResponse==undefined ? [] :  allProductsResponse.products}
                            bidModels={allBidsResponse==undefined ? [] : allBidsResponse.bidModels }
                        />
                      }/>
                      <Route path={"/login"} element={ <LogInSignUpPage loginHandler={loginHandler}/>}/>
                      <Route path={"/add-item"} element={<AddItemPage newBalance={newBalance}/>}/>
                      <Route path={"/product-view/"} element={<MainPage
                          allProducts={allProductsResponse==undefined ? [] :  allProductsResponse.products}
                          bidModels={allBidsResponse==undefined ? [] : allBidsResponse.bidModels }
                      />
                      }/>
                      <Route exact path={"/product-view/:id"} element={
                          <ItemPage
                              allProductsResponse={setAllProductsResponse}
                              allBidsResponse={setAllBidsResponse}
                              allProducts={allProductsResponse == undefined ? [] : allProductsResponse.products}
                              balanceUpdated={balanceUpdated}
                              bidModels={allBidsResponse==undefined ? [] : allBidsResponse.bidModels }
                              setAllProductsResponse={setAllProductsResponse}
                              newBalanceHandler={newBalanceHandler}
                              newBalance={newBalance}
                          />
                      }/>
                      <Route path={"/dashboard"} element={<Dashboard
                          allProducts={allProductsResponse!=undefined ? allProductsResponse.products : []}
                          bidModels={allBidsResponse==undefined ? [] : allBidsResponse.bidModels }
                          userBids={userBids}
                          allUsers={allUsersResponse != undefined ? allUsersResponse.users : []}
                          balanceUpdated={balanceUpdated}
                          newBalance={newBalance}
                          totalEarnings={totalEarnings}
                      />
                      }/>}/>

                      <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>

          </BrowserRouter>
      </>
  );
}

export default App;
