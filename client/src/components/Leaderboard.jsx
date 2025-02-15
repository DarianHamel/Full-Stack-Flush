import { useState, useEffect } from "react";

export default function Leaderboard (){
    const[leaderboard, setLeaderboard] = useState([]);
    const[sortBy, setSortBy] = useState("wins");

    //gets the leaderboard data from the API
    useEffect(() =>{
        async function fetchLeaderboard() {
            try{
                const response = await fetch(`http://localhost:5050/api/leaderboard`);

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
    }, [sortBy]);

    function LeaderboardRows(){
        return leaderboard.map((entry, index) => (
            <tr key={entry._id} className="border border-gray-400">
                <td className="border border-gray-400 p-2">{index + 1}</td>
                <td className="border border-gray-400 p-2">{entry.name}</td>
                <td className="border border-gray-400 p-2">{entry.wins}</td>
                <td className="border border-gray-400 p-2">{entry.losses}</td>
            </tr>
        ));
    }

    return(
        <div>
            <h3>Leaderboard</h3>
            <select onChange={(newSort) => setSortBy(newSort.target.value)} value={sortBy} className="border p-2">
                <option value="name">Name</option>
                <option value="wins">Wins</option>
                <option value="losses">Losses</option>
            </select>
            {leaderboard.length === 0 ? (<p>No data available</p>): (
                <div>
                    <table className="w-full border-collapse border border-gray-400">
                        <thead className="bg-grey-200">
                            <tr>
                                <th className="border border-gray-400 p-2">Rank</th>
                                <th className="border border-gray-400 p-2">Name</th>
                                <th className="border border-gray-400 p-2">Wins</th>
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