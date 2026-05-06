exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const { source, name, email, message, role, idea } = payload;

    if (!source || !name || !email) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing required fields" }),
      };
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Invalid email" }),
      };
    }

    if (source === "contact" && !message) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing message" }),
      };
    }

    if (source === "registration" && (!role || !idea)) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: false, error: "Missing registration fields" }),
      };
    }

    const webhookUrl = process.env.SUBMISSION_WEBHOOK_URL;
    if (webhookUrl) {
      const forwardRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          receivedAt: Date.now(),
          source: "ember-network-site",
        }),
      });
      if (!forwardRes.ok) {
        throw new Error("Webhook forwarding failed");
      }
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ok: true,
        receivedAt: Date.now(),
        source,
      }),
    };
  } catch {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ok: false, error: "Unable to process request" }),
    };
  }
};
