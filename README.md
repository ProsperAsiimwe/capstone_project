### TERP

TERP API repository

#### Base Technologies

| Technology | Version |
| ---------- | ------- |
| Node JS    | 12.x    |
| NPM        | 6.x     |
| PostgreSQL | 12.x    |

##### Main Packages

| Packages    | Role                     |
| ----------- | ------------------------ |
| Express Js  | API Web Server           |
| Sequelize   | Object Relational Mapper |
| Passport Js | User Authentication      |
| Jest        | Unit Testing             |
| JWT         | API Encryption           |

### API Requirements

- NODE v12+
- NPM V6+
- PostgreSQL Installed

### Getting started.

- Clone the repo from Gitlab.
- Move to the project directory `terp-backend`.
- Create Postgres Database.
- Create `.env` file from `.env.example` and update the necessary environment variables.
- Install dependecies with `npm install`.
- To run the app for develop run `npm run start:dev`.
- To run the app at production run `npm start`.
- The your app will de deployed on either port `5050` or your desired port number specified in the `.env` file.

### Using the API

| Endpoint                                                           | Method | Function                                              |
| ------------------------------------------------------------------ | ------ | ----------------------------------------------------- |
| /api/v1/users/auth/login                                           | POST   | Login a user                                          |
| /api/v1/users/auth                                                 | GET    | Get all users                                         |
| /api/v1/users/auth/:id                                             | GET    | Get a specific user                                   |
| /api/v1/programme-mgt/colleges                                     | GET    | Fetch all colleges                                    |
| /api/v1/programme-mgt/colleges/{college id}                        | GET    | Fetch a specific college                              |
| /api/v1/programme-mgt/colleges                                     | POST   | Create a new college                                  |
| /api/v1/programme-mgt/colleges/{college id}                        | PUT    | Update or edit data of a specific college             |
| /api/v1/programme-mgt/faculties/{faculty id}                       | DELETE | Delete a specific faculty                             |
| /api/v1/programme-mgt/faculties                                    | GET    | Fetch all faculties                                   |
| /api/v1/programme-mgt/faculties/{faculty id}                       | GET    | Fetch a specific faculty                              |
| /api/v1/programme-mgt/faculties                                    | POST   | Create a new faculty                                  |
| /api/v1/programme-mgt/faculties/{faculty id}                       | PUT    | Update or edit data of a specific faculty             |
| /api/v1/programme-mgt/faculties/{faculty id}                       | DELETE | Delete a specific faculty                             |
| /api/v1/programme-mgt/departments/{department id}                  | DELETE | Delete a specific department                          |
| /api/v1/programme-mgt/departments                                  | GET    | Fetch all departments                                 |
| /api/v1/programme-mgt/departments/{department id}                  | GET    | Fetch a specific department                           |
| /api/v1/programme-mgt/departments                                  | POST   | Create a new department                               |
| /api/v1/programme-mgt/departments/{department id}                  | PUT    | Update or edit data of a specific department          |
| /api/v1/programme-mgt/departments/{department id}                  | DELETE | Delete a specific department                          |
| /api/v1/programme-mgt/programmes                                   | GET    | Fetch all programmes                                  |
| /api/v1/programme-mgt/programmes/{program id}                      | GET    | Fetch a specific program                              |
| /api/v1/programme-mgt/programmes                                   | POST   | Create a new program                                  |
| /api/v1/programme-mgt/programmes/{program id}                      | PUT    | Update or edit data of a specific program             |
| /api/v1/programme-mgt/programmes/{program id}                      | DELETE | Delete a specific program                             |
| /api/v1/programme-mgt/programmeVersions                            | GET    | Fetch all program versions                            |
| /api/v1/programme-mgt/programmeVersions/{programmeVersion id}      | GET    | Fetch a specific program version                      |
| /api/v1/programme-mgt/programmeVersions                            | POST   | Create a new program                                  |
| /api/v1/programme-mgt/programmeVersions/{programmeVersion id}      | PUT    | Update or edit data of a specific Program Version     |
| /api/v1/programme-mgt/programmeVersions/{programmeVersion id}      | DELETE | Delete a specific Program Version                     |
| /api/v1/programme-mgt/courseUnits                                  | GET    | Fetch all courseUnits                                 |
| /api/v1/programme-mgt/courseUnits/{courseUnit id}                  | GET    | Fetch a specific courseUnit                           |
| /api/v1/programme-mgt/courseUnits                                  | POST   | Create a new courseUnit                               |
| /api/v1/programme-mgt/courseUnits/{courseUnits id}                 | PUT    | Update or edit data of a specific courseUnits         |
| /api/v1/programme-mgt/courseUnitss/{courseUnits id}                | DELETE | Delete a specific courseUnits                         |
| /api/v1/programme-mgt/specializations                              | GET    | Fetch all specializations                             |
| /api/v1/programme-mgt/specializations/{specialization id}          | GET    | Fetch a specific specialization                       |
| /api/v1/programme-mgt/specializations                              | POST   | Create a new specialization                           |
| /api/v1/programme-mgt/specializations/{specializations id}         | PUT    | Update or edit data of a specific specializations     |
| /api/v1/programme-mgt/specializations/{specializations id}         | DELETE | Delete a specific specializations                     |
| /api/v1/programme-mgt/subjectCombinations                          | GET    | Fetch all subjectCombinations                         |
| /api/v1/programme-mgt/subjectCombinations/{subjectCombination id}  | GET    | Fetch a specific subjectCombination                   |
| /api/v1/programme-mgt/subjectCombinations                          | POST   | Create a new subjectCombination                       |
| /api/v1/programme-mgt/subjectCombinations/{subjectCombinations id} | PUT    | Update or edit data of a specific subjectCombinations |
| /api/v1/programme-mgt/subjectCombinations/{subjectCombinations id} | DELETE | Delete a specific subjectCombinations                 |
| /api/v1/programme-mgt/gradings                                     | GET    | Fetch all gradings                                    |
| /api/v1/programme-mgt/gradings                                     | POST   | Create a new grading                                  |
| /api/v1/programme-mgt/gradings/{grading id}                        | GET    | Fetch a specific grading                              |
| /api/v1/programme-mgt/gradings/{grading id}                        | PUT    | Edit specific grading                                 |
| /api/v1/programme-mgt/gradings/{grading id}                        | DELETE | Delete specific grading                               |
