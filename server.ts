import express, { Express, Request, Response } from 'express';
import 'dotenv/config';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.post('/post_pay', (req: Request, res: Response) => {
    const webhookData = req.body;

    // Extracting important data
    const transactionId = webhookData.obj.id;
    const transactionCreatedAt = new Date(
        webhookData.obj.created_at
    ).toLocaleString();

    const success = webhookData.obj.success;
    const amount = webhookData.obj.amount_cents / 100;
    const currency = webhookData.obj.currency;

    const orderId = webhookData.obj.order.id;
    const status = success ? 'Success' : 'Failed';

    console.log(`--- Transaction ID: ${transactionId} ---`);
    console.log(`--- Transaction Created At ${transactionCreatedAt} ---`);
    console.log(`Status: ${status}`);
    console.log(`Order ID: ${orderId}`);
    console.log(`Amount: ${currency} ${amount}`);

    res.status(200).send();
});

app.get('/payment_done', (req: Request, res: Response) => {
    res.json({
        message:
            'Payment process done, this is a url in my web app with the receipt ...',
    });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
