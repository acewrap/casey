import React, { useEffect, useState } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Typography, Paper } from '@mui/material';
import api from '../api';

const Incidents: React.FC = () => {
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const res = await api.get('incidents/');
            setIncidents(res.data.results || res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWarRoom = async (id: number) => {
        try {
            const res = await api.post(`incidents/${id}/create_war_room/`);
            window.open(res.data.room_url, '_blank');
        } catch (error) {
            alert('Error creating War Room');
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'title', headerName: 'Title', width: 300 },
        { field: 'status', headerName: 'Status', width: 130 },
        { field: 'onspring_id', headerName: 'OnSpring ID', width: 130 },
        {
            field: 'action',
            headerName: 'Actions',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => handleWarRoom(params.row.id)}
                >
                    Start War Room
                </Button>
            ),
        },
    ];

    return (
        <Paper sx={{ height: 600, width: '100%', p: 2 }}>
            <Typography variant="h4" gutterBottom>Active Incidents</Typography>
            <DataGrid
                rows={incidents}
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

export default Incidents;
