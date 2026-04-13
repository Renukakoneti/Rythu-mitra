module.exports = {
  users: [
    { fullName: "Dinakar Babu", phoneNumber: "9100000001", password: "password123" },
    { fullName: "Ramesh Kumar", phoneNumber: "9100000002", password: "password123" },
    { fullName: "Suresh Raina", phoneNumber: "9100000003", password: "password123" },
    { fullName: "Anita Sharma", phoneNumber: "9100000004", password: "password123" },
    { fullName: "Prakash Raj", phoneNumber: "9100000005", password: "password123" }
  ],
  devices: [
    { name: "Field North Node", deviceId: "NODE-N-001", location: "North Field", sensor_type: "soil" },
    { name: "Field South Node", deviceId: "NODE-S-002", location: "South Field", sensor_type: "soil" },
    { name: "Greenhouse Alpha", deviceId: "NODE-G-003", location: "Greenhouse", sensor_type: "climate" },
    { name: "Greenhouse Beta", deviceId: "NODE-G-004", location: "Greenhouse", sensor_type: "climate" },
    { name: "Orchard Node 1", deviceId: "NODE-O-005", location: "Orchard", sensor_type: "all" },
    { name: "Orchard Node 2", deviceId: "NODE-O-006", location: "Orchard", sensor_type: "all" },
    { name: "Water Pump Control", deviceId: "NODE-P-007", location: "Pump Station", sensor_type: "flow" },
    { name: "Boundary Main", deviceId: "NODE-B-008", location: "Main Gate", sensor_type: "smoke" },
    { name: "Storage Yard", deviceId: "NODE-Y-009", location: "Yard", sensor_type: "all" },
    { name: "Pest Monitor East", deviceId: "NODE-E-010", location: "East Boundary", sensor_type: "climate" },
    { name: "Pest Monitor West", deviceId: "NODE-W-011", location: "West Boundary", sensor_type: "climate" },
    { name: "Soil Health #1", deviceId: "NODE-H-012", location: "Seed Bed", sensor_type: "soil" },
    { name: "Soil Health #2", deviceId: "NODE-H-013", location: "Crop Area", sensor_type: "soil" }
  ]
};
