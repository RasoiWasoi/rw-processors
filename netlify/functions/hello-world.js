import axios from "axios";

// const axios = require("axios");

const options = { timeZone: "Asia/Kolkata" };

export const handler = async (event) => {
  const expectedKey = process.env.ADD_HISTORY_KEY; // Replace with your actual API key
  const providedKey = event.headers["x-api-key"];

  let filteredData = [];
  let oneTimeData = [];

  // Check if provided key matches the expected key
  if (providedKey !== expectedKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: "Unauthorized",
      }),
    };
  }

  const getYYYYMMDDFormat = (month, day, year) => {
    const monthString = month < 10 ? `0${month}` : `${month}`;
    const dayString = day < 10 ? `0${day}` : `${day}`;
    const yearString = `${year}`;
    return `${yearString}-${monthString}-${dayString}`;
  };

  // Function to filter data based on current month and today's day
  const filterData = (records, skipsRecords) => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // Day of the week (0 for Sunday, 1 for Monday, etc.)

    return records.filter((record) => {
      // Check if there are any skip records that match the subscription
      const skipMatches = skipsRecords.some((skip) => {
        const skipLunchOrDinner = skip.fields["Lunch/Dinner"].some((meal) =>
          record.fields["Lunch/Dinner"].includes(meal)
        );

        const [month, day, year] = new Date()
          .toLocaleString("en-US", options)
          .split(",")[0]
          .split("/");

        return (
          skip.fields.Date === getYYYYMMDDFormat(month, day, year) &&
          skipLunchOrDinner &&
          // skip.fields.Name === record.fields.Name
          skip.fields.Name.includes(record.fields.Name)
        );
      });

      // Check if Month matches current month and Days includes today's day
      return (
        record.fields.Month ===
          currentDate.toLocaleString("default", { month: "long" }) &&
        record.fields.Days.includes(getDayName(currentDay)) &&
        !skipMatches
        // conditionSelectedShowOrderTypeOption()
      );
    });
  };

  const filterOneTimeData = (records) => {
    return records.filter((record) => {
      // Check if Month matches current month and Days includes today's day

      const [month, day, year] = new Date()
        .toLocaleString("en-US", options)
        .split(",")[0]
        .split("/");

      return (
        record.fields.Date === getYYYYMMDDFormat(month, day, year)
        // conditionSelectedShowOrderTypeOption()
      );
    });
  };

  // Function to get day name based on day index (0 for Sunday, 1 for Monday, etc.)
  const getDayName = (dayIndex) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayIndex];
  };

  try {
    const skipsResponse = await axios.get(
      "https://api.airtable.com/v0/appdxgViWfvCf8qq8/tbl6zNrp3xGOQ1rkD",
      {
        headers: {
          Authorization:
            "Bearer patwBa9X03vyo4aHj.efbe6aa9e86c235a23cb6ee9979f85c221a52b99df186141c3ac812e22925ab8",
        },
      }
    );

    const response = await axios.get(
      "https://api.airtable.com/v0/appdxgViWfvCf8qq8/tbl5UA31oW39y4Bv6",
      {
        headers: {
          Authorization:
            "Bearer patwBa9X03vyo4aHj.efbe6aa9e86c235a23cb6ee9979f85c221a52b99df186141c3ac812e22925ab8",
        },
      }
    );

    const oneTimeResponse = await axios.get(
      "https://api.airtable.com/v0/appdxgViWfvCf8qq8/tblUjWgud6SPD95B8",
      {
        headers: {
          Authorization:
            "Bearer patwBa9X03vyo4aHj.efbe6aa9e86c235a23cb6ee9979f85c221a52b99df186141c3ac812e22925ab8",
        },
      }
    );

    // Filter records based on current month and today's day
    filteredData = filterData(
      response.data.records,
      skipsResponse.data.records
    );

    oneTimeData = filterOneTimeData(oneTimeResponse.data.records);
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  let finalResponse = [];

  // Iterate through the filtered data and make API calls
  for (const record of filteredData) {
    try {
      // Call your API with the record data
      const response = await axios.post(
        "https://api.airtable.com/v0/appdxgViWfvCf8qq8/tbl6LVbKBXISHqeug",
        {
          records: [
            {
              fields: {
                Date: new Date().toLocaleDateString("en-US"),
                "Number of Meals": 1,
                Name: record.fields.Name,
              },
            },
          ],
        },
        {
          headers: {
            Authorization:
              "Bearer patZsWjwibhBHVXP2.a30ddacf6739a8f6043f842f2ff4f9e033334bba5ee482b8b0a024d8e52472b7",
          },
        }
      );

      // console.log(response);

      finalResponse.push({
        Date: new Date().toLocaleDateString("en-US"),
        "Number of Meals": 1,
        Name: record.fields.Name,
      });
    } catch (error) {
      console.error("Error pushing data:", error);
    }
  }

  for (const record of oneTimeData) {
    try {
      // Call your API with the record data
      const response = await axios.post(
        "https://api.airtable.com/v0/appdxgViWfvCf8qq8/tbl6LVbKBXISHqeug",
        {
          records: [
            {
              fields: {
                Date: new Date().toLocaleDateString("en-US"),
                "Number of Meals": 1,
                Name: record.fields.Name,
              },
            },
          ],
        },
        {
          headers: {
            Authorization:
              "Bearer patZsWjwibhBHVXP2.a30ddacf6739a8f6043f842f2ff4f9e033334bba5ee482b8b0a024d8e52472b7",
          },
        }
      );

      // console.log(response);

      finalResponse.push({
        Date: new Date().toLocaleDateString("en-US"),
        "Number of Meals": 1,
        Name: record.fields.Name,
      });
    } catch (error) {
      console.error("Error pushing data:", error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: finalResponse,
    }),
  };
};

// module.exports = {
//   handler,
// };
