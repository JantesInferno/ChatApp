import { Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// ******************************** TODO ********************************
// Confirm password

const SignUp = () => {
    const apiUrl = import.meta.env.VITE_REACT_API_URL;

    const [username, setUsername] = useState({ value: '' });
    const [password, setPassword] = useState({ value: '' });
    const [isError, setIsError] = useState(false);
    const [authError, setAuthError] = useState('');

    const states = [username, password];

    const navigate = useNavigate();

    const createUser = async (e) => {

        setAuthError('');
        setIsError(false);

        let valid = true;
        // validate password
        states.map(state => {
            if (state.value == "" || (state.type === 'password' && state.value.length < 6)) {
                setIsError(true);
                valid = false;
            }
        })

        if (valid) {
            const result = await createUserAccount(username.value, password.value);

            // check http status code and act accordingly, setting AuthError for ui feedback
            if (result == 400) {
                setAuthError('Username must be unique.');
            }
            else if (result == 200) {
                setUsername({ value: '' });
                setUsername({ value: '' });
                navigate('/signin');
            }
            else {
                setAuthError('An unexpected error occurred. Please try again later.');
            }
        }
        else {
            e.preventDefault();
        }
    }

    const createUserAccount = async (username, password) => {
        const url = `${apiUrl}/api/signup`;

        const result = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "username": username,
                "password": password
            })
        })
            .then(response => {
                if (response.ok)
                    return 200;
                else
                    return response.status;
            })
            .catch(error => {
                console.log(error);
                return 500;
            });

        return result;
    }


    return (
        <>
            
            <form className='form'>
                <div className='signup'>
                    <h1>Create new account</h1>
                    {authError != '' ? (
                        <h4 style={{ color: '#ad443d', margin: '0', padding: '0' }}>{authError}</h4>
                    ) : null}

                    <TextField color="action" label="Username" variant="filled"
                        value={username.value} error={isError && username.value === ""} helperText={isError && username.value === "" ? 'Required field' : ''}
                        onChange={event => setUsername({ value: event.target.value })}
                        sx={{ width: '60%', input: { color: '#FFF' }, label: { color: '#FFF' } }}
                    />

                    <TextField color="action" label="Password" variant="filled"
                        value={password.value} error={isError && password.value.length < 6} helperText={isError && password.value.length < 6 ? 'Atleast 6 characters' : ''}
                        onChange={event => setPassword({ type: 'password', value: event.target.value })}
                        sx={{ width: '60%', input: { color: '#FFF' }, label: { color: '#FFF' } }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '60%', margin: '0 auto' }}>
                        <Typography variant='body2' sx={{ color: '#FFF', marginLeft: '5%' }}>Want to sign in?</Typography>
                        <Link to='/signin' >
                            <Button type="submit" variant='body2' sx={{ textTransform: 'none', color: '#FFF', ':hover': { bgcolor: '#343434' } }}>
                                Sign in
                            </Button>
                        </Link>
                    </div>
                </div>

                <Button type='button' variant='body2' sx={{ width: '60%', color: '#FFF', bgcolor: 'primary.main', ':hover': { bgcolor: '#143954' } }}
                    onClick={createUser}
                >
                    Sign up
                </Button>
            </form>
        </>
    )
}

export default SignUp;