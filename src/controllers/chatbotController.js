require("dotenv").config();
import request from "request";
import  chatbotSevices from "../services/chatbotSevices";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
let getHomePage = (req, res) => {
  return res.render('homepage.ejs');
};
let postWebhook = (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function     
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};
let getWebhook = (req, res) => {
  // Your verify token. Should be a random string.


  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};
function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": `B???n v???a nh???n l??: "${received_message.text}". H??y g???i cho m??nh m???t b???c ???nh m?? ???? l?? th??? b???n c???n!`
    }
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "????y c?? ph???i th??? b???n ??ang mu???n kh??ng?",
            "subtitle": "B???n h??y nh??n n??t ??? d?????i ????? tr??? l???i.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Ch??nh l?? n??!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "Kh??ng ph???i!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }

  // Send the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case 'yes':
      response = { "text": "Ch??ng t??i s??? nhanh ch??ng li??n h??? l???i v???i b???n" }
      // code block
      break;
    case 'no':
      response = { "text": "Th??? h??y g???i cho m??nh m???t b???c h??nh m?? ???? th??? b???n mu???n." }
      // code block
      break;
    case 'GET_STARTED':
      await chatbotSevices.handleGetStarted(sender_psid,response);
    
      break;
    default:
      response = { "text": `I dont know response with postback ${payload}` }
    // code block
  }

  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v11.0/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

let setupProfile =(req,res) => {
   // Construct the message body
   let request_body = {
    "get_started":{"payload": "GET_STARTED"},
    "whitelistend_domains": ["https://chatbot-demo-siz.herokuapp.com/"]
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": `https://graph.facebook.com/v11.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    console.log(body)
    if (!err) {
      console.log('Setup user profile success!')
    } else {
      console.error("Unable to Setup user profile:" + err);
    }
  });

 }
module.exports = {
  getHomePage: getHomePage,//key :value
  getWebhook: getWebhook,
  postWebhook: postWebhook,
  setupProfile: setupProfile,
}