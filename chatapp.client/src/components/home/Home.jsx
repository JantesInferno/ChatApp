import SignIn from "../signin/SignIn";
import { useState } from 'react';



const Home = () => {

    const [user, setUser] = useState(false);

    return (
        <>
            {(!user
                ? <SignIn />
                : null // <ChatOverview chatRooms={user.chatRooms} />
            )}
        </>
    )
}

export default Home;