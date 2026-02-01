import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const dataVolume = [
  { name: 'Mon', CrowdStrike: 400, Splunk: 240, amt: 2400 },
  { name: 'Tue', CrowdStrike: 300, Splunk: 139, amt: 2210 },
  { name: 'Wed', CrowdStrike: 200, Splunk: 980, amt: 2290 },
  { name: 'Thu', CrowdStrike: 278, Splunk: 390, amt: 2000 },
  { name: 'Fri', CrowdStrike: 189, Splunk: 480, amt: 2181 },
];

const dataMTTD = [
  { name: 'Week 1', min: 45 },
  { name: 'Week 2', min: 30 },
  { name: 'Week 3', min: 25 },
  { name: 'Week 4', min: 15 },
];

const Dashboard: React.FC = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>Security Operations Dashboard</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Alert Volume by Source</Typography>
                    <BarChart width={500} height={300} data={dataVolume}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="CrowdStrike" fill="#8884d8" />
                        <Bar dataKey="Splunk" fill="#82ca9d" />
                    </BarChart>
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6">Mean Time To Detect (MTTD)</Typography>
                    <LineChart width={500} height={300} data={dataMTTD}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="min" stroke="#ff7300" />
                    </LineChart>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
