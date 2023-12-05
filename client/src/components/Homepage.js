import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormControl,
  Select,
  InputAdornment,
  InputLabel,
  MenuItem,
  TextField,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import CustomButton from "./CustomButton";
import ChartComponent from "./ChartComponent";

const theme = createTheme({
  typography: {
    fontFamily: "Poppins, sans-serif",
  },
});

const HomePage = () => {
  const [sourceType, setSourceType] = useState("voltage");
  const [sourceValue, setSourceValue] = useState("");
  const [chartVisible, setChartVisible] = useState(false);
  const [measurementTypeOptions, setMeasurementTypeOptions] = useState([
    { value: "current", label: "Current" },
    { value: "resistance", label: "Resistance" },
  ]);
  const [measurementType, setMeasurementType] = useState(
    measurementTypeOptions[0].value
  );
  const [sourceLabel, setSourceLabel] = useState("Voltage Value:");
  const [sourcePlaceholder, setSourcePlaceholder] = useState(
    "Enter voltage value"
  );

  useEffect(() => {
    updateForm();
    updateMeasurementOptions(sourceType);
  }, [sourceType, measurementTypeOptions]);

  const updateForm = () => {
    if (sourceType === "voltage") {
      setSourceLabel("Voltage Value:");
      setSourcePlaceholder("Enter voltage value");
    } else if (sourceType === "current") {
      setSourceLabel("Current Value:");
      setSourcePlaceholder("Enter current value");
    }
  };

  const updateMeasurementOptions = (sourceType) => {
    if (sourceType === "current") {
      setMeasurementTypeOptions([{ value: "resistance", label: "Resistance" }]);
      setMeasurementType(measurementTypeOptions[0].value);
    } else {
      setMeasurementTypeOptions([
        { value: "current", label: "Current" },
        { value: "resistance", label: "Resistance" },
      ]);
    }
  };

const sendData = () => {
  fetch('http://localhost:5000/receive-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_type: sourceType,
      source_value: sourceValue,
      measurement_type: measurementType,
      plot_graph: 'True',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      setChartVisible(true)
      updateChartConfiguration(data.measured_value)
    })
    .catch((error) => console.error('Error:', error))
};



  const downloadData = () => {
    fetch("/download-data")
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "voltage_data.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => console.error("Error:", error));
  };

  const updateChartConfiguration = (measurementType) => {
    // Implement chart configuration logic here
    // Note: Access chart instance and update options as needed
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" style={{ paddingTop: "50px" }}>
        <Typography gutterBottom variant="h4">
          <b>Log and Plot</b> data from Keithley 2450!
        </Typography>

        <Card style={{ padding: "20px" }}>
          <CardContent>
            <form id="myForm">
              <FormControl fullWidth>
                <InputLabel id="source-type-label">
                  Select Source Type
                </InputLabel>
                <Select
                  labelId="source-type-label"
                  id="source_type"
                  value={sourceType}
                  label="Select Source Type"
                  onChange={(e) => {
                    setSourceType(e.target.value);
                  }}
                >
                  <MenuItem value="voltage">Voltage</MenuItem>
                  <MenuItem value="current">Current</MenuItem>
                </Select>
              </FormControl>
              <br />
              <br />

              <TextField
                id="source_value"
                label={sourceLabel}
                type="number"
                value={sourceValue}
                fullWidth
                placeholder={sourcePlaceholder}
                onChange={(e) => setSourceValue(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {sourceType === "voltage" && "V (in volts)"}
                      {sourceType === "current" && "mA (in milliamps)"}
                    </InputAdornment>
                  ),
                }}
              />

              <br />
              <br />

              <FormControl fullWidth>
                <InputLabel id="measurement-type-label">
                  Select Measurement
                </InputLabel>
                <Select
                  labelId="measurement-type-label"
                  id="measurement_type"
                  value={measurementType}
                  label="Select Measurement"
                  onChange={(e) => setMeasurementType(e.target.value)}
                >
                  {measurementTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <br />
              <br />

              <CustomButton
                text="Plot Graph"
                handleClick={() => sendData()}
                disabled={false}
              />
              {/* <CustomButton
                text="Download Data"
                handleClick={() => downloadData()}
                disabled={false}
              /> */}
            </form>
          </CardContent>
        </Card>
        {chartVisible && <ChartComponent measurementType={measurementType} />}
      </Container>
    </ThemeProvider>
  );
};

export default HomePage;
