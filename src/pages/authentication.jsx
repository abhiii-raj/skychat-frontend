import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const authTheme = createTheme({
    palette: {
        primary: {
            main: '#2b66df',
        },
        secondary: {
            main: '#111f3f',
        },
        background: {
            default: '#f4f8ff',
        },
    },
    shape: {
        borderRadius: 14,
    },
});

export default function Authentication() {



    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();
    const navigate = useNavigate();


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password)


            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {

            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }

    const handleGoogleSuccess = (credentialResponse) => {
        try {
            if (!credentialResponse?.credential) {
                setError("Google sign in failed. Please try again.")
                return
            }

            const decodedUser = jwtDecode(credentialResponse.credential)
            localStorage.setItem("token", credentialResponse.credential)
            localStorage.setItem("google_user", JSON.stringify(decodedUser))
            navigate("/home")
        } catch {
            setError("Unable to continue with Google.")
        }
    }


    return (
        <ThemeProvider theme={authTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'linear-gradient(128deg, rgba(10,23,70,0.86), rgba(26,65,158,0.75)), url(https://images.unsplash.com/photo-1642543348745-10d8ad1a7f12?auto=format&fit=crop&w=1500&q=80)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: '#dce6ff',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={0} square sx={{
                    background: 'linear-gradient(180deg, #f8fbff 0%, #eef3ff 100%)'
                }}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 3,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.75)',
                            border: '1px solid #dce7ff',
                            boxShadow: '0 14px 30px rgba(18, 42, 89, 0.08)'
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Box sx={{ mb: 1.5, textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Welcome to Sky Chat</h2>
                            <p style={{ color: '#63789f', marginTop: '0.35rem' }}>Sign in to access your realtime collaboration dashboard.</p>
                        </Box>


                        <div>
                            <Button variant={formState === 0 ? "contained" : "outlined"} onClick={() => { setFormState(0) }}>
                                Sign In
                            </Button>
                            <Button sx={{ ml: 1 }} variant={formState === 1 ? "contained" : "outlined"} onClick={() => { setFormState(1) }}>
                                Sign Up
                            </Button>
                        </div>

                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Full Name"
                                name="username"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                            /> : <></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus
                                onChange={(e) => setUsername(e.target.value)}

                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}

                                id="password"
                            />

                            <p style={{ color: "red" }}>{error}</p>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login " : "Register"}
                            </Button>

                            <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
                                {googleClientId ? <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google authentication failed.")} /> : <Button variant='outlined' disabled>Google auth unavailable: set REACT_APP_GOOGLE_CLIENT_ID</Button>}
                            </Box>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar

                open={open}
                autoHideDuration={4000}
                message={message}
            />

        </ThemeProvider>
    );
}
