import React, { useEffect, useState } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Button, Typography, Paper, Chip, Stack, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import api, { type Event, bulkStatusUpdate } from '../api';
import StatusDropdown from '../components/StatusDropdown';
import BulkActionBar from '../components/BulkActionBar';

const Events: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [showFalsePositives, setShowFalsePositives] = useState(false);
    const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [targetIds, setTargetIds] = useState<number[]>([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await api.get('events/');
            setEvents(res.data.results || res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        setTargetIds([id]);
        setPendingStatus(newStatus);
        setReason('');
        setOpenDialog(true);
    };

    const handleBulkAction = (status: string) => {
        setTargetIds(selectionModel as number[]);
        setPendingStatus(status);
        setReason('');
        setOpenDialog(true);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatus) return;

        try {
            await bulkStatusUpdate(targetIds, pendingStatus, reason);
            fetchEvents();
            setOpenDialog(false);
            setSelectionModel([]);
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    const filteredEvents = events.filter(e =>
        showFalsePositives ? true : e.status !== 'FALSE_POSITIVE'
    );

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'source', headerName: 'Source', width: 130 },
        { field: 'title', headerName: 'Title', width: 300 },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            renderCell: (params: GridRenderCellParams) => (
                <StatusDropdown
                    status={params.row.status}
                    onChange={(newStatus) => handleStatusChange(params.row.id, newStatus)}
                />
            )
        },
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
                        <Chip key={i.id || i.value} label={`${i.value} (${i.indicator_type})`} size="small" color="primary" />
                    ))}
                </Stack>
            )
        }
    ];

    return (
        <Paper sx={{ height: 700, width: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Incoming Events</Typography>
                <FormControlLabel
                    control={<Switch checked={showFalsePositives} onChange={(e) => setShowFalsePositives(e.target.checked)} />}
                    label="Show False Positives"
                />
            </Stack>

            <BulkActionBar
                selectedCount={selectionModel.length}
                onMarkTruePositive={() => handleBulkAction('TRUE_POSITIVE')}
                onMarkFalsePositive={() => handleBulkAction('FALSE_POSITIVE')}
            />

            <DataGrid
                rows={filteredEvents}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
                rowSelectionModel={selectionModel}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[5, 10, 20]}
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Update Status to {pendingStatus}</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>Please provide a reason for this change:</Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Change"
                        fullWidth
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={confirmStatusChange} variant="contained">Confirm</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default Events;
