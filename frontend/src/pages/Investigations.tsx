import React, { useEffect, useState } from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails, Chip, Stack, Button, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { fetchInvestigations, Investigation } from '../api';

const Investigations: React.FC = () => {
    const [investigations, setInvestigations] = useState<Investigation[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchInvestigations();
                setInvestigations(res.data.results || res.data);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, []);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Active Investigations</Typography>
            {investigations.map((inv) => (
                <Accordion key={inv.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <Typography variant="h6" sx={{ width: '15%' }}>CASE-{inv.id}</Typography>
                            <Typography variant="subtitle1" sx={{ width: '40%' }}>{inv.event.title}</Typography>
                            <Chip label={inv.event.severity} color={inv.event.severity === 'CRITICAL' ? 'error' : 'warning'} size="small" />
                            <Typography variant="caption" color="textSecondary">{new Date(inv.created_at).toLocaleString()}</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant="body2" paragraph>{inv.event.description}</Typography>
                        <Stack direction="row" justifyContent="flex-end">
                             <Button variant="contained" onClick={() => navigate(`/investigations/${inv.id}`)}>
                                Open Investigation
                             </Button>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            ))}
            {investigations.length === 0 && <Typography>No active investigations.</Typography>}
        </Box>
    );
};

export default Investigations;
