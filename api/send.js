function clean(value, maxLength = 2000) {
  return String(value ?? "")
    .trim()
    .slice(0, maxLength);
}


export default async function handler(req, res) {
  // ==================================================
  // CORS
  // ==================================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  // Browser sends this before POST
  if (req.method === "OPTIONS") {
    return res
      .status(204)
      .end();
  }


  // ==================================================
  // ONLY POST
  // ==================================================

  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      "POST, OPTIONS"
    );

    return res
      .status(405)
      .json({
        error:
          "Method not allowed",
      });
  }


  // ==================================================
  // TELEGRAM CONFIG
  // ==================================================

  const BOT_TOKEN =
    process.env
      .TELEGRAM_BOT_TOKEN;

  const CHAT_ID =
    process.env
      .TELEGRAM_CHAT_ID;


  if (
    !BOT_TOKEN ||
    !CHAT_ID
  ) {
    console.error(
      "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID"
    );

    return res
      .status(500)
      .json({
        error:
          "Server configuration is missing",
      });
  }


  try {
    // ==================================================
    // BODY
    // ==================================================

    const body =
      typeof req.body === "string"
        ? JSON.parse(
            req.body
          )
        : req.body ?? {};


    const fullName =
      clean(
        body.fullName,
        120
      );


    const phone =
      clean(
        body.phone,
        50
      );


    const deliveryAddress =
      clean(
        body.deliveryAddress,
        250
      );


    const deliveryType =
      clean(
        body.deliveryType,
        100
      );


    const deliveryPlace =
      clean(
        body.deliveryPlace,
        300
      );


    const description =
      clean(
        body.description,
        5000
      );


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !fullName ||
      !phone ||
      !deliveryAddress ||
      !deliveryType ||
      !deliveryPlace ||
      !description
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields",
        });
    }


    // ==================================================
    // TELEGRAM MESSAGE
    // ==================================================

    const message = [
      "🛒 NY BESTILLING – KjørNesodden",

      "",

      `👤 Navn: ${fullName}`,

      `📞 Telefon: ${phone}`,

      `📍 Leveringsadresse: ${deliveryAddress}`,

      "",

      `🛍️ Type: ${deliveryType}`,

      `🏪 Restaurant(er): ${deliveryPlace}`,

      "",

      "🍔 Bestilling:",

      description,

      "",

      `🕒 Mottatt: ${
        new Intl.DateTimeFormat(
          "nb-NO",
          {
            timeZone:
              "Europe/Oslo",

            dateStyle:
              "medium",

            timeStyle:
              "short",
          }
        ).format(
          new Date()
        )
      }`,
    ].join(
      "\n"
    );


    // ==================================================
    // SEND TO TELEGRAM
    // ==================================================

    const telegramResponse =
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              chat_id:
                CHAT_ID,

              text:
                message,

              disable_web_page_preview:
                true,
            }),
        }
      );


    const telegramResult =
      await telegramResponse
        .json();


    // ==================================================
    // TELEGRAM ERROR
    // ==================================================

    if (
      !telegramResponse.ok ||
      !telegramResult.ok
    ) {
      console.error(
        "Telegram API error:",
        telegramResult
      );


      return res
        .status(502)
        .json({
          error:
            "Telegram send failed",
        });
    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return res
      .status(200)
      .json({
        success:
          true,
      });

  } catch (error) {
    console.error(
      "Order submission error:",
      error
    );


    return res
      .status(500)
      .json({
        error:
          "Telegram send failed",
      });
  }
}