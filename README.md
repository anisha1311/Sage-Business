# smai-qb-service

Qb service helps to connect QB business. This service provides the connection link & then fetch data of all required entities. This data is mapped & pushed to queue for processing by business service

* Get connection URL
* Connect business
* Load business data
* Disconnect business
* Sync business



## Clone the Service
clone the qb-service with the help of below command on the command prompt :
`git clone https://github.com/hashchainft/accounting-integration-boilerplate/`


##  Install the package

After cloning the project need to install all the packages that are used in the service so simply run the below command :
`npm install`

## Setting up ENV

Next you have to setup your env file you can take help from the keys.env for variables used.

## Run Project

After all setup run project using command  `npm run start:dev`

if you want to run the project in development mode with the help of nodemon then run the project `npm run start:mon`
and then you see the qb-service running on which port.

if you want to run the project in Production mode then run the project with following command 
`npm start`

## Get Response 
In this service when hit the end point then getting the any of three response i.e. success , not-found and failure.

For success :
`{ status:  true, data:  successObject, message:  "business added Successfully" }`

For bad request :
`{ status:  false, error:  errorObject, message:  "not found" }`

For Internal Server error :
`{ status:  false, message:  "something went wrong", error:  error }`