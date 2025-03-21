import axios from "axios";

/*
Checks the last day logged in
If it's a different day than last played, reset the daily limits
*/
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

/*
Update the timeSpent of the user
Calls route /setTimeSpent
Input: username, timeSpent
*/
export const updateTimeSpent = async (username, timeSpent) => {
  try{
    await axios.post('http://localhost:5050/setTimeSpent', {username, timeSpent});
  }
  catch (error){
    console.error('A problem occurred updating time spent: ', error);
  }
};

/*
Returns the user balance
Calls route /getBalance
Input: username
Returns: Users balance or an error if the user is not found
*/
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

/*
Returns the users limit
Calls route /getLimits
Input: username
Returns: Limits and respective information to check limits
*/
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