"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const API_KEY = process.env.API_KEY;
const PAYMENT_INTEGRATION_ID = Number(process.env.PAYMENT_INTEGRATION_ID);
class PaymobPayment {
    constructor(amount, currency, integrationId) {
        this.amount = amount;
        this.currency = currency;
        this.integrationId = integrationId;
    }
    initPayment() {
        return __awaiter(this, void 0, void 0, function* () {
            const firstToken = yield this.getFirstToken();
            const orderId = yield this.getOrderId(firstToken);
            const finalToken = yield this.getFinalPaymentToken(firstToken, orderId);
            return finalToken;
        });
    }
    getFirstToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://accept.paymob.com/api/auth/tokens';
            const requestData = JSON.stringify({
                api_key: API_KEY,
            });
            const requestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            try {
                const res = yield axios_1.default.post(url, requestData, requestConfig);
                const firstToken = res.data.token;
                return firstToken;
            }
            catch (error) {
                console.error(error);
                throw new Error('Could not get first token.');
            }
        });
    }
    getOrderId(firstToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://accept.paymob.com/api/ecommerce/orders';
            const requestData = JSON.stringify({
                auth_token: firstToken,
                delivery_needed: 'false',
                amount_cents: this.amount * 100,
                currency: this.currency,
                items: [],
            });
            const requestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            try {
                const res = yield axios_1.default.post(url, requestData, requestConfig);
                const orderId = res.data.id;
                return orderId;
            }
            catch (error) {
                console.error(error);
                throw new Error('Failed to get orderId');
            }
        });
    }
    getFinalPaymentToken(firstToken, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://accept.paymob.com/api/acceptance/payment_keys';
            const requestData = JSON.stringify({
                auth_token: firstToken,
                order_id: orderId,
                amount_cents: this.amount * 100,
                currency: this.currency,
                expiration: 3600,
                integration_id: this.integrationId,
                billing_data: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    phone_number: '+1234567890',
                    // the rest can be NA
                    apartment: 'NA',
                    floor: 'NA',
                    street: 'NA',
                    building: 'NA',
                    shipping_method: 'NA',
                    postal_code: 'NA',
                    city: 'NA',
                    country: 'NA',
                    state: 'NA',
                },
            });
            const requestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            try {
                const res = yield axios_1.default.post(url, requestData, requestConfig);
                const finalPaymentToken = res.data.token;
                return finalPaymentToken;
            }
            catch (error) {
                console.error(error);
                throw new Error('Failed to get final token');
            }
        });
    }
}
class PaymobCardPayment extends PaymobPayment {
    getPaymentIFrameUrl(paymentToken) {
        const frameId = 827634;
        const IframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${frameId}?payment_token=${paymentToken}`;
        return IframeUrl;
    }
}
class PaymobMobileWalletPayment extends PaymobPayment {
    constructor(amount, currency, integrationId, mobileWalletNumber) {
        super(amount, currency, integrationId);
        this.amount = amount;
        this.currency = currency;
        this.integrationId = integrationId;
        this.mobileWalletNumber = mobileWalletNumber;
    }
    getRedirectUrl(paymentToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://accept.paymob.com/api/acceptance/payments/pay';
            const requestData = JSON.stringify({
                payment_token: paymentToken,
                source: {
                    identifier: this.mobileWalletNumber,
                    subtype: 'WALLET',
                },
            });
            const requestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            try {
                const res = yield axios_1.default.post(url, requestData, requestConfig);
                const { success, pending, redirection_url: redirectUrl } = res.data;
                console.log({ success }, { pending });
                // check for success?
                return redirectUrl;
            }
            catch (error) {
                console.error(error);
                throw new Error('Failed to get redirectUrl');
            }
        });
    }
}
function payWithCard() {
    return __awaiter(this, void 0, void 0, function* () {
        // ^^ Probably store in database or temp database? + send it to client
        const paymobCardPayment = new PaymobCardPayment(20, 'EGP', PAYMENT_INTEGRATION_ID);
        const paymentToken = yield paymobCardPayment.initPayment();
        const IframeUrl = paymobCardPayment.getPaymentIFrameUrl(paymentToken);
        console.log(IframeUrl);
    });
}
function payWilMobileWallet() {
    return __awaiter(this, void 0, void 0, function* () {
        const paymobWalletPayment = new PaymobMobileWalletPayment(30, 'EGP', PAYMENT_INTEGRATION_ID, '01010101010');
        const paymentToken = yield paymobWalletPayment.initPayment();
        const redirect_url = yield paymobWalletPayment.getRedirectUrl(paymentToken);
        console.log(redirect_url);
    });
}
