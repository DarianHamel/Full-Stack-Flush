# System Architecture
## Class API Diagram

This is an overview of our API. The technologies we used are:

* **MongoDB** for our database
* **Express.js** and **Node.js** for our back-end
* **React.js** for our front-end

```mermaid
%%{
  init: {
    'theme': 'base',
    'themeVariables': {
      'primaryColor': '#BB2528',
      'primaryTextColor': '#fff',
      'primaryBorderColor': 'Black',
      'lineColor': 'Green',
      'secondaryColor': 'Black',
      'tertiaryColor': '#fff'
    }
  }
}%%

flowchart LR

    DB[(MongoDB)] -->|Result| Logic
    subgraph Logic
        NodeJS
        ExpressJS
    end
    Logic -->|Request Data| DB
    Logic -->|Response| Interface
    subgraph Interface
        Browser[Web Browser]
        React.js
    end
    Interface -->|API Calls| Logic
```

## Sequence Diagrams
### Blackjack
![](Images/blackjack_sequence.png)

### Create Account
![](Images/create_account_sequence.png)

### Leaderboard
![](Images/leaderboard_sequence.png)

### Login
![](Images/login_sequence.png)

### Poker Minigame
![](Images/poker_minigame_sequence.png)

### Safe Gambling - Notifications
![](Images/safe_gambling_notifications_sequence.png)

### Teaching Fundamentals
![](Images/teaching_sequence.png)

### User Stats - Safe Gambling
![](Images/user_stats_safe_gambling_sequence.png)

### User Stats
![](Images/user_stats_sequence.png)