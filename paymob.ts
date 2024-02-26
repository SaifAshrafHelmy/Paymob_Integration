import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios';
import 'dotenv/config';
const API_KEY = process.env.API_KEY;
const PAYMENT_INTEGRATION_ID = Number(process.env.PAYMENT_INTEGRATION_ID);

class PaymobPayment {
    constructor(
        public amount: number,
        public currency: 'EGP' | 'USD',
        public integrationId: number
    ) {}
    async initPayment() {
        const firstToken = await this.getFirstToken();
        const orderId = await this.getOrderId(firstToken);
        const finalToken = await this.getFinalPaymentToken(firstToken, orderId);
        return finalToken;
    }

    private async getFirstToken() {
        const url: string = 'https://accept.paymob.com/api/auth/tokens';
        const requestData: string = JSON.stringify({
            api_key: API_KEY,
        });
        const requestConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        try {
            const res = await axios.post(url, requestData, requestConfig);
            const firstToken = res.data.token;
            return firstToken;
        } catch (error) {
            console.error(error);
            throw new Error('Could not get first token.');
        }
    }
    private async getOrderId(firstToken: string) {
        const url: string = 'https://accept.paymob.com/api/ecommerce/orders';
        const requestData: string = JSON.stringify({
            auth_token: firstToken,
            delivery_needed: 'false',
            amount_cents: this.amount * 100,
            currency: this.currency,
            items: [],
        });
        const requestConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        try {
            const res = await axios.post(url, requestData, requestConfig);
            const orderId = res.data.id;
            return orderId;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get orderId');
        }
    }

    private async getFinalPaymentToken(firstToken: string, orderId: string) {
        const url: string =
            'https://accept.paymob.com/api/acceptance/payment_keys';
        const requestData: string = JSON.stringify({
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
        const requestConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        try {
            const res = await axios.post(url, requestData, requestConfig);
            const finalPaymentToken = res.data.token;
            return finalPaymentToken;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get final token');
        }
    }
}
class PaymobCardPayment extends PaymobPayment {
    public getPaymentIFrameUrl(paymentToken: string) {
        const frameId = 827634;
        const IframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${frameId}?payment_token=${paymentToken}`;

        return IframeUrl;
    }
}
class PaymobMobileWalletPayment extends PaymobPayment {
    constructor(
        public amount: number,
        public currency: 'EGP' | 'USD',
        public integrationId: number,
        public mobileWalletNumber: string
    ) {
        super(amount, currency, integrationId);
    }
    async getRedirectUrl(paymentToken: string) {
        const url: string =
            'https://accept.paymob.com/api/acceptance/payments/pay';
        const requestData: string = JSON.stringify({
            payment_token: paymentToken,
            source: {
                identifier: this.mobileWalletNumber,
                subtype: 'WALLET',
            },
        });
        const requestConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        try {
            const res = await axios.post(url, requestData, requestConfig);
            const { success, pending, redirection_url: redirectUrl } = res.data;
            console.log({ success }, { pending });
            // check for success?
            return redirectUrl;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get redirectUrl');
        }
    }
}

async function payWithCard() {
    // ^^ Probably store in database or temp database? + send it to client
    const paymobCardPayment = new PaymobCardPayment(
        20,
        'EGP',
        PAYMENT_INTEGRATION_ID
    );
    const paymentToken = await paymobCardPayment.initPayment();
    const IframeUrl = paymobCardPayment.getPaymentIFrameUrl(paymentToken);
    console.log(IframeUrl);
}

async function payWilMobileWallet() {
    const paymobWalletPayment = new PaymobMobileWalletPayment(
        30,
        'EGP',
        PAYMENT_INTEGRATION_ID,
        '01010101010'
    );
    const paymentToken = await paymobWalletPayment.initPayment();
    const redirect_url = await paymobWalletPayment.getRedirectUrl(paymentToken);
    console.log(redirect_url);
}
