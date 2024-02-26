import express, { Express, Request, Response } from 'express';
import 'dotenv/config';

const app: Express = express();
const port = process.env.PORT || 3000;

app.post('/post_pay', (req: Request, res: Response) => {
    console.log(req.body);
    res.json({ message: 'listening...' });
});

app.get('/post_pay', (req: Request, res: Response) => {
    console.log(req);
    console.log('GET');
    res.json({ message: 'listening ...' });
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Home ...' });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
