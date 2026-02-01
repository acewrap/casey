import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Box, CssBaseline, ListItemButton, Badge, InputBase, alpha, styled, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { search } from '../api';

const drawerWidth = 240;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newEventsCount, setNewEventsCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await api.get('events/');
                const events = res.data.results || res.data;
                const count = events.filter((e: any) => e.status === 'NEW').length;
                setNewEventsCount(count);
            } catch (e) {
                console.error(e);
            }
        };
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!searchQuery) {
                setShowResults(false);
                return;
            }
            try {
                const res = await search(searchQuery);
                setSearchResults(res.data.results);
                setShowResults(true);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const menuItems = [
        { text: 'Incoming Events', path: '/', badge: newEventsCount },
        { text: 'Dashboard', path: '/dashboard' },
        { text: 'Active Investigations', path: '/investigations' },
        { text: 'Incidents', path: '/incidents' },
        { text: 'Reporting', path: '/reporting' },
        { text: 'Admin', path: '/admin' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
                        Casey - Security Case Management
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search IDs, usernames, IPs..."
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow click
                        />
                        {showResults && (
                            <Paper sx={{ position: 'absolute', top: 40, width: '100%', zIndex: 10, maxHeight: 300, overflow: 'auto', color: 'black' }}>
                                <List>
                                    {searchResults.map((res: any) => (
                                        <ListItem key={`${res.type}-${res.id}`} disablePadding>
                                            <ListItemButton onClick={() => {
                                                navigate(res.link);
                                                setShowResults(false);
                                                setSearchQuery('');
                                            }}>
                                                <ListItemText primary={res.title} secondary={`${res.type} #${res.id}`} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                    {searchResults.length === 0 && <ListItem><ListItemText primary="No results found" /></ListItem>}
                                </List>
                            </Paper>
                        )}
                    </Search>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton selected={location.pathname === item.path} onClick={() => navigate(item.path)}>
                                    <ListItemText primary={item.text} />
                                    {item.badge && item.badge > 0 ? (
                                        <Badge badgeContent={item.badge} color="error" sx={{ mr: 2 }} />
                                    ) : null}
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
