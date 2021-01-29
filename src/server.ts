import './loadenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import "reflect-metadata";
import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import BaseRouter from './routes/index.routes';
import logger from '@shared/logger';
// Init express
const app = express();
import cors from 'cors';
/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/


// Cors
app.use(cors())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // Will update DOmain later here
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/', BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});


/************************************************************************************
 *                              Swagger Setup 
 ***********************************************************************************/

//Swagger Config
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "smai-qb-service",
            description: " API documentation",
            contact: {
                name: "smai"
            },
            version: "1.0.0"
        }
    },
    apis: ["**/*.ts"]
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.get('/index', (req: Request, res: Response) => {
    res.sendFile('index.html', { root: viewsDir });
});

app.get('/', (req, res) => {
    res.redirect('/api-docs')
})

export default app;
