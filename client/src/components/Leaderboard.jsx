import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import "../design/Leaderboard.css";

const Leaderboard = () => {
    const[leaderboard, setLeaderboard] = useState([]);
    const[sortBy, setSortBy] = useState("wins");
    const[order, setOrderBy] = useState("desc");
    const[filter, setFilter] = useState("");

    /*
    Gets the leaderboard data
    Calls route /leaderboard with filter values
    Sets the leaderboard with the returned data
    */
    useEffect(() =>{
        const fetchLeaderboard = async () => {
            try{
                const { data } = await axios.get(`http://localhost:5050/leaderboard?sortBy=${sortBy}&order=${order}&filter=${filter}`,);
                setLeaderboard(data);
            }
            catch(error){
                console.error("An error occurred with the Network: ", error);
                setLeaderboard([]);
            }
        }

        fetchLeaderboard();
    }, [sortBy, order, filter]);


    /*
    Formats numbers to be displayed in decimal form with trailing letter to display value
    This is done for formatting in the list
    */
    const formatNumber = (num) => {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1) + 'B'; // Billion
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(1) + 'M'; // Million
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + 'K'; // Thousand
        } else {
            return num.toString(); // Less than thousand
        }
    };

    /*
    Each row has these user data displayed
    */
    function LeaderboardRows(){
        return leaderboard.map((entry, index) => (
            <tr key={entry._id} className="leaderboard-entry">
                <td className="leaderboard-entry-index">{index + 1}</td>
                <td className="leaderboard-entry-username">{entry.username}</td>
                <td className="leaderboard-entry-wins">{entry.wins}</td>
                <td className="leaderboard-entry-losses">{entry.losses}</td>
                <td className="leaderboard-entry-ratio">{entry.winLossRatio}</td>
                <td className="leaderboard-entry-money-spent">{formatNumber(entry.moneySpent)}</td>
                <td className="leaderboard-entry-time-spent">{Math.floor(entry.timeSpent/60)}</td>
            </tr>
        ));
    }

    return(
        <div className="leaderboard">
            <h3 className="leaderboard-title">Leaderboard</h3>

            <div className="dropdowns">
                {/*Sort dropdown */}
                <select onChange={(newSort) => setSortBy(newSort.target.value)} value={sortBy} className="sort-dropdown">
                    <option value="username">Username</option>
                    <option value="wins">Wins</option>
                    <option value="losses">Losses</option>
                    <option value="winLossRatio">Win/Loss Ratio</option>
                    <option value="moneySpent">Money Spent</option>
                    <option value="timeSpent">Time Spent</option>
                </select>

                {/*Order dropdown */}
                <select onChange={(newOrder) => setOrderBy(newOrder.target.value)} value={order} className="order-dropdown">
                    <option value="desc">Descending Order</option>
                    <option value="asc">Ascending Order</option>
                </select>

                {/*Filter dropdown */}
                <select onChange={(newFilter) => setFilter(newFilter.target.value)} value={filter} className="filter-dropdown">
                    <option value="">All Users</option>
                    <option value="highSpenders">High Spenders ($1500+)</option>
                    <option value="longestPlayers">Longest Playtime (100+ hrs)</option>
                </select>
            </div>

            {/*Leaderboard table*/}
            <div className="leaderboard-container">
                {leaderboard.length === 0 ? (<p>No data available</p>): (
                    <div>
                        <table className="leaderboard-table">
                            <thead className="leaderboard-table-head">
                                <tr>
                                    <th className="leaderboard-index">Rank</th>
                                    <th className="leaderboard-username">Username</th>
                                    <th className="leaderboard-wins">Wins</th>
                                    <th className="leaderboard-losses">Losses</th>
                                    <th className="leaderboard-ratio">Win/Loss Ratio</th>
                                    <th className="leaderboard-money-spent">Money Spent</th>
                                    <th className="leaderboard-time-spent">Time Spent</th>
                                </tr>
                            </thead>

                            <tbody>
                                {LeaderboardRows()}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>    
        </div>
    );
}

export default Leaderboard;
