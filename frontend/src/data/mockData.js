// Junctions data
export const junctionsData = [
  {
    id: 1,
    name: 'MP Nagar Square',
    severity: 'medium',
    avgVehicles: 342,
    directions: { N: 92, S: 78, E: 85, W: 87 },
    signalDuration: 45,
    coordinates: { x: 30, y: 25 },
  },
  {
    id: 2,
    name: 'Habibganj Crossing',
    severity: 'high',
    avgVehicles: 528,
    directions: { N: 145, S: 132, E: 128, W: 123 },
    signalDuration: 60,
    coordinates: { x: 55, y: 40 },
  },
  {
    id: 3,
    name: 'Roshanpura Junction',
    severity: 'low',
    avgVehicles: 186,
    directions: { N: 48, S: 42, E: 50, W: 46 },
    signalDuration: 30,
    coordinates: { x: 70, y: 20 },
  },
  {
    id: 4,
    name: 'Arera Colony Gate',
    severity: 'critical',
    avgVehicles: 612,
    directions: { N: 168, S: 155, E: 148, W: 141 },
    signalDuration: 75,
    coordinates: { x: 45, y: 55 },
  },
  {
    id: 5,
    name: 'Bittan Market',
    severity: 'medium',
    avgVehicles: 298,
    directions: { N: 82, S: 68, E: 75, W: 73 },
    signalDuration: 40,
    coordinates: { x: 25, y: 60 },
  },
  {
    id: 6,
    name: 'Kolar Road',
    severity: 'low',
    avgVehicles: 156,
    directions: { N: 38, S: 42, E: 36, W: 40 },
    signalDuration: 25,
    coordinates: { x: 80, y: 50 },
  },
  {
    id: 7,
    name: 'Bairagarh Chowk',
    severity: 'high',
    avgVehicles: 465,
    directions: { N: 125, S: 110, E: 118, W: 112 },
    signalDuration: 55,
    coordinates: { x: 15, y: 45 },
  },
  {
    id: 8,
    name: 'Danish Kunj',
    severity: 'medium',
    avgVehicles: 275,
    directions: { N: 72, S: 65, E: 70, W: 68 },
    signalDuration: 35,
    coordinates: { x: 65, y: 70 },
  },
];

// Chart data - Live Vehicle Count Last 10 Minutes
export const chartData = [
  { time: '10:00', MP_Nagar: 280, Habibganj: 420, Roshanpura: 150, Arera: 480 },
  { time: '10:01', MP_Nagar: 310, Habibganj: 450, Roshanpura: 165, Arera: 520 },
  { time: '10:02', MP_Nagar: 295, Habibganj: 490, Roshanpura: 160, Arera: 560 },
  { time: '10:03', MP_Nagar: 340, Habibganj: 510, Roshanpura: 175, Arera: 590 },
  { time: '10:04', MP_Nagar: 320, Habibganj: 480, Roshanpura: 170, Arera: 550 },
  { time: '10:05', MP_Nagar: 360, Habibganj: 530, Roshanpura: 180, Arera: 610 },
  { time: '10:06', MP_Nagar: 330, Habibganj: 500, Roshanpura: 165, Arera: 580 },
  { time: '10:07', MP_Nagar: 380, Habibganj: 550, Roshanpura: 190, Arera: 630 },
  { time: '10:08', MP_Nagar: 350, Habibganj: 520, Roshanpura: 175, Arera: 600 },
  { time: '10:09', MP_Nagar: 400, Habibganj: 580, Roshanpura: 200, Arera: 650 },
  { time: '10:10', MP_Nagar: 370, Habibganj: 540, Roshanpura: 185, Arera: 620 },
];

// Alerts data
export const alertsData = [
  {
    id: 1,
    severity: 'critical',
    junction: 'Arera Colony Gate',
    message: 'Critical congestion detected - Traffic backup exceeds 800m',
    time: '2 min ago',
    status: 'active',
  },
  {
    id: 2,
    severity: 'high',
    junction: 'Habibganj Crossing',
    message: 'High vehicle count - Queue length increasing rapidly',
    time: '5 min ago',
    status: 'active',
  },
  {
    id: 3,
    severity: 'medium',
    junction: 'MP Nagar Square',
    message: 'Signal optimization running - Adjusting green time',
    time: '8 min ago',
    status: 'active',
  },
  {
    id: 4,
    severity: 'critical',
    junction: 'Bairagarh Chowk',
    message: 'Accident reported - Lane blockage on North approach',
    time: '12 min ago',
    status: 'active',
  },
  {
    id: 5,
    severity: 'low',
    junction: 'Roshanpura Junction',
    message: 'Routine maintenance completed',
    time: '25 min ago',
    status: 'resolved',
  },
  {
    id: 6,
    severity: 'medium',
    junction: 'Bittan Market',
    message: 'Pedestrian crossing signal delay detected',
    time: '32 min ago',
    status: 'resolved',
  },
  {
    id: 7,
    severity: 'high',
    junction: 'Danish Kunj',
    message: 'Unusual traffic pattern - Diverting from main route',
    time: '45 min ago',
    status: 'resolved',
  },
  {
    id: 8,
    severity: 'low',
    junction: 'Kolar Road',
    message: 'Sensor calibration completed successfully',
    time: '1 hour ago',
    status: 'resolved',
  },
];

// Simulation data
export const simulationData = {
  junctions: [
    { id: 2, name: 'Habibganj Crossing' },
    { id: 1, name: 'MP Nagar Square' },
    { id: 4, name: 'Arera Colony Gate' },
    { id: 3, name: 'Roshanpura Junction' },
  ],
  signals: {
    N: { state: 'green', timer: 24, vehicles: 145 },
    S: { state: 'red', timer: 18, vehicles: 132 },
    E: { state: 'red', timer: 18, vehicles: 128 },
    W: { state: 'red', timer: 18, vehicles: 123 },
  },
  congestionLevel: 'high',
  totalVehicles: 528,
};

// Metrics for overview
export const overviewMetrics = [
  { label: 'Total Junctions', value: 24, change: '+2', icon: 'GitBranch' },
  { label: 'Avg Vehicles/Lane', value: '312', change: '+12%', icon: 'Car' },
  { label: 'Active Alerts', value: 4, change: '-1', icon: 'AlertTriangle' },
  { label: 'Optimizer Decisions Today', value: 186, change: '+24', icon: 'Cpu' },
  { label: 'Wait Time Saved', value: '1,240 min', change: '+8%', icon: 'Clock' },
];

