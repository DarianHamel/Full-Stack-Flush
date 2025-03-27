# Load Testing Results
Our non-functional feature is to handle 50 concurrent users with at least 500 requests per minute.

# Test Conditions
* We used Apache JMeter to perform our load testing
* Number of Threads (users): 50
* Ramp-up period (seconds): 10 -> to slowly ramp up the requests
* Loop Count: 10 times per user
* Total: 500 requests per user performed

# How to Run
1. Start Apache Jmeter
2. Open the LoadTest.jmx file
3. Make sure client/server for the actual application are running
4. Press start to run the tests

# Results
| Label                                         | # Samples | Average | Median | 90% Line | 95% Line | 99% Line | Min  | Max   | Error % | Throughput (req per second) | Received KB/sec | Sent KB/sec |
|-----------------------------------------------|-----------|---------|--------|----------|----------|----------|------|-------|---------|------------|----------------|--------------|
| 0.1 (Generic Home Page Request)              | 500       | 2       | 2      | 3        | 4        | 5        | 1    | 12    | 0.00%   | 2.06369    | 1.96           | 0.42         |
| WebSocket Open Connection                     | 500       | 813     | 698    | 1620     | 1879     | 2170     | 1    | 2268  | 0.00%   | 2.06026    | 0.26           | 0.49         |
| WebSocket Single Write Sampler (JOIN)        | 500       | 0       | 0      | 0        | 0        | 1        | 0    | 1     | 0.00%   | 2.06028    | 0.00           | 0.15         |
| WebSocket Single Write Sampler (STAND)       | 500       | 0       | 0      | 0        | 0        | 1        | 0    | 1     | 0.00%   | 2.06028    | 0.00           | 0.19         |
| WebSocket Close                               | 500       | 18      | 3      | 6        | 9        | 587      | 1    | 920   | 0.00%   | 2.06027    | 0.05           | 0.06         |
| 1.1 (Blackjack + Poker Betting)              | 500       | 2452    | 2427   | 3567     | 4350     | 5427     | 141  | 9987  | 0.00%   | 2.05495    | 0.75           | 0.54         |
| 2.1 User Accounts (Login)                     | 500       | 3470    | 3565   | 4481     | 5376     | 6475     | 297  | 7117  | 0.00%   | 2.04549    | 1.57           | 0.58         |
| 2.2 User Accounts (Signup)                    | 500       | 5105    | 5161   | 6837     | 8152     | 9995     | 1296 | 12758 | 0.00%   | 2.03733    | 2.26           | 0.62         |
| 3.1 Safe Gambling (Set Money Limits)          | 500       | 2359    | 2377   | 3513     | 3876     | 5112     | 115  | 10206 | 0.00%   | 2.05789    | 0.78           | 0.58         |
| 3.2 Safe Gambling (Get Limits)                | 500       | 1421    | 1280   | 2327     | 2651     | 4446     | 55   | 11810 | 0.00%   | 2.07177    | 0.89           | 0.47         |
| 4.1 Get Tutorials (Backend)                   | 500       | 1476    | 1328   | 2595     | 2874     | 3532     | 55   | 11810 | 0.00%   | 2.08461    | 4.37           | 0.45         |
| 4.2 Get Tutorials (Frontend)                  | 500       | 3       | 3      | 5        | 6        | 7        | 1    | 8     | 0.00%   | 2.09145    | 1.99           | 0.45         |
| 5.1 Leaderboard (Get Leaderboard)             | 500       | 2074    | 2041   | 3204     | 3421     | 3971     | 243  | 4803  | 0.00%   | 2.08789    | 205.62         | 0.44         |
| 6.1 User Stats (Balance)                      | 500       | 1361    | 1245   | 2379     | 2660     | 3143     | 55   | 4754  | 0.00%   | 2.10839    | 0.74           | 0.48         |
| 6.2 User Stats (Get All Stats)                | 500       | 1388    | 1265   | 2440     | 2757     | 3233     | 55   | 7768  | 0.00%   | 2.12742    | 0.85           | 0.48         |
| 7.1 Poker (Start Game)                        | 500       | 661     | 585    | 1282     | 1501     | 2028     | 0    | 2040  | 0.00%   | 2.15299    | 1.49           | 0.55         |
| 7.2 Poker (Draw Cards)                        | 500       | 672     | 619    | 1311     | 1640     | 1983     | 0    | 2242  | 0.00%   | 2.15597    | 1.05           | 0.52         |
| 7.3 Poker (Score Cards)                       | 500       | 632     | 556    | 1223     | 1487     | 2046     | 0    | 2246  | 0.00%   | 2.16936    | 0.95           | 0.92         |
| **TOTAL**                                     | 9000      | 1328    | 859    | 3443     | 4385     | 6153     | 0    | 12758 | 0.00%   | 36.48688   | 219.03         | 8.11         |

As we can see from the results table above we are handling an average of approximately 2188 requests per minute which exceeds our target of 500 requests per minute. We have successfully reached our target of handling 50 concurrent users with at least 500 requests per minute.