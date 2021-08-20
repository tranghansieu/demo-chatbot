require("dotenv").config();
import request from "request";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
let callSendAPI = (sender_psid,response) => {
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
        console.log(body)
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
let handleGetStarted = (sender_psid) => {
    return new Promise(async(resolve,reject) =>{
        try {
            let response = {"text": "Chúc một ngày tốt lành.Chúng tôi có thể giúp gì cho bạn."}
            await callSendAPI(sender_psid,response);
            resolve('done');
        } catch (e) {
            reject(e);
        }
    })


}
module.exports = {
    handleGetStarted: handleGetStarted,
}