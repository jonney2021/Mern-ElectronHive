import { Row, Col, Form } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { useGetAnalyticsDateQuery } from "../../../slices/analyticsSlice";
import io from "socket.io-client";

const AnalyticsPageComponent = () => {
  // State to keep track of selected dates
  const [firstDateToCompare, setFirstDateToCompare] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [secondDateToCompare, setSecondDateToCompare] = useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .substring(0, 10)
  );

  // Fetch data using RTK Query hooks
  const {
    data: dataForFirstSet,
    isFetching: isLoadingFirstSet,
    isError: isErrorFirstSet,
  } = useGetAnalyticsDateQuery(firstDateToCompare);

  const {
    data: dataForSecondSet,
    isFetching: isLoadingSecondSet,
    isError: isErrorSecondSet,
  } = useGetAnalyticsDateQuery(secondDateToCompare);

  // State to keep the combined chart data
  const [chartData, setChartData] = useState([]);

  // Handlers for date input changes
  const firstDateHandler = (e) => {
    setFirstDateToCompare(e.target.value);
    setChartData([]); // Reset chart data
  };

  const secondDateHandler = (e) => {
    setSecondDateToCompare(e.target.value);
    setChartData([]); // Reset chart data
  };

  useEffect(() => {
    // Establish a connection to the Socket.IO server using the proxy
    const socket = io();
    // Event listener for real-time updates
    const handleNewOrder = (newOrder) => {
      console.log("Received data:", newOrder);

      if (!newOrder || !newOrder.createdAt) {
        console.error(
          "New order data is missing or 'createdAt' is not defined"
        );
        return; // Exit if the data is not in the expected format
      }

      // const orderDate = new Date(newOrder.createdAt)
      //   .toISOString()
      //   .substring(0, 10);

      // if (
      //   orderDate === firstDateToCompare ||
      //   orderDate === secondDateToCompare
      // ) {
      //   setChartData((prevChartData) => {
      //     let updated = false;
      //     const newChartData = prevChartData.map((entry) => {
      //       if (entry.date === orderDate) {
      //         updated = true;
      //         return { ...entry, revenue: entry.revenue + newOrder.totalPrice };
      //       }
      //       return entry;
      //     });

      //     // If no existing date entry was found, add a new one
      //     if (!updated) {
      //       newChartData.push({
      //         date: orderDate,
      //         revenue: newOrder.totalPrice,
      //       });
      //     }

      const orderHour = `${new Date(newOrder.createdAt).getHours()}:00`;
      console.log("orderHour", orderHour);
      setChartData((prevChartData) => {
        let updated = false;
        const newChartData = prevChartData.map((entry) => {
          if (entry.time === orderHour) {
            updated = true;
            return { ...entry, revenue: entry.revenue + newOrder.totalPrice };
          }
          return entry;
        });

        if (!updated) {
          newChartData.push({
            time: orderHour,
            revenue: newOrder.totalPrice,
          });
        }

        return newChartData;
      });
      // }
    };

    socket.on("newOrder", handleNewOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // When data is fetched, combine it
    if (
      !isLoadingFirstSet &&
      !isLoadingSecondSet &&
      !isErrorFirstSet &&
      !isErrorSecondSet
    ) {
      setChartData([
        ...dataForFirstSet?.map((item) => ({ ...item, date: "First Date" })),
        ...dataForSecondSet?.map((item) => ({ ...item, date: "Second Date" })),
      ]);
    }
  }, [
    dataForFirstSet,
    dataForSecondSet,
    isLoadingFirstSet,
    isLoadingSecondSet,
    isErrorFirstSet,
    isErrorSecondSet,
  ]);

  return (
    <Row className="m-5">
      <Col md={10}>
        <h1>
          Black Friday Cumulative Revenue {firstDateToCompare} VS{" "}
          {secondDateToCompare}
        </h1>
        <Form.Group controlId="firstDateToCompare">
          <Form.Label>Select First Date To Compare</Form.Label>
          <Form.Control
            onChange={firstDateHandler}
            type="date"
            name="firstDateToCompare"
            placeholder="First Date To Compare"
            defaultValue={firstDateToCompare}
          />
        </Form.Group>
        <br />
        <Form.Group controlId="secondDateToCompare">
          <Form.Label>Select Second Date To Compare</Form.Label>
          <Form.Control
            onChange={secondDateHandler}
            type="date"
            name="secondDateToCompare"
            placeholder="Second Date To Compare"
            defaultValue={secondDateToCompare}
          />
        </Form.Group>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart
            // data={
            //   dataForFirstSet && dataForSecondSet
            //     ? [...dataForFirstSet, ...dataForSecondSet]
            //     : []
            // }
            // data={
            //   Array.isArray(dataForFirstSet) && Array.isArray(dataForSecondSet)
            //     ? [...dataForFirstSet, ...dataForSecondSet]
            //     : []
            // }
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{
                value: "TIME",
                offset: 50,
                position: "insideBottomRight",
              }}
              allowDuplicatedCategory={false}
            />
            <YAxis
              label={{ value: "REVENUE $", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            {/* {dataForFirstSet.length > dataForSecondSet.length ? ( */}
            {/* {Array.isArray(dataForFirstSet) &&
              Array.isArray(dataForSecondSet) && (
                <>
                  <Line
                    // data={dataForFirstSet}
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    strokeWidth={4}
                    name={`Revenue ${firstDateToCompare}`}
                  />
                  <Line
                    // data={dataForSecondSet}
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    strokeWidth={4}
                    name={`Revenue ${secondDateToCompare}`}
                  />
                </>
              )} */}

            {/* Line for the first date */}
            {dataForFirstSet && dataForFirstSet.length > 0 && (
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={4}
                name={`Revenue ${firstDateToCompare}`}
                data={dataForFirstSet.map((item) => ({
                  time: item.time,
                  revenue: item.revenue,
                  date: "First Date", // This field is not strictly necessary, but included for clarity
                }))}
              />
            )}

            {/* Line for the second date */}
            {dataForSecondSet && dataForSecondSet.length > 0 && (
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                strokeWidth={4}
                name={`Revenue ${secondDateToCompare}`}
                data={dataForSecondSet.map((item) => ({
                  time: item.time,
                  revenue: item.revenue,
                  date: "Second Date", // This field is not strictly necessary, but included for clarity
                }))}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Col>
    </Row>
  );
};

export default AnalyticsPageComponent;
