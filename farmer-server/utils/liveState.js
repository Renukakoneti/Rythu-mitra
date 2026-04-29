let latestSensorData = {};

const updateLiveSensorData = (data) => {
    latestSensorData = {
        ...data,
        updatedAt: new Date()
    };
    return latestSensorData;
};

const getLatestSensorData = () => {
    return latestSensorData;
};

module.exports = {
    updateLiveSensorData,
    getLatestSensorData
};
