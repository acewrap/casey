import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import api, { type ChartDefinition, fetchCharts, createChart, exportReportExcel, exportReportPdf } from '../api';

const Reporting: React.FC = () => {
    const [charts, setCharts] = useState<ChartDefinition[]>([]);
    const [chartData, setChartData] = useState<any>({}); // Map chartId -> data
    const [openDialog, setOpenDialog] = useState(false);

    // New Chart Form State
    const [title, setTitle] = useState('');
    const [type, setType] = useState('BAR');

    useEffect(() => {
        loadCharts();
    }, []);

    const loadCharts = async () => {
        try {
            const res = await fetchCharts();
            setCharts(res.data.results || res.data);

            // Mock fetching data for each chart based on config
            const mockData = [
                { name: 'CrowdStrike', value: 40 },
                { name: 'ProofPoint', value: 30 },
                { name: 'Manual', value: 20 },
                { name: 'Netskope', value: 10 },
            ];

            const dataMap: any = {};
            (res.data.results || res.data).forEach((c: ChartDefinition) => {
                dataMap[c.id] = mockData; // Reuse mock data
            });
            setChartData(dataMap);

        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateChart = async () => {
        try {
            await createChart({
                title,
                chart_type: type as any,
                query_config: {}, // Empty config for now
                is_global: false
            });
            setOpenDialog(false);
            loadCharts();
        } catch (e) {
            console.error(e);
        }
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            const config = { charts: charts }; // Send chart definitions or aggregated data
            const res = format === 'pdf' ? await exportReportPdf(config) : await exportReportExcel(config);

            // Trigger download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error(e);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h4">Reporting & Analytics</Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={() => setOpenDialog(true)}>Create Chart</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('excel')}>Export Excel</Button>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => handleExport('pdf')}>Export PDF</Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                {charts.map((chart) => (
                    <Grid item xs={12} md={6} lg={4} key={chart.id}>
                        <Paper sx={{ p: 2, height: 300, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>{chart.title}</Typography>
                            <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {chart.chart_type === 'BAR' ? (
                                        <BarChart data={chartData[chart.id]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    ) : (
                                        <PieChart>
                                            <Pie
                                                data={chartData[chart.id]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            >
                                                {chartData[chart.id]?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    )}
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Create New Chart</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Chart Title"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Chart Type</InputLabel>
                        <Select value={type} onChange={(e) => setType(e.target.value)}>
                            <MenuItem value="BAR">Bar Chart</MenuItem>
                            <MenuItem value="PIE">Pie Chart</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateChart} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Reporting;
