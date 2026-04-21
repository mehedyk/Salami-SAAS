export const bkashConfig = {
  apiUrl: process.env.BKASH_API_URL || "https://tokenized.sandbox.bka.sh/v1.2.0",
  username: process.env.BKASH_USERNAME || "",
  password: process.env.BKASH_PASSWORD || "",
  appKey: process.env.BKASH_APP_KEY || "",
  appSecret: process.env.BKASH_APP_SECRET || "",
};

export async function getBkashToken(): Promise<string> {
  const { apiUrl, username, password, appKey, appSecret } = bkashConfig;

  const response = await fetch(`${apiUrl}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username,
      password,
    },
    body: JSON.stringify({
      app_key: appKey,
      app_secret: appSecret,
    }),
  });

  const data = await response.json();

  if (data.errorCode) {
    throw new Error(data.errorMessage || "Failed to get bKash token");
  }

  return data.id_token;
}

export async function createBkashPayment(
  amount: number,
  merchantInvoiceNumber: string
): Promise<{ paymentUrl: string; trxId: string }> {
  const token = await getBkashToken();

  const response = await fetch(`${bkashConfig.apiUrl}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      idempotency: merchantInvoiceNumber,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: " ",
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/bkash/callback`,
      amount: amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber,
    }),
  });

  const data = await response.json();

  if (data.errorCode) {
    throw new Error(data.errorMessage || "Failed to create bKash payment");
  }

  return {
    paymentUrl: data.paymentId,
    trxId: data.trxId,
  };
}

export async function executeBkashPayment(paymentId: string): Promise<any> {
  const token = await getBkashToken();

  const response = await fetch(`${bkashConfig.apiUrl}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ paymentId }),
  });

  return response.json();
}
