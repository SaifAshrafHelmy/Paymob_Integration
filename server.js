"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.post('/post_pay', (req, res) => {
    console.log(req.body);
    res.json({ message: 'listening...' });
});
app.get('/post_pay', (req, res) => {
    console.log(req);
    console.log('GET');
    res.json({ message: 'listening ...' });
});
app.get('/', (req, res) => {
    res.json({ message: 'Home ...' });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
