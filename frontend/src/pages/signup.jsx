import { useState, useEffect } from 'react';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../layouts/theme/AppTheme';
import ColorModeSelect from '../layouts/theme/ColorModeSelect';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export default function SignUp(props) {
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    useEffect(() => {
        document.body.style.justifyContent = 'center';
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        const data = new FormData(event.currentTarget);

        const formData = {
            username: data.get('username'),
            firstname: data.get('firstname'),
            lastName: data.get('lastName'),
            email: data.get('email'),
            password: data.get('password'),
            confirmPassword: data.get('confirmpassword'),
        };

        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmpassword: "Passwords do not match." });
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/user/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('Sign-up successful!');
            } else {
                setErrors(result.errors || { general: 'Sign-up failed.' });
            }
        } catch {
            setErrors({ general: 'An error occurred.' });
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
            <SignUpContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                    >
                        Sign up
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <FormControl>
                            <FormLabel htmlFor="firstname">First name</FormLabel>
                            <TextField
                                autoComplete="firstname"
                                name="firstname"
                                required
                                fullWidth
                                id="firstname"
                                placeholder="Ian"
                                error={Boolean(errors.firstname)}
                                helperText={errors.firstname}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="lastName">Last name</FormLabel>
                            <TextField
                                autoComplete="lastName"
                                name="lastName"
                                required
                                fullWidth
                                id="lastName"
                                placeholder="Kollipara"
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="username">Username</FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                name="username"
                                placeholder="Username"
                                autoComplete="username"
                                error={Boolean(errors.username)}
                                helperText={errors.username}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                placeholder="ian.kollipara@cune.edu"
                                name="email"
                                autoComplete="email"
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <TextField
                                required
                                fullWidth
                                name="password"
                                placeholder="••••••"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="confirmpassword">Confirm Password</FormLabel>
                            <TextField
                                required
                                fullWidth
                                name="confirmpassword"
                                placeholder="••••••"
                                id="confirmpassword"
                                error={Boolean(errors.confirmpassword)}
                                helperText={errors.confirmpassword}
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                        >
                            Sign up
                        </Button>
                    </Box>
                    {message && (
                        <Typography sx={{ mt: 2, color: 'green', textAlign: 'center' }}>
                            {message}
                        </Typography>
                    )}
                    {errors.general && (
                        <Typography sx={{ mt: 2, color: 'red', textAlign: 'center' }}>
                            {errors.general}
                        </Typography>
                    )}
                    <Divider>
                        <Typography sx={{ color: 'text.secondary' }}>or</Typography>
                    </Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography sx={{ textAlign: 'center' }}>
                            Already have an account?{' '}
                            <Link
                                href="/login/"
                                variant="body2"
                                sx={{ alignSelf: 'center' }}
                            >
                                Sign in
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </SignUpContainer>
        </AppTheme>
    );
}