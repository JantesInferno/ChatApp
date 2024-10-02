/* eslint-disable no-unused-vars */
import { Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './signin.css';

const SignIn = () => {
    const apiUrl = import.meta.env.VITE_REACT_API_URL;

    const [username, setUsername] = useState({ value: '' });
    const [password, setPassword] = useState({ value: '' });
    const [isError, setIsError] = useState(false);
    const [authError, setAuthError] = useState('');

    const states = [username, password];

    const navigate = useNavigate();

    const validateInput = async (e) => {

        setAuthError('');
        setIsError(false);

        let valid = true;
        states.map(state => {
            if (state.value == "" || (state.type === 'password' && state.value.length < 6)) {
                setIsError(true);
                valid = false;
            }
        })

        if (valid) {
            const res = await signInUser(username.value, password.value);

            
            if (res == 401) {
                setAuthError('Invalid username/password.');
                console.log(res);
            }
            else if (res == 400) {
                setAuthError('Fill in all input fields.');
                console.log(res);
            }
            else if (res == 200 || res.username) {
                setPassword({ value: '' });
                setUsername({ value: '' });
                sessionStorage.setItem('token', res.token);
                sessionStorage.setItem('username', res.username);
                navigate("/chat");
            }
            else {
                setAuthError('An unexpected error occurred. Please try again later.');
                console.log(res);
            }
        }
        e.preventDefault();
    }

    const signInUser = async (username, password) => {

        const url = `${apiUrl}/api/signin`;

        const result = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            credentials: 'include',
            body: JSON.stringify({ "Username": username, "Password": password }),
        })
            .then(response => {
                if (response.ok)
                    return response.json();
                else
                    return response.status;
            })
            .catch(error => {
                console.log(error);
                return 500;
            });

        return result.username ? result : 200;
    }

    return (
        <>
            <form className='form'>
                <div className='signin'>
                    <h1>Sign In</h1>
                    {authError != '' ? (
                        <h4 style={{ color: '#ad443d', margin: '0', padding: '0' }}>{authError}</h4>
                    ) : null}

                    <TextField color='action' label="Username" type="text" variant="filled"
                        value={username.value} error={isError && username.value === ""} helperText={isError && username.value === "" ? 'Required field' : ''}
                        onChange={event => setUsername({ value: event.target.value })}
                        sx={{ width: '60%', input: { color: '#FFF' }, label: { color: '#FFF' } }} />

                    <TextField color="action" label="Password" type="password" variant="filled"
                        value={password.value} error={isError && password.value.length < 6} helperText={isError && password.value.length < 6 ? 'Atleast 6 characters' : ''}
                        onChange={event => setPassword({ type: 'password', value: event.target.value })}
                        sx={{ width: '60%', input: { color: '#FFF' }, label: { color: '#FFF' } }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '60%', margin: '0 auto' }}>
                        <Typography variant='body2' sx={{ color: '#FFF', marginLeft: '5%' }}>New account?</Typography>
                        <Link to='/signup' >
                            <Button type="submit" variant='body2' sx={{ textTransform: 'none', color: '#FFF', ':hover': { bgcolor: '#343434' } }}>
                                Create Account
                            </Button>
                        </Link>
                    </div>
                </div>

                <Button type='button' sx={{ width: '60%', color: '#FFF', bgcolor: 'primary.main', ':hover': { bgcolor: '#143954' } }} onClick={validateInput} >
                    Sign in
                </Button>
            </form>

        </>
    )
}

export default SignIn;