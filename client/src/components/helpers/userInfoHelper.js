import axios from "axios";

export const checkAndResetDailyValues = async (username) => {
    try {
      const response = await axios.get(`http://localhost:5050/getLastLogin`, { params: {username}});
      const data = response.data;
      const lastLoginDate = new Date(data.lastLogin).toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];

      if (lastLoginDate !== today) {
        await axios.post(`http://localhost:5050/resetDailyLimits`, {username});
        console.log("Daily values reset");
      }
      console.log("Daily values checked");
    } catch (error) {
      console.error('Error checking and resetting daily values:', error);
    }
};

export const updateTimeSpent = async (username, timeSpent) => {
  try{
    await axios.post('http://localhost:5050/setTimeSpent', {username, timeSpent});
  }
  catch (error){
    console.error('A problem occurred updating time spent: ', error);
  }
};

export const fetchUserBalance = async (username) => {
  try {
    const response = await axios.get(`http://localhost:5050/getBalance`, {
      params: { username }
    });
    return response.data.balance;
  } catch (error) {
    console.error('Error fetching user balance:', error);
  }
};

export const fetchUserLimits = async (username) => {
  try {
    const response = await axios.get(`http://localhost:5050/getLimits`, {
      params: { username }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user limits:', error);
  }
}