import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Typography, Button, Grid, Box, TextField, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchInvestigation, updateInvestigation, promoteInvestigation, excludeIndicator, addTag, removeTag, addTimelineEvent, Investigation } from '../api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const InvestigationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [inv, setInv] = useState<Investigation | null>(null);
    const [tabValue, setTabValue] = useState(0);
    const [notes, setNotes] = useState('');

    // Tagging
    const [newTag, setNewTag] = useState('');

    // Timeline
    const [timelineEntry, setTimelineEntry] = useState('');

    useEffect(() => {
        if (id) loadInvestigation(parseInt(id));
    }, [id]);

    const loadInvestigation = async (invId: number) => {
        try {
            const res = await fetchInvestigation(invId);
            setInv(res.data);
            setNotes(res.data.description);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveNotes = async () => {
        if (!inv) return;
        try {
            await updateInvestigation(inv.id, { description: notes });
            alert('Notes saved');
        } catch (e) {
            console.error(e);
        }
    };

    const handlePromote = async () => {
        if (!inv) return;
        try {
            await promoteInvestigation(inv.id);
            alert('Promoted to Incident');
            navigate('/incidents');
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteIndicator = async (indId: number) => {
        if (!inv) return;
        try {
            await excludeIndicator(inv.id, indId);
            loadInvestigation(inv.id);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddTag = async () => {
        if (!inv || !newTag) return;
        try {
            await addTag(inv.id, newTag);
            setNewTag('');
            loadInvestigation(inv.id);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemoveTag = async (tag: string) => {
        if (!inv) return;
        try {
            await removeTag(inv.id, tag);
            loadInvestigation(inv.id);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddTimeline = async () => {
        if (!inv || !timelineEntry) return;
        try {
            await addTimelineEvent(inv.id, timelineEntry);
            setTimelineEntry('');
            loadInvestigation(inv.id);
        } catch (e) {
            console.error(e);
        }
    };

    if (!inv) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ p: 2 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                        <Typography variant="h4">Investigation: {inv.event.title}</Typography>
                        <Typography variant="subtitle1">Source: {inv.event.source} | ID: {inv.event.id}</Typography>
                        <Stack direction="row" spacing={1} mt={1} alignItems="center">
                            {inv.tags?.map(tag => (
                                <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} size="small" />
                            ))}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    size="small"
                                    placeholder="Add Tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    sx={{ width: 100 }}
                                />
                                <IconButton size="small" onClick={handleAddTag} disabled={!newTag}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Button variant="contained" color="error" onClick={handlePromote}>Promote to Incident</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ width: '100%' }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Analyst Notes" />
                    <Tab label="Indicators" />
                    <Tab label="Related Events" />
                    <Tab label="Timeline" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <TextField
                        fullWidth
                        multiline
                        minRows={10}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter markdown notes here..."
                    />
                    <Button sx={{ mt: 2 }} variant="contained" onClick={handleSaveNotes}>Save Notes</Button>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Value</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inv.indicators.map((ind) => (
                                <TableRow key={ind.id}>
                                    <TableCell>{ind.value}</TableCell>
                                    <TableCell>{ind.indicator_type}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteIndicator(ind.id!)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                     {inv.related_events?.map(e => (
                         <Paper key={e.id} sx={{ p: 1, mb: 1 }}>
                             <Typography variant="subtitle2">{e.title}</Typography>
                             <Typography variant="caption">{e.source}</Typography>
                         </Paper>
                     ))}
                     {(!inv.related_events || inv.related_events.length === 0) && <Typography>No related events.</Typography>}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ mb: 2, display: 'flex' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Add timeline entry..."
                            value={timelineEntry}
                            onChange={(e) => setTimelineEntry(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleAddTimeline} sx={{ ml: 1 }}>Add</Button>
                    </Box>
                    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                        {inv.timeline?.map((entry: any, i: number) => (
                             <Box key={i} sx={{ borderLeft: '2px solid #1976d2', ml: 2, pl: 2, py: 1, mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">{entry.user || 'System'}</Typography>
                                <Typography variant="body2">{entry.entry}</Typography>
                                <Typography variant="caption" color="textSecondary">{new Date(entry.timestamp).toLocaleString()}</Typography>
                             </Box>
                        ))}
                        <Box sx={{ borderLeft: '2px solid #ccc', ml: 2, pl: 2, py: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">Investigation Created</Typography>
                            <Typography variant="caption">{new Date(inv.created_at).toLocaleString()}</Typography>
                        </Box>
                        <Box sx={{ borderLeft: '2px solid #ccc', ml: 2, pl: 2, py: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">Event Occurred</Typography>
                            <Typography variant="caption">{new Date(inv.event.created_at).toLocaleString()}</Typography>
                        </Box>
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default InvestigationDetail;
