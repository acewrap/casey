import React from 'react';
import { Paper, Button, Stack, Typography } from '@mui/material';

interface BulkActionBarProps {
    selectedCount: number;
    onMarkTruePositive: () => void;
    onMarkFalsePositive: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onMarkTruePositive, onMarkFalsePositive }) => {
    if (selectedCount === 0) return null;

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#e3f2fd' }}>
            <Typography variant="subtitle1" fontWeight="bold">{selectedCount} events selected</Typography>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="success" size="small" onClick={onMarkTruePositive}>
                    Mark as True Positive
                </Button>
                <Button variant="contained" color="error" size="small" onClick={onMarkFalsePositive}>
                    Mark as False Positive
                </Button>
            </Stack>
        </Paper>
    );
};

export default BulkActionBar;
