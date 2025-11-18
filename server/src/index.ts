import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
//import { Pool } from 'pg';

//const pool = new Pool({ connectionString: process.env.DATABASE_URL });



/** ROUTE IMPORTS */
import shopRoutes from '../routes/shopRoutes';
import searchRoutes from '../routes/searchRoutes';
import registerRoutes from '../routes/registerRoutes';
import signinRoutes from '../routes/signinRoutes';

/** CONFIGURATION */
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


/** ROUTES */
app.use('/shop', shopRoutes); //http://localhost:8080/shop
app.use('/', searchRoutes); //http://localhost:8080/products
app.use('/', registerRoutes); //http://localhost:8080/register
app.use('/', signinRoutes); //http://localhost:8080/signin
app.get('/', (req:  Request, res: Response) => {
  res.send('Welcome to the E-commerce API');
})


/** ERROR HANDLING */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

/** START SERVER */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});