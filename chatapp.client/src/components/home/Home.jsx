/* eslint-disable react/prop-types */
import SignIn from "../signin/SignIn";
import ChatOverview from "../chatoverview/ChatOverview";


const Home = () => {

    return (
        <>
            {!sessionStorage.token
                ? <SignIn />
                : <ChatOverview />
            }
        </>
    )
}

export default Home;