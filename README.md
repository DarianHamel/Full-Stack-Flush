# Full Stack Flush

## Short Description

* Full Stack Flush is a gambling web application designed to set a new standard for gambling platforms through its integrated ethical features.

## Wiki Page

* View our wiki page here: [Wiki Page](https://github.com/DarianHamel/Full-Stack-Flush/wiki)

## Project Proposal

* View our project proposal here: [Proposal](https://github.com/DarianHamel/Full-Stack-Flush/blob/main/Documents/proposal.md)

## Architectural Diagram

* View our architectural diagrams here: [Architecture Diagram](https://github.com/DarianHamel/Full-Stack-Flush/blob/main/Documents/architecture.md)

## Branching Strategy and Coding Conventions

* View our branching strategy and coding conventions here: [Branching Strategy and Coding Conventions](https://github.com/DarianHamel/Full-Stack-Flush/blob/main/Documents/conventions.md)

## Testing Plan

* View our testing plan here: [Testing Plan](https://github.com/DarianHamel/Full-Stack-Flush/blob/main/Documents/Full_Stack_Flush-Test_Plan.pdf)

## How to Run

### Installation & Setup

1. **Clone or Download the Repository**  

   **Option 1:** Clone the repository using:
    ```bash
    git clone https://github.com/DarianHamel/Full-Stack-Flush.git
    ```
   **Option 2:** Download as ZIP from GitHub, extract the contents to your desired location.

2. **Navigate to the Project Directory**  

    ```bash
    cd Full-Stack-Flush
    ```

3. **Install Dependencies**  

   Our project has two parts: the **server** (backend) and the **client** (frontend). Install dependencies for both (navigating from the root folder(Full-Stack-Flush)):

   * **Server Dependencies:**
      ```bash
      cd server
      npm ci
      ```
   * **Client Dependencies:**
      ```bash
      cd client
      npm ci
      ```

4. **Run the Tests**

    You should run the tests before starting the project to ensure that everything is functioning as intended. Navigating from the root folder again, the commands would be:
    * **Server Dependencies:**
      ```bash
      cd server
      npm test
      ```

    * **Client Dependencies:**
      ```bash
      cd client
      npm test
      ```


5. **Run the Project**  

   You need to start both the **server** and **client** in separate terminals:

   * **Start the Server:**
      ```bash
      cd server
      npm start
      ```
   * **Start the Client:** *(open a new terminal)*
      ```bash
      cd client
      npm run dev
      ```

5. **Access the Website**  

   Once both the server and client are running, open your browser and go to:
   ```
   http://localhost:5173
   ```

## Meeting Minutes 

* View our meeting minutes here: [Meeting Minutes](https://github.com/DarianHamel/Full-Stack-Flush/tree/main/Documents/Meeting%20Minutes)

## Contributers 

| Name | Username | Role |
|---|---|---|
| Mateo DeSousa | @mateod812 | Full Stack Developer (Leader) |
| Kaye Ruwe Mendoza | @kayerm | Full Stack Developer |
| Darian Hamel | @DarianHamel | Full Stack Developer |
| Prashant Nigam | @real-prash | Full Stack Developer |
| Scott Barrett | @ScottLBarrett | Full Stack Developer |
| Chineze Obi | @Chineze-prog | Full Stack Developer |
