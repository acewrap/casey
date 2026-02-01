import React from 'react';
import { Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material';

interface StatusDropdownProps {
    status: string;
    onChange: (newStatus: string) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ status, onChange }) => {
    const handleChange = (event: SelectChangeEvent) => {
        onChange(event.target.value as string);
    };

    return (
        <FormControl size="small" fullWidth variant="standard">
            <Select
                value={status}
                onChange={handleChange}
                disableUnderline
                sx={{
                    fontSize: '0.875rem',
                    height: 32,
                    color: status === 'FALSE_POSITIVE' ? 'error.main' : status === 'TRUE_POSITIVE' ? 'success.main' : 'text.primary',
                    fontWeight: 'bold'
                }}
            >
                <MenuItem value="NEW">New</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="TRIAGED">Triaged</MenuItem>
                <MenuItem value="FALSE_POSITIVE">False Positive</MenuItem>
                <MenuItem value="TRUE_POSITIVE">True Positive</MenuItem>
                <MenuItem value="PROMOTED" disabled>Promoted</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
            </Select>
        </FormControl>
    );
};

export default StatusDropdown;
