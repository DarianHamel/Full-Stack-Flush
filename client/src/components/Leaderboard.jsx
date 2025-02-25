import { useState, useEffect } from "react";
import axios from "axios";
import LeaderboardModel from "../../../server/Models/LeaderboardModel";

const Leaderboard = () => {
    const[leaderboard, setLeaderboard] = useState([]);
    const[sortBy, setSortBy] = useState("wins");
    const[order, setOrderBy] = useState("desc");
    const[filter, setFilter] = useState("");

    //gets the leaderboard data from the API
    useEffect(() =>{
        const fetchLeaderboard = async () => {
            try{
                const response = await axios.get(`http://localhost:5050/leaderboard?sortBy=${sortBy}&order=${order}&filter=${filter}`);

                if(!response.ok){
                    console.error(`An error has occured with the API: ${response.statusText}`);
                    return;
                }

                const data = await response.json();
                console.log("Got the data: ", data);
                setLeaderboard(data);
            }
            catch(error){
                console.error("An error occurred with the Network: ", error);
            }
        }

        fetchLeaderboard();
    }, [sortBy, order, filter]);

    //each row has these user data displayed
    function LeaderboardRows(){
        return leaderboard.map((entry, index) => (
            <tr key={entry._id} className="border border-gray-400">
                <td className="border border-gray-400 p-2">{index + 1}</td>
                <td className="border border-gray-400 p-2">{entry.username}</td>
                <td className="border border-gray-400 p-2">{entry.wins}</td>
                <td className="border border-gray-400 p-2">{entry.losses}</td>
                <td className="border border-gray-400 p-2">{entry.winLossRatio}</td>
                <td className="border border-gray-400 p-2">{entry.moneySpent}</td>
                <td className="border border-gray-400 p-2">{entry.timeSpent}</td>
            </tr>
        ));
    }

    return(
        <div>
            <h3 className="text-center text-3xl font-bold my-4">Leaderboard</h3>

            <div className="flex gap-4 mb-4">
                {/*Sort dropdown */}
                <select onChange={(newSort) => setSortBy(newSort.target.value)} value={sortBy} className="border p-2">
                    <option value="username">Username</option>
                    <option value="wins">Wins</option>
                    <option value="losses">Losses</option>
                    <option value="winLossRatio">Win/Loss Ratio</option>
                    <option value="moneySpent">Money Spent</option>
                    <option value="timeSpent">Time Spent</option>
                </select>

                {/*Order dropdown */}
                <select onChange={(newOrder) => setOrderBy(newOrder.target.value)} value={order} className="border p-2">
                    <option value="desc">Descending Order</option>
                    <option value="asc">Ascending Order</option>
                </select>

                {/*Filter dropdown */}
                <select onChange={(newFilter) => setFilter(newFilter.target.value)} value={filter} className="border p-2">
                    <option value="">All Users</option>
                    <option value="highSpenders">High Spenders ($1500+)</option>
                    <option value="longestPlayers">Longest Playtime (100+ hrs)</option>
                </select>
            </div>

            {/*Leaderboard table*/}
            {leaderboard.length === 0 ? (<p>No data available</p>): (
                <div>
                    <table className="w-full border-collapse border border-gray-400">
                        <thead className="bg-grey-200">
                            <tr>
                                <th className="border border-gray-400 p-2">Rank</th>
                                <th className="border border-gray-400 p-2">Username</th>
                                <th className="border border-gray-400 p-2">Wins</th>
                                <th className="border border-gray-400 p-2">Losses</th>
                                <th className="border border-gray-400 p-2">Win/Loss Ratio</th>
                                <th className="border border-gray-400 p-2">Money Spent</th>
                                <th className="border border-gray-400 p-2">Time Spent</th>
                            </tr>
                        </thead>

                        <tbody>
                            {LeaderboardRows()}
                        </tbody>
                    </table>
                </div>
            )}
        </div>    
    );
}

export default Leaderboard;