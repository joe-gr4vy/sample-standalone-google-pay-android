import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  PaymentRequest,
  GooglePayButton as NativeGooglePayButton,
  GOOGLE_PAY_PMI,
} from "@google/react-native-make-payment";

const config = {
  amount: 0.01,
  country: "US",
  currency: "USD",
  gr4vyId: "YOUR_INSTANCE_ID",          // e.g. "spider"
  merchantAccountId: "default",
  sandbox: true,
};

const baseUrl = `https://api.${config.sandbox ? "sandbox." : ""}${config.gr4vyId}.gr4vy.app`;

// The Android emulator reaches your Mac's localhost via 10.0.2.2
const TOKEN_SERVER_URL = "http://10.0.2.2:3002/token";

export default function App() {
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("Initializing...");

  // Fetch a short-lived Gr4vy API token from the local token server.
  // Start the server with: node server.js
  // Make sure private_key.pem is in the same directory as server.js.
  useEffect(() => {
    const fetchToken = async () => {
      setStatus("Fetching token...");
      try {
        const response = await fetch(TOKEN_SERVER_URL);
        const data = await response.json();
        setToken(data.token);
        setStatus("Token ready — tap to pay!");
      } catch (err) {
        setStatus(`Token error: ${err.message}`);
      }
    };

    fetchToken();
  }, []);

  const handlePress = () => {
    setStatus("Opening Google Pay...");

    // Configure Google Pay request
    // Set the gateway value to 'gr4vy' and the gatewayMerchantId to your environment:
    // sandbox: app.gr4vy.sandbox.[gr4vy_id].[merchant_account_id]
    // production: app.gr4vy.[gr4vy_id].[merchant_account_id]
    const googlePayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: "CARD",
          parameters: {
            allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            allowedCardNetworks: ["VISA", "MASTERCARD"],
          },
          tokenizationSpecification: {
            type: "PAYMENT_GATEWAY",
            parameters: {
              gateway: "gr4vy",
              gatewayMerchantId: `app.gr4vy.${config.sandbox ? "sandbox." : ""}${config.gr4vyId}.${config.merchantAccountId}`,
            },
          },
        },
      ],
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice: String(config.amount),
        currencyCode: config.currency,
        countryCode: config.country,
      },
      merchantInfo: {
        // merchantId is Gr4vy's platform-level Google Pay merchant ID — same for all merchants.
        // Documented on the web without Embed page but not currently on this page.
        // Including here as it is likely required for production.
        merchantId: "BCR2DN4T7C3KX6DY",
        merchantName: "Example Merchant",
      },
    };

    // Configure payment details
    const paymentDetails = {
      total: {
        amount: {
          currency: config.currency,
          value: String(config.amount),
        },
      },
    };

    // Create payment methods array
    const paymentMethods = [
      {
        supportedMethods: GOOGLE_PAY_PMI,
        data: googlePayRequest,
      },
    ];

    console.log("Google Pay request:", JSON.stringify(googlePayRequest, null, 2));

    const paymentRequest = new PaymentRequest(paymentMethods, paymentDetails);

    paymentRequest.canMakePayment()
      .then((canMakePayment) => {
        if (canMakePayment) {
          paymentRequest.show()
            .then((response) => {
              // Extract the token from the response
              const googlePayToken = response.paymentMethodData.tokenizationData.token;
              console.log("Google Pay token:", googlePayToken);

              // Send to Gr4vy API
              setStatus("Creating transaction...");
              return fetch(`${baseUrl}/transactions`, {
                method: "POST",
                headers: {
                  Authorization: `bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  amount: config.amount * 100,
                  currency: config.currency,
                  country: config.country,
                  payment_method: {
                    method: "googlepay",
                    token: googlePayToken,
                    redirect_url: "https://example.com/callback",
                  },
                }),
              })
                .then((r) => r.json())
                .then((transaction) => {
                  console.log("Payment successful", transaction);
                  setStatus(`Transaction status: ${transaction.status}`);
                  return transaction;
                })
                .catch((error) => {
                  console.error("Payment failed", error);
                  setStatus(`Payment failed: ${error.message}`);
                  throw error;
                });
            })
            .catch((error) => {
              console.error("Payment sheet error", error);
              setStatus(`Payment sheet error: ${error.message}`);
            });
        } else {
          console.log("Google Pay is not available");
          setStatus("Google Pay is not available on this device.");
        }
      })
      .catch((error) => {
        console.error("Error checking Google Pay availability", error);
        setStatus(`Error: ${error.message}`);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gr4vy Google Pay Sample</Text>
      <Text style={styles.status}>{status}</Text>
      {token && (
        <NativeGooglePayButton
          style={styles.button}
          onPress={handlePress}
          allowedPaymentMethods={[]}
          theme={1}
          type={0}
          radius={8}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    width: 300,
    height: 48,
  },
});
