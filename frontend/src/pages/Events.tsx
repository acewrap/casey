import React, { useEffect, useState } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Typography, Paper, Chip, Stack } from '@mui/material';
import api from '../api';

const Events: React.FC = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('events/');
            setEvents(res.data.results || res.data); // Handle pagination or list
        } catch (error) {
            console.error(error);
        }
    };

    const handlePromote = async (id: number) => {
        try {
            await api.post(`events/${id}/promote/`);
            alert('Event promoted to Incident!');
            fetchEvents();
        } catch (error) {
            alert('Error promoting event');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'source', headerName: 'Source', width: 130 },
        { field: 'title', headerName: 'Title', width: 300 },
        { field: 'status', headerName: 'Status', width: 130 },
        { field: 'severity', headerName: 'Severity', width: 130 },
        {
            field: 'mitre_tactics',
            headerName: 'MITRE Tactics',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    {params.row.mitre_tactics?.map((t: string) => (
                        <Chip key={t} label={t} size="small" variant="outlined" />
                    ))}
                </Stack>
            )
        },
        {
            field: 'indicators',
            headerName: 'Indicators',
            width: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Stack direction="row" spacing={1}>
                    {params.row.indicators?.map((i: any) => (
                        <Chip key={i.value} label={`${i.value} (${i.indicator_type})`} size="small" color="primary" />
                    ))}
                </Stack>
            )
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => handlePromote(params.row.id)}
                    disabled={params.row.status === 'PROMOTED'}
                >
                    Promote
                </Button>
            ),
        },
    ];

    return (
        <Paper sx={{ height: 600, width: '100%', p: 2 }}>
            <Typography variant="h4" gutterBottom>Incoming Events</Typography>
            <DataGrid
                rows={events}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[5, 10]}
            />
        </Paper>
    );
};

export default Events;
