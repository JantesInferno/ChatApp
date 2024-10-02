/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'
import './App.css';
import Home from './components/home/Home';
import SignIn from './components/signin/SignIn';
import SignUp from './components/signup/SignUp';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatOverview from './components/chatoverview/ChatOverview';

function App() {

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/signin' element={<SignIn />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/chat' element={<ChatOverview />} />
        </Routes>
    );
}

export default App;